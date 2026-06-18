import { z } from 'zod'

// Modelo canónico interno das Encomendas. Os endpoints (/orders, /orders-list,
// /order, /payments, /states, /refunds) ainda não têm shapes documentadas — o
// mapeamento dos dados reais vive em api.ts; estes schemas são a verdade da UI.

export const ordersSummarySchema = z.object({
  created: z.number(),
  valid: z.number(),
  revenue: z.number(),
  avgTicket: z.number(),
})
export type OrdersSummary = z.infer<typeof ordersSummarySchema>

export const refundsSchema = z.object({
  amount: z.number(),
  count: z.number(),
})
export type Refunds = z.infer<typeof refundsSchema>

export const orderRowSchema = z.object({
  id: z.number(),
  reference: z.string(),
  customer: z.string(),
  date: z.string(), // ISO datetime
  total: z.number(),
  stateId: z.number(),
  /** Label do estado vindo da API (quando os ids não batem com o catálogo). */
  stateLabel: z.string().optional(),
  payment: z.string(),
})
export type OrderRow = z.infer<typeof orderRowSchema>

export const pageMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
  pages: z.number(),
})
export type PageMeta = z.infer<typeof pageMetaSchema>

export const ordersListSchema = z.object({
  rows: z.array(orderRowSchema),
  meta: pageMetaSchema,
})
export type OrdersList = z.infer<typeof ordersListSchema>

export const paymentBreakdownItemSchema = z.object({
  method: z.string(),
  orders: z.number(),
  revenue: z.number(),
})
export type PaymentBreakdownItem = z.infer<typeof paymentBreakdownItemSchema>

export const stateBreakdownItemSchema = z.object({
  id: z.number(),
  count: z.number(),
})
export type StateBreakdownItem = z.infer<typeof stateBreakdownItemSchema>

// ---- Detalhe ----

export const orderLineSchema = z.object({
  name: z.string(),
  sku: z.string().optional(),
  qty: z.number(),
  unitPrice: z.number(),
  total: z.number(),
})
export type OrderLine = z.infer<typeof orderLineSchema>

export const orderHistoryEntrySchema = z.object({
  stateId: z.number(),
  at: z.string(), // ISO datetime
})
export type OrderHistoryEntry = z.infer<typeof orderHistoryEntrySchema>

export const orderDetailSchema = z.object({
  id: z.number(),
  reference: z.string(),
  customer: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  date: z.string(),
  stateId: z.number(),
  payment: z.string(),
  shippingCity: z.string().optional(),
  subtotal: z.number(),
  shipping: z.number(),
  discount: z.number(),
  total: z.number(),
  lines: z.array(orderLineSchema),
  history: z.array(orderHistoryEntrySchema),
})
export type OrderDetail = z.infer<typeof orderDetailSchema>

// Filtros da lista (estado da UI → params da API).
export type OrdersListParams = {
  from: string
  to: string
  page: number
  per_page: number
  state?: number
  payment?: string
  search?: string
}
