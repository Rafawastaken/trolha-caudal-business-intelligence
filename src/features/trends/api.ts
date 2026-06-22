import { api } from '@/lib/api'
import { z } from 'zod'

import {
  abandonedCartsSchema,
  abandonedCartsDetailSchema,
  consentSchema,
  dailyPointSchema,
  hourPointSchema,
  monthlyPointSchema,
  trafficSchema,
  weekdayPointSchema,
  type AbandonedCarts,
  type AbandonedCartsDetail,
  type Consent,
  type DailyPoint,
  type HourPoint,
  type MonthlyPoint,
  type Traffic,
  type WeekdayPoint,
} from './schemas'

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) {
    return Number(v)
  }
  return 0
}

const rec = (v: unknown): Record<string, unknown> =>
  (v ?? {}) as Record<string, unknown>

/** Variação como fração (0.12 = +12%), tolerante a base zero. */
function frac(now: number, prev: number): number {
  return prev === 0 ? 0 : (now - prev) / prev
}

/**
 * Lê uma métrica {value, previous, delta} tolerando dois layouts da API:
 *  (a) por-métrica: `cur[key] = { value, previous, delta }`
 *  (b) nivelado: `cur[key]` = valor e `prev[key]` = anterior.
 * O delta é sempre recalculado da nossa fração (evita ambiguidade pp vs fração).
 */
function readMetric(
  cur: Record<string, unknown>,
  prev: Record<string, unknown>,
  key: string,
): { value: number; previous: number; delta: number } {
  const c = cur[key]
  if (c && typeof c === 'object') {
    const o = rec(c)
    const value = toNumber(o.value ?? o.current ?? o.count)
    const previous = toNumber(o.previous ?? o.prev)
    return { value, previous, delta: frac(value, previous) }
  }
  const value = toNumber(c)
  const previous = toNumber(prev[key])
  return { value, previous, delta: frac(value, previous) }
}

/** Normaliza uma taxa para fração: 72.5 → 0.725; 0.725 → 0.725. */
function asFraction(v: unknown): number {
  const n = toNumber(v)
  return n > 1 ? n / 100 : n
}

export async function fetchDaily(
  from: string,
  to: string,
): Promise<DailyPoint[]> {
  const raw = await api<unknown>('/kpi-api/daily', { params: { from, to } })
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const p = (it ?? {}) as Record<string, unknown>
    return {
      date: String(p.date ?? ''),
      orders: toNumber(p.orders),
      revenue: toNumber(p.revenue),
    }
  })
  return z.array(dailyPointSchema).parse(items)
}

export async function fetchMonthly(
  from: string,
  to: string,
): Promise<MonthlyPoint[]> {
  const raw = await api<unknown>('/kpi-api/monthly', { params: { from, to } })
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const p = (it ?? {}) as Record<string, unknown>
    return {
      month: String(p.month ?? ''),
      orders: toNumber(p.orders),
      revenue: toNumber(p.revenue),
    }
  })
  return z.array(monthlyPointSchema).parse(items)
}

export async function fetchWeekday(
  from: string,
  to: string,
): Promise<WeekdayPoint[]> {
  const raw = await api<unknown>('/kpi-api/weekday', { params: { from, to } })
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const p = (it ?? {}) as Record<string, unknown>
    return {
      weekday: toNumber(p.weekday ?? p.dow),
      label: String(p.label ?? ''),
      orders: toNumber(p.orders),
      revenue: toNumber(p.revenue),
    }
  })
  return z
    .array(weekdayPointSchema)
    .parse(items)
    .sort((a, b) => a.weekday - b.weekday)
}

export async function fetchHour(from: string, to: string): Promise<HourPoint[]> {
  const raw = await api<unknown>('/kpi-api/hour', { params: { from, to } })
  // A API só devolve horas com encomendas — preenchemos 0–23 para o gráfico.
  const byHour = new Map<number, number>()
  for (const it of Array.isArray(raw) ? raw : []) {
    const p = (it ?? {}) as Record<string, unknown>
    byHour.set(toNumber(p.hour), toNumber(p.orders))
  }
  const items = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    orders: byHour.get(hour) ?? 0,
  }))
  return z.array(hourPointSchema).parse(items)
}

export async function fetchTraffic(from: string, to: string): Promise<Traffic> {
  const raw = rec(await api<unknown>('/kpi-api/traffic', { params: { from, to } }))
  // Aceita { current, previous, daily } ou os campos diretamente no objeto.
  const cur = rec(raw.current ?? raw)
  const prev = rec(raw.previous ?? raw.prev)
  const dailyRaw = Array.isArray(raw.daily)
    ? raw.daily
    : Array.isArray(raw.series)
      ? raw.series
      : []
  return trafficSchema.parse({
    pageViews: readMetric(cur, prev, 'page_views'),
    visits: readMetric(cur, prev, 'visits'),
    productViews: readMetric(cur, prev, 'product_views'),
    daily: dailyRaw.map((it) => {
      const p = rec(it)
      return {
        date: String(p.date ?? ''),
        pageViews: toNumber(p.page_views ?? p.pageViews),
        visits: toNumber(p.visits),
        productViews: toNumber(p.product_views ?? p.productViews),
      }
    }),
  })
}

export async function fetchConsent(from: string, to: string): Promise<Consent> {
  const o = rec(await api<unknown>('/kpi-api/consent', { params: { from, to } }))
  // API: { granted, denied, partial, analytics_granted, grant_rate, decision_rate }
  return consentSchema.parse({
    granted: toNumber(o.granted ?? o.accepted),
    denied: toNumber(o.denied ?? o.rejected),
    partial: toNumber(o.partial),
    analyticsGranted: toNumber(o.analytics_granted ?? o.analyticsGranted),
    grantRate: asFraction(o.grant_rate ?? o.grantRate),
    decisionRate: asFraction(o.decision_rate ?? o.decisionRate),
  })
}

export async function fetchAbandonedCartsDetail(
  from: string,
  to: string,
  limit = 50,
): Promise<AbandonedCartsDetail> {
  // with_customer=1 → só carrinhos com cliente associado (têm contacto, são os
  // recuperáveis). O resumo vem já restrito a este subconjunto.
  const raw = rec(
    await api<unknown>('/kpi-api/abandoned-carts-detail', {
      params: { from, to, limit, with_customer: 1 },
    }),
  )
  const s = rec(raw.summary ?? raw)
  const rowsRaw = Array.isArray(raw.rows)
    ? raw.rows
    : Array.isArray(raw.carts)
      ? raw.carts
      : []
  return abandonedCartsDetailSchema.parse({
    summary: {
      carts: toNumber(s.carts ?? s.total ?? s.count),
      withCustomer: toNumber(s.com_cliente ?? s.with_customer ?? s.withCustomer),
      value: toNumber(s.valor ?? s.value ?? s.total_value),
    },
    rows: rowsRaw.map((it) => {
      const r = rec(it)
      const items = Array.isArray(r.items)
        ? r.items.length
        : toNumber(r.itens ?? r.items ?? r.n_items ?? r.products)
      return {
        id: r.id_cart != null ? toNumber(r.id_cart) : toNumber(r.cart_id ?? r.id) || undefined,
        customer: String(r.cliente ?? r.customer ?? r.name ?? '—'),
        email: typeof r.email === 'string' && r.email ? r.email : undefined,
        items,
        value: toNumber(r.valor ?? r.value ?? r.total),
      }
    }),
  })
}

export async function fetchAbandonedCarts(
  from: string,
  to: string,
): Promise<AbandonedCarts> {
  const raw = await api<unknown>('/kpi-api/abandoned-carts', {
    params: { from, to },
  })
  const o = (raw ?? {}) as Record<string, unknown>
  return abandonedCartsSchema.parse({
    abandoned: toNumber(o.abandoned),
    converted: toNumber(o.converted),
    rate: toNumber(o.rate),
  })
}
