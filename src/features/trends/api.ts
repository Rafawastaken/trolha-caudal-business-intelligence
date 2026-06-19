import { api } from '@/lib/api'
import { z } from 'zod'

import {
  abandonedCartsSchema,
  dailyPointSchema,
  hourPointSchema,
  monthlyPointSchema,
  weekdayPointSchema,
  type AbandonedCarts,
  type DailyPoint,
  type HourPoint,
  type MonthlyPoint,
  type WeekdayPoint,
} from './schemas'

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) {
    return Number(v)
  }
  return 0
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
