import { z } from 'zod'

// Modelo canónico interno de Produtos & Stock. Os endpoints (/top-products,
// /categories, /low-stock, /vouchers) usam snake_case; o mapeamento dos dados
// reais vive em api.ts e estes schemas são a verdade da UI.

export const topProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  qty: z.number(),
  revenue: z.number(),
})
export type TopProduct = z.infer<typeof topProductSchema>

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  qty: z.number(),
  revenue: z.number(),
})
export type Category = z.infer<typeof categorySchema>

export const lowStockItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  /** Stock atual (pode ser ≤ 0 = esgotado/encomendas pendentes). */
  quantity: z.number(),
})
export type LowStockItem = z.infer<typeof lowStockItemSchema>

export const voucherSchema = z.object({
  code: z.string(),
  /** Nº de utilizações do cupão no período. */
  uses: z.number(),
  /** Total de desconto dado pelo cupão. */
  discount: z.number(),
})
export type Voucher = z.infer<typeof voucherSchema>
