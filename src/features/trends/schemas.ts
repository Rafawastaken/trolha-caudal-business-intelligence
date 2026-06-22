import { z } from 'zod'

// Modelo canónico interno de Tendências. Endpoints: /daily, /monthly, /weekday,
// /hour, /abandoned-carts. O mapeamento dos dados reais vive em api.ts.

export const dailyPointSchema = z.object({
  date: z.string(), // yyyy-mm-dd
  orders: z.number(),
  revenue: z.number(),
})
export type DailyPoint = z.infer<typeof dailyPointSchema>

export const monthlyPointSchema = z.object({
  month: z.string(), // yyyy-mm
  orders: z.number(),
  revenue: z.number(),
})
export type MonthlyPoint = z.infer<typeof monthlyPointSchema>

export const weekdayPointSchema = z.object({
  weekday: z.number(), // 1=Dom … 7=Sáb (ordem da API)
  label: z.string(),
  orders: z.number(),
  revenue: z.number(),
})
export type WeekdayPoint = z.infer<typeof weekdayPointSchema>

export const hourPointSchema = z.object({
  hour: z.number(), // 0–23
  orders: z.number(),
})
export type HourPoint = z.infer<typeof hourPointSchema>

export const abandonedCartsSchema = z.object({
  abandoned: z.number(),
  converted: z.number(),
  /** Taxa de abandono em pontos percentuais (87.2 = 87,2%). */
  rate: z.number(),
})
export type AbandonedCarts = z.infer<typeof abandonedCartsSchema>

// --- Tráfego first-party (cookieless) -------------------------------------

/** Métrica com valor atual, anterior e variação (fração: 0.12 = +12%). */
export const trafficMetricSchema = z.object({
  value: z.number(),
  previous: z.number(),
  delta: z.number(),
})
export type TrafficMetric = z.infer<typeof trafficMetricSchema>

export const trafficDailyPointSchema = z.object({
  date: z.string(),
  pageViews: z.number(),
  visits: z.number(),
  productViews: z.number(),
})

export const trafficSchema = z.object({
  pageViews: trafficMetricSchema,
  visits: trafficMetricSchema,
  productViews: trafficMetricSchema,
  daily: z.array(trafficDailyPointSchema),
})
export type Traffic = z.infer<typeof trafficSchema>

// --- Consentimento de cookies ---------------------------------------------

export const consentSchema = z.object({
  granted: z.number(),
  denied: z.number(),
  partial: z.number(),
  analyticsGranted: z.number(),
  /** % de quem decidiu que aceitou (fração 0..1). */
  grantRate: z.number(),
  /** % de visitantes que tomaram uma decisão (fração 0..1). */
  decisionRate: z.number(),
})
export type Consent = z.infer<typeof consentSchema>

// --- Carrinhos abandonados (detalhe) --------------------------------------

export const abandonedCartRowSchema = z.object({
  id: z.number().optional(),
  customer: z.string(),
  email: z.string().optional(),
  /** Nº de itens no carrinho. */
  items: z.number(),
  /** Valor estimado (s/ IVA). */
  value: z.number(),
})
export type AbandonedCartRow = z.infer<typeof abandonedCartRowSchema>

export const abandonedCartsDetailSchema = z.object({
  summary: z.object({
    carts: z.number(),
    withCustomer: z.number(),
    value: z.number(),
  }),
  rows: z.array(abandonedCartRowSchema),
})
export type AbandonedCartsDetail = z.infer<typeof abandonedCartsDetailSchema>
