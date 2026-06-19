import { api } from '@/lib/api'

import {
  overviewSchema,
  type DashboardKpis,
  type DailyPoint,
  type FunnelLevel,
  type Overview,
} from './schemas'

// O dashboard junta dois endpoints reais no modelo canónico `Overview`:
//   GET /kpi-api/kpis     → bundle de KPIs (current/previous/deltas). `units_sold`,
//                           `new_customers` e `abandonment_rate` SÓ existem aqui.
//   GET /kpi-api/overview → bundle de carga inicial com o funil + a série diária
//                           (entre outros que o dashboard ainda não usa).
// Buscamos ambos em paralelo e fundimo-los; `normalizeOverview` é o único ponto
// a ajustar se a shape da API mudar.
export async function fetchOverview(
  from: string,
  to: string,
): Promise<Overview> {
  const [kpisRaw, overviewRaw] = await Promise.all([
    api<unknown>('/kpi-api/kpis', { params: { from, to } }),
    api<unknown>('/kpi-api/overview', { params: { from, to } }),
  ])
  return normalizeOverview(kpisRaw, overviewRaw)
}

function toNum(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) {
    return Number(v)
  }
  return 0
}

/** Variação como fração (0.12 = +12%), tolerante a base zero. */
function frac(now: number, prev: number): number {
  return prev === 0 ? 0 : (now - prev) / prev
}

function metric(now: number, prev: number) {
  return { value: now, previous: prev, delta: frac(now, prev) }
}

function normalizeOverview(kpisRaw: unknown, overviewRaw: unknown): Overview {
  const k = (kpisRaw ?? {}) as Record<string, unknown>
  const cur = (k.current ?? {}) as Record<string, unknown>
  const prev = (k.previous ?? {}) as Record<string, unknown>

  // A API devolve `abandonment_rate` em pontos percentuais (87.3 = 87,3%); o
  // modelo canónico guarda frações (a UI usa formatPercent, que espera 0..1).
  const kpis: DashboardKpis = {
    revenue: metric(toNum(cur.revenue), toNum(prev.revenue)),
    orders: metric(toNum(cur.orders_all), toNum(prev.orders_all)),
    validOrders: metric(toNum(cur.orders_valid), toNum(prev.orders_valid)),
    avgTicket: metric(toNum(cur.avg_ticket), toNum(prev.avg_ticket)),
    unitsSold: metric(toNum(cur.units_sold), toNum(prev.units_sold)),
    newCustomers: metric(toNum(cur.new_customers), toNum(prev.new_customers)),
    abandonmentRate: metric(
      toNum(cur.abandonment_rate) / 100,
      toNum(prev.abandonment_rate) / 100,
    ),
  }

  const ov = (overviewRaw ?? {}) as Record<string, unknown>

  const funnel: FunnelLevel[] = (
    Array.isArray(ov.funnel) ? ov.funnel : []
  ).map((lvl) => {
    const l = (lvl ?? {}) as Record<string, unknown>
    // `drop_from_prev` vem em pontos percentuais (99.8 = perdeu 99,8%); null no
    // topo e em saltos sem base. Convertemos para fração; null → 0.
    const drop = l.drop_from_prev
    return {
      key: String(l.key ?? ''),
      label: String(l.label ?? l.key ?? ''),
      count: toNum(l.count),
      dropoff: drop == null ? 0 : toNum(drop) / 100,
    }
  })

  const daily: DailyPoint[] = (
    Array.isArray(ov.daily) ? ov.daily : []
  ).map((point) => {
    const p = (point ?? {}) as Record<string, unknown>
    return {
      date: String(p.date ?? ''),
      orders: toNum(p.orders),
      revenue: toNum(p.revenue),
    }
  })

  return overviewSchema.parse({ kpis, funnel, daily })
}
