import { api } from '@/lib/api'
import { z } from 'zod'

import {
  customerMixSchema,
  geoRegionSchema,
  topCustomerSchema,
  type CustomerMix,
  type GeoRegion,
  type TopCustomer,
} from './schemas'

// A API usa snake_case (id_customer, customer…). Cada fetch mapeia para o
// modelo canónico; é o ponto único a ajustar se a shape mudar.

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) {
    return Number(v)
  }
  return 0
}

export async function fetchTopCustomers(
  from: string,
  to: string,
  limit = 10,
): Promise<TopCustomer[]> {
  const raw = await api<unknown>('/kpi-api/top-customers', {
    params: { from, to, limit },
  })
  // API: [{ id_customer, customer, orders, revenue }]
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const c = (it ?? {}) as Record<string, unknown>
    return {
      id: toNumber(c.id_customer ?? c.id),
      name: String(c.customer ?? c.name ?? '—'),
      orders: toNumber(c.orders ?? c.orders_count),
      revenue: toNumber(c.revenue),
    }
  })
  return z.array(topCustomerSchema).parse(items)
}

export async function fetchCustomerMix(
  from: string,
  to: string,
): Promise<CustomerMix> {
  const raw = await api<unknown>('/kpi-api/customer-mix', {
    params: { from, to },
  })
  // API: { new, returning }
  const o = (raw ?? {}) as Record<string, unknown>
  return customerMixSchema.parse({
    newCustomers: toNumber(o.new ?? o.new_customers ?? o.novos),
    returning: toNumber(o.returning ?? o.recurring ?? o.recorrentes),
  })
}

export async function fetchGeography(
  from: string,
  to: string,
  limit = 20,
): Promise<GeoRegion[]> {
  const raw = await api<unknown>('/kpi-api/geography', {
    params: { from, to, limit },
  })
  // API: [{ region, orders, revenue }]
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const g = (it ?? {}) as Record<string, unknown>
    return {
      region: String(g.region ?? g.city ?? g.district ?? '—'),
      orders: toNumber(g.orders ?? g.orders_count),
      revenue: toNumber(g.revenue),
    }
  })
  return z.array(geoRegionSchema).parse(items)
}
