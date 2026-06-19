import { api, apiWithMeta } from '@/lib/api'

import {
  ordersSummarySchema,
  orderDetailSchema,
  orderRowSchema,
  pageMetaSchema,
  paymentBreakdownItemSchema,
  refundsSchema,
  stateBreakdownItemSchema,
  type OrderDetail,
  type OrdersList,
  type OrdersListParams,
  type OrdersSummary,
  type PaymentBreakdownItem,
  type Refunds,
  type StateBreakdownItem,
} from './schemas'
import { z } from 'zod'

// A API real usa snake_case e nomes diferentes do modelo canónico da UI. Cada
// `normalize*`/mapeamento abaixo é o ponto único a ajustar se a shape mudar.

function toNumber(v: unknown): number | undefined {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) {
    return Number(v)
  }
  return undefined
}

export async function fetchOrdersSummary(
  from: string,
  to: string,
): Promise<OrdersSummary> {
  const raw = await api<unknown>('/kpi-api/orders', { params: { from, to } })
  const o = (raw ?? {}) as Record<string, unknown>
  // API: { orders_all, orders_valid, revenue, avg_ticket }
  return ordersSummarySchema.parse({
    created: toNumber(o.orders_all) ?? 0,
    valid: toNumber(o.orders_valid) ?? 0,
    revenue: toNumber(o.revenue) ?? 0,
    avgTicket: toNumber(o.avg_ticket) ?? 0,
  })
}

export async function fetchRefunds(from: string, to: string): Promise<Refunds> {
  const raw = await api<unknown>('/kpi-api/refunds', { params: { from, to } })
  const o = (raw ?? {}) as Record<string, unknown>
  // API: { total_refunded, refunded_orders }
  return refundsSchema.parse({
    amount: toNumber(o.total_refunded) ?? 0,
    count: toNumber(o.refunded_orders) ?? 0,
  })
}

export async function fetchOrdersList(
  params: OrdersListParams,
): Promise<OrdersList> {
  const { data, meta } = await apiWithMeta<unknown>('/kpi-api/orders-list', {
    params: {
      from: params.from,
      to: params.to,
      page: params.page,
      per_page: params.per_page,
      state: params.state,
      payment: params.payment,
      search: params.search,
    },
  })
  const rows = Array.isArray(data) ? data.map(normalizeOrderRow) : []
  return {
    rows: z.array(orderRowSchema).parse(rows),
    meta: pageMetaSchema.parse(meta),
  }
}

/**
 * Mapeia uma linha crua de /orders-list para o modelo canónico. A API real dá
 * `id_order`, `state` como NOME (string) e `valid` (bool); toleramos variações.
 */
function normalizeOrderRow(raw: unknown): unknown {
  const o = (raw ?? {}) as Record<string, unknown>

  const stateSrc =
    o.stateId ?? o.state_id ?? o.id_state ?? o.state ?? o.status ?? o.estado
  let stateId: number | undefined
  let stateLabel: string | undefined
  if (stateSrc && typeof stateSrc === 'object') {
    const s = stateSrc as Record<string, unknown>
    stateId = toNumber(s.id ?? s.state_id)
    stateLabel =
      typeof s.name === 'string'
        ? s.name
        : typeof s.label === 'string'
          ? s.label
          : undefined
  } else if (toNumber(stateSrc) !== undefined) {
    stateId = toNumber(stateSrc)
  } else if (typeof stateSrc === 'string') {
    stateLabel = stateSrc
  }

  return {
    id:
      toNumber(
        o.id_order ?? o.id ?? o.order_id ?? o.orderId ?? o.encomenda_id,
      ) ?? 0,
    reference: String(o.reference ?? o.ref ?? o.id ?? ''),
    customer: String(o.customer ?? o.client ?? o.name ?? '—'),
    date: String(o.date ?? o.created_at ?? o.created ?? o.data ?? ''),
    total: toNumber(o.total ?? o.amount ?? o.value) ?? 0,
    stateId: stateId ?? 0,
    stateLabel,
    payment: String(o.payment ?? o.payment_method ?? o.metodo ?? '—'),
  }
}

export async function fetchPayments(
  from: string,
  to: string,
): Promise<PaymentBreakdownItem[]> {
  const raw = await api<unknown>('/kpi-api/payments', { params: { from, to } })
  // API: [{ payment, orders_all, orders_valid, revenue }]
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const p = (it ?? {}) as Record<string, unknown>
    return {
      method: String(p.payment ?? p.method ?? '—'),
      orders: toNumber(p.orders_valid ?? p.orders ?? p.orders_all) ?? 0,
      revenue: toNumber(p.revenue) ?? 0,
    }
  })
  return z.array(paymentBreakdownItemSchema).parse(items)
}

export async function fetchStates(
  from: string,
  to: string,
): Promise<StateBreakdownItem[]> {
  const raw = await api<unknown>('/kpi-api/states', { params: { from, to } })
  // API: [{ id_state, state_name, orders_count }]
  const items = (Array.isArray(raw) ? raw : []).map((it) => {
    const s = (it ?? {}) as Record<string, unknown>
    return {
      id: toNumber(s.id_state ?? s.id) ?? 0,
      label:
        typeof s.state_name === 'string'
          ? s.state_name
          : typeof s.label === 'string'
            ? s.label
            : undefined,
      count: toNumber(s.orders_count ?? s.count) ?? 0,
    }
  })
  return z.array(stateBreakdownItemSchema).parse(items)
}

export async function fetchOrder(id: number): Promise<OrderDetail> {
  const raw = await api<unknown>('/kpi-api/order', { params: { id } })
  return normalizeOrderDetail(raw)
}

/**
 * Mapeia o detalhe cru de /order para o modelo canónico. A API aninha o
 * cabeçalho em `order`, dá estados por NOME (sem id) e linhas/histórico em
 * snake_case. Os totais são reconciliados (subtotal = total − portes + desconto).
 */
function normalizeOrderDetail(raw: unknown): OrderDetail {
  const d = (raw ?? {}) as Record<string, unknown>
  const o = (d.order ?? {}) as Record<string, unknown>

  const total = toNumber(o.total) ?? 0
  const shipping = toNumber(o.shipping ?? o.shipping_cost) ?? 0
  const discount = toNumber(o.discount ?? o.total_discount) ?? 0

  const lines = (Array.isArray(d.lines) ? d.lines : []).map((l) => {
    const ln = (l ?? {}) as Record<string, unknown>
    return {
      name: String(ln.name ?? '—'),
      sku: ln.product_id != null ? String(ln.product_id) : undefined,
      qty: toNumber(ln.quantity ?? ln.qty) ?? 0,
      unitPrice: toNumber(ln.unit_price ?? ln.unitPrice) ?? 0,
      total: toNumber(ln.total) ?? 0,
    }
  })

  const history = (Array.isArray(d.history) ? d.history : []).map((h) => {
    const he = (h ?? {}) as Record<string, unknown>
    return {
      label:
        typeof he.state === 'string'
          ? he.state
          : typeof he.label === 'string'
            ? he.label
            : undefined,
      stateId: toNumber(he.id_state ?? he.state_id),
      at: String(he.date ?? he.at ?? ''),
    }
  })

  return orderDetailSchema.parse({
    id: toNumber(o.id_order ?? o.id) ?? 0,
    reference: String(o.reference ?? ''),
    customer: String(o.customer ?? '—'),
    email: typeof o.email === 'string' ? o.email : undefined,
    phone: typeof o.phone === 'string' ? o.phone : undefined,
    date: String(o.date ?? ''),
    stateId: 0,
    stateLabel: typeof o.state === 'string' ? o.state : undefined,
    payment: String(o.payment ?? '—'),
    shippingCity:
      typeof o.shipping_city === 'string' ? o.shipping_city : undefined,
    subtotal: Math.max(0, total - shipping + discount),
    shipping,
    discount,
    total,
    lines,
    history,
  })
}
