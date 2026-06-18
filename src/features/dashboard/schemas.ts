import { z } from 'zod'

// Modelo canónico interno do dashboard. A API (`/kpi-api/overview`, `/kpis`,
// `/funnel`) ainda não tem schemas de resposta documentados — quando ligarmos
// os dados reais, o mapeamento vive em `api.ts` (normalizeOverview) e estes
// schemas mantêm-se como a fonte de verdade dos tipos da UI.

/** Uma métrica com valor atual, período anterior e variação (fração: 0.12 = +12%). */
export const kpiMetricSchema = z.object({
  value: z.number(),
  previous: z.number(),
  delta: z.number(),
})
export type KpiMetric = z.infer<typeof kpiMetricSchema>

export const dashboardKpisSchema = z.object({
  revenue: kpiMetricSchema,
  orders: kpiMetricSchema,
  validOrders: kpiMetricSchema,
  avgTicket: kpiMetricSchema,
  unitsSold: kpiMetricSchema,
  newCustomers: kpiMetricSchema,
  abandonmentRate: kpiMetricSchema,
})
export type DashboardKpis = z.infer<typeof dashboardKpisSchema>

/** Nível do funil. `dropoff` = fração perdida no salto anterior (0..1). */
export const funnelLevelSchema = z.object({
  key: z.string(),
  label: z.string(),
  count: z.number(),
  dropoff: z.number(),
})
export type FunnelLevel = z.infer<typeof funnelLevelSchema>

export const dailyPointSchema = z.object({
  date: z.string(), // yyyy-mm-dd
  orders: z.number(),
  revenue: z.number(),
})
export type DailyPoint = z.infer<typeof dailyPointSchema>

export const overviewSchema = z.object({
  kpis: dashboardKpisSchema,
  funnel: z.array(funnelLevelSchema),
  daily: z.array(dailyPointSchema),
})
export type Overview = z.infer<typeof overviewSchema>
