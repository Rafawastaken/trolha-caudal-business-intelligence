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

// NOTA: os endpoints ainda não têm shapes documentadas — cada `normalize*` é o
// único ponto a ajustar quando virmos os dados reais. Por agora fazem parse
// direto da shape canónica.

export async function fetchOrdersSummary(
  from: string,
  to: string,
): Promise<OrdersSummary> {
  const raw = await api<unknown>('/kpi-api/orders', { params: { from, to } })
  return ordersSummarySchema.parse(raw)
}

export async function fetchRefunds(from: string, to: string): Promise<Refunds> {
  const raw = await api<unknown>('/kpi-api/refunds', { params: { from, to } })
  return refundsSchema.parse(raw)
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

function toNumber(v: unknown): number | undefined {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) {
    return Number(v)
  }
  return undefined
}

/**
 * Mapeia uma linha crua de /orders-list para o modelo canónico, tolerando
 * variações de nomes de campos (id/state vêm com nomes diferentes na API real).
 * Ajustar quando confirmarmos a shape exata.
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
      toNumber(o.id ?? o.order_id ?? o.orderId ?? o.id_order ?? o.encomenda_id) ??
      0,
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
  return z.array(paymentBreakdownItemSchema).parse(raw)
}

export async function fetchStates(
  from: string,
  to: string,
): Promise<StateBreakdownItem[]> {
  const raw = await api<unknown>('/kpi-api/states', { params: { from, to } })
  return z.array(stateBreakdownItemSchema).parse(raw)
}

export async function fetchOrder(id: number): Promise<OrderDetail> {
  const raw = await api<unknown>('/kpi-api/order', { params: { id } })
  return orderDetailSchema.parse(raw)
}
