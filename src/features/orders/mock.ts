import { toIsoDate } from '@/lib/dates'

import { isValidState, ORDER_STATES } from './order-states'
import type {
  OrderDetail,
  OrderRow,
  OrdersList,
  OrdersListParams,
  OrdersSummary,
  PaymentBreakdownItem,
  Refunds,
  StateBreakdownItem,
} from './schemas'

// Dataset de demonstração determinístico (loja de bombas de água). Gerado uma
// vez por carga; as funções abaixo filtram/paginam/agregam como a API faria.

const CUSTOMERS = [
  'Hidráulica Coelho, Lda',
  'João Sousa',
  'AgroRega Sul',
  'Manuel Tavares',
  'Quinta do Vale',
  'Rega Norte, Lda',
  'Bombas & Cia',
  'Ana Marques',
  'Construções Ferreira',
  'Pedro Antunes',
  'Câmara de Vagos',
  'Sérgio Lopes',
  'AquaTech Soluções',
  'Maria Fernandes',
  'Vinhas do Douro, SA',
  'Ricardo Pinto',
  'Estufas do Oeste',
  'Carlos Mendes',
  'Rega Fácil, Lda',
  'Hotel Mar Azul',
  'Tiago Rocha',
  'Adega Cooperativa',
  'Inês Carvalho',
  'Bricolage Central',
]

const PAYMENTS = [
  'Multibanco',
  'MB WAY',
  'Cartão de crédito',
  'PayPal',
  'Transferência bancária',
]

const CITIES = [
  'Lisboa',
  'Porto',
  'Aveiro',
  'Braga',
  'Coimbra',
  'Faro',
  'Setúbal',
  'Leiria',
  'Viseu',
  'Évora',
]

const PRODUCTS = [
  { name: 'Bomba submersível 1.5CV', price: 289.9 },
  { name: 'Eletrobomba autoescorvante 1CV', price: 159.9 },
  { name: 'Bomba periférica 0.5CV', price: 74.9 },
  { name: 'Pressostato regulável', price: 24.5 },
  { name: 'Depósito de pressão 100L', price: 199.0 },
  { name: 'Vaso de expansão 24L', price: 49.9 },
  { name: 'Bomba de superfície 1.5CV', price: 219.0 },
  { name: 'Kit rega gota-a-gota', price: 39.9 },
  { name: 'Mangueira reforçada 25m', price: 34.9 },
  { name: 'Filtro de água 3/4"', price: 18.9 },
  { name: 'Controlador de nível', price: 42.0 },
  { name: 'Bomba de drenagem 0.75CV', price: 129.9 },
]

// distribuição de estados (pesos) — maioria concluída/enviada
const STATE_WEIGHTS: Array<{ id: number; w: number }> = [
  { id: 1, w: 8 },
  { id: 2, w: 14 },
  { id: 3, w: 12 },
  { id: 4, w: 18 },
  { id: 5, w: 34 },
  { id: 6, w: 9 },
  { id: 7, w: 5 },
]

function makeRng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function pickWeightedState(r: number): number {
  const total = STATE_WEIGHTS.reduce((a, b) => a + b.w, 0)
  let acc = r * total
  for (const { id, w } of STATE_WEIGHTS) {
    acc -= w
    if (acc <= 0) return id
  }
  return 5
}

const TODAY = new Date()

const ALL_ORDERS: OrderRow[] = Array.from({ length: 184 }, (_, i) => {
  const rnd = makeRng(i + 7)
  const daysAgo = Math.floor(rnd() * 120)
  const d = new Date(TODAY)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(8 + Math.floor(rnd() * 12), Math.floor(rnd() * 60), 0, 0)
  const total = Math.round((30 + rnd() * 920) * 100) / 100
  return {
    id: 1000 + i,
    reference: `TRL-2026-${String(184 - i).padStart(5, '0')}`,
    customer: CUSTOMERS[Math.floor(rnd() * CUSTOMERS.length)],
    date: d.toISOString(),
    total,
    stateId: pickWeightedState(rnd()),
    payment: PAYMENTS[Math.floor(rnd() * PAYMENTS.length)],
  }
}).sort((a, b) => b.date.localeCompare(a.date))

function withinRange(iso: string, from: string, to: string): boolean {
  const day = iso.slice(0, 10)
  return day >= from && day <= to
}

function inRange(from: string, to: string): OrderRow[] {
  return ALL_ORDERS.filter((o) => withinRange(o.date, from, to))
}

export function mockOrdersSummary(from: string, to: string): OrdersSummary {
  const rows = inRange(from, to)
  const valid = rows.filter((o) => isValidState(o.stateId))
  const revenue = valid.reduce((a, o) => a + o.total, 0)
  return {
    created: rows.length,
    valid: valid.length,
    revenue,
    avgTicket: valid.length ? revenue / valid.length : 0,
  }
}

export function mockRefunds(from: string, to: string): Refunds {
  const refunded = inRange(from, to).filter((o) => o.stateId === 7)
  return {
    amount: refunded.reduce((a, o) => a + o.total, 0),
    count: refunded.length,
  }
}

export function mockOrdersList(params: OrdersListParams): OrdersList {
  const { from, to, page, per_page, state, payment, search } = params
  let rows = inRange(from, to)
  if (state) rows = rows.filter((o) => o.stateId === state)
  if (payment) {
    const p = payment.toLowerCase()
    rows = rows.filter((o) => o.payment.toLowerCase().includes(p))
  }
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q),
    )
  }
  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / per_page))
  const safePage = Math.min(page, pages)
  const start = (safePage - 1) * per_page
  return {
    rows: rows.slice(start, start + per_page),
    meta: { total, page: safePage, per_page, pages },
  }
}

export function mockPayments(from: string, to: string): PaymentBreakdownItem[] {
  const valid = inRange(from, to).filter((o) => isValidState(o.stateId))
  return PAYMENTS.map((method) => {
    const subset = valid.filter((o) => o.payment === method)
    return {
      method,
      orders: subset.length,
      revenue: subset.reduce((a, o) => a + o.total, 0),
    }
  })
    .filter((p) => p.orders > 0)
    .sort((a, b) => b.revenue - a.revenue)
}

export function mockStates(from: string, to: string): StateBreakdownItem[] {
  const rows = inRange(from, to)
  return ORDER_STATES.map((s) => ({
    id: s.id,
    count: rows.filter((o) => o.stateId === s.id).length,
  })).filter((s) => s.count > 0)
}

export function mockOrder(id: number): OrderDetail | null {
  const row = ALL_ORDERS.find((o) => o.id === id)
  if (!row) return null

  const rnd = makeRng(id + 99)
  const shipping = rnd() > 0.4 ? 6.9 : 0
  const discount = rnd() > 0.8 ? Math.round(rnd() * 20 * 100) / 100 : 0
  const subtotal = Math.max(0, row.total - shipping + discount)

  const lineCount = 1 + Math.floor(rnd() * 3)
  const lines = []
  let remaining = subtotal
  for (let i = 0; i < lineCount; i++) {
    const product = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)]
    const last = i === lineCount - 1
    const qty = 1 + Math.floor(rnd() * 3)
    const lineTotal = last
      ? Math.round(remaining * 100) / 100
      : Math.round((remaining / (lineCount - i)) * 100) / 100
    remaining = Math.round((remaining - lineTotal) * 100) / 100
    lines.push({
      name: product.name,
      sku: `BMB-${1000 + Math.floor(rnd() * 8999)}`,
      qty,
      unitPrice: Math.round((lineTotal / qty) * 100) / 100,
      total: lineTotal,
    })
  }

  // histórico: do estado mais antigo até ao atual.
  const flow = [1, 2, 3, 4, 5]
  const idx = flow.indexOf(row.stateId)
  const reached = idx >= 0 ? flow.slice(0, idx + 1) : [1, row.stateId]
  const base = new Date(row.date)
  const history = reached.map((stateId, i) => {
    const at = new Date(base)
    at.setHours(at.getHours() + i * 18)
    return { stateId, at: at.toISOString() }
  })

  return {
    id: row.id,
    reference: row.reference,
    customer: row.customer,
    email: `${row.customer.split(' ')[0].toLowerCase()}@email.pt`,
    phone: '+351 9XX XXX XXX',
    date: row.date,
    stateId: row.stateId,
    payment: row.payment,
    shippingCity: CITIES[Math.floor(rnd() * CITIES.length)],
    subtotal,
    shipping,
    discount,
    total: row.total,
    lines,
    history,
  }
}

/** Datas extremas do dataset — útil para o gerador de relatórios futuro. */
export function mockOrdersDateBounds(): { min: string; max: string } {
  return {
    min: toIsoDate(new Date(TODAY.getTime() - 120 * 86400000)),
    max: toIsoDate(TODAY),
  }
}
