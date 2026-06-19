import { api } from '@/lib/api'
import { z } from 'zod'

import {
  categorySchema,
  lowStockItemSchema,
  topProductSchema,
  voucherSchema,
  type Category,
  type LowStockItem,
  type TopProduct,
  type Voucher,
} from './schemas'

// A API usa snake_case (product_id, id_category, category_name…). Cada fetch
// mapeia para o modelo canónico; é o ponto único a ajustar se a shape mudar.

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) {
    return Number(v)
  }
  return 0
}

export async function fetchTopProducts(
  from: string,
  to: string,
  limit = 10,
): Promise<TopProduct[]> {
  const raw = await api<unknown>('/kpi-api/top-products', {
    params: { from, to, limit },
  })
  // API: [{ product_id, name, qty, revenue }]
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const p = (it ?? {}) as Record<string, unknown>
    return {
      id: toNumber(p.product_id ?? p.id),
      name: String(p.name ?? '—'),
      qty: toNumber(p.qty ?? p.quantity),
      revenue: toNumber(p.revenue),
    }
  })
  return z.array(topProductSchema).parse(items)
}

export async function fetchCategories(
  from: string,
  to: string,
  limit = 12,
): Promise<Category[]> {
  const raw = await api<unknown>('/kpi-api/categories', {
    params: { from, to, limit },
  })
  // API: [{ id_category, category_name, qty, revenue }]
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const c = (it ?? {}) as Record<string, unknown>
    return {
      id: toNumber(c.id_category ?? c.id),
      name: String(c.category_name ?? c.name ?? '—'),
      qty: toNumber(c.qty ?? c.quantity),
      revenue: toNumber(c.revenue),
    }
  })
  return z.array(categorySchema).parse(items)
}

export async function fetchLowStock(
  threshold = 5,
  limit = 50,
): Promise<LowStockItem[]> {
  // Sem intervalo de datas — é um retrato do stock atual (nível produto).
  const raw = await api<unknown>('/kpi-api/low-stock', {
    params: { threshold, limit },
  })
  // API: [{ product_id, name, quantity }]
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const p = (it ?? {}) as Record<string, unknown>
    return {
      id: toNumber(p.product_id ?? p.id),
      name: String(p.name ?? '—'),
      quantity: toNumber(p.quantity ?? p.qty ?? p.stock),
    }
  })
  return z.array(lowStockItemSchema).parse(items)
}

export async function fetchVouchers(
  from: string,
  to: string,
  limit = 20,
): Promise<Voucher[]> {
  const raw = await api<unknown>('/kpi-api/vouchers', {
    params: { from, to, limit },
  })
  // Shape não observável (loja sem cupões registados); mapeamento tolerante.
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const v = (it ?? {}) as Record<string, unknown>
    return {
      code: String(v.code ?? v.voucher ?? v.name ?? '—'),
      uses: toNumber(v.uses ?? v.count ?? v.orders ?? v.used),
      discount: toNumber(v.discount ?? v.total_discount ?? v.amount),
    }
  })
  return z.array(voucherSchema).parse(items)
}
