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
