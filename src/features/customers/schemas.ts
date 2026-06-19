import { z } from 'zod'

// Modelo canónico interno de Clientes. Os endpoints (/top-customers,
// /customer-mix, /geography) usam snake_case; o mapeamento dos dados reais vive
// em api.ts e estes schemas são a verdade da UI.

export const topCustomerSchema = z.object({
  id: z.number(),
  name: z.string(),
  orders: z.number(),
  revenue: z.number(),
})
export type TopCustomer = z.infer<typeof topCustomerSchema>

export const customerMixSchema = z.object({
  /** Clientes que compraram pela 1ª vez no período. */
  newCustomers: z.number(),
  /** Clientes recorrentes (já tinham comprado antes). */
  returning: z.number(),
})
export type CustomerMix = z.infer<typeof customerMixSchema>

export const geoRegionSchema = z.object({
  region: z.string(),
  orders: z.number(),
  revenue: z.number(),
})
export type GeoRegion = z.infer<typeof geoRegionSchema>
