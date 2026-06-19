import {
  MapPin,
  Package,
  ShoppingCart,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { fetchCategories, fetchTopProducts } from '@/features/products/api'
import { mockCategories, mockTopProducts } from '@/features/products/mock'
import { fetchGeography, fetchTopCustomers } from '@/features/customers/api'
import { mockGeography, mockTopCustomers } from '@/features/customers/mock'
import { fetchOrdersList } from '@/features/orders/api'
import { mockOrdersList } from '@/features/orders/mock'
import { orderState } from '@/features/orders/order-states'
import type { OrderRow } from '@/features/orders/schemas'
import { formatPtDate } from '@/lib/dates'
import { env } from '@/lib/env'
import type { Period } from '@/lib/period'

import { csvNum, toCsv } from './csv'

const USE_MOCK = env.VITE_USE_MOCK

export type ReportId =
  | 'orders'
  | 'top-products'
  | 'categories'
  | 'top-customers'
  | 'geography'

export type ReportMeta = {
  id: ReportId
  title: string
  description: string
  icon: LucideIcon
  slug: string
}

export const REPORTS: ReportMeta[] = [
  {
    id: 'orders',
    title: 'Encomendas',
    description: 'Lista completa do período (referência, cliente, estado, total).',
    icon: ShoppingCart,
    slug: 'encomendas',
  },
  {
    id: 'top-products',
    title: 'Best-sellers',
    description: 'Produtos mais vendidos por receita e unidades.',
    icon: Package,
    slug: 'best-sellers',
  },
  {
    id: 'categories',
    title: 'Categorias',
    description: 'Vendas por categoria no período.',
    icon: Tags,
    slug: 'categorias',
  },
  {
    id: 'top-customers',
    title: 'Top clientes',
    description: 'Clientes por receita, com ticket médio.',
    icon: Users,
    slug: 'top-clientes',
  },
  {
    id: 'geography',
    title: 'Geografia',
    description: 'Encomendas e receita por região.',
    icon: MapPin,
    slug: 'geografia',
  },
]

export type ReportResult = { filename: string; csv: string; rows: number }

/** Busca TODAS as encomendas do período (percorre a paginação). */
async function allOrders(period: Period): Promise<OrderRow[]> {
  if (USE_MOCK) {
    return mockOrdersList({
      from: period.from,
      to: period.to,
      page: 1,
      per_page: 100000,
    }).rows
  }
  const out: OrderRow[] = []
  for (let page = 1; ; page += 1) {
    const res = await fetchOrdersList({
      from: period.from,
      to: period.to,
      page,
      per_page: 100,
    })
    out.push(...res.rows)
    if (page >= res.meta.pages) break
  }
  return out
}

export async function runReport(
  id: ReportId,
  period: Period,
): Promise<ReportResult> {
  const meta = REPORTS.find((r) => r.id === id)!
  const filename = `${meta.slug}_${period.from}_a_${period.to}.csv`

  switch (id) {
    case 'orders': {
      const rows = await allOrders(period)
      const csv = toCsv(
        ['Referência', 'Cliente', 'Data', 'Estado', 'Pagamento', 'Total (€)'],
        rows.map((o) => [
          o.reference,
          o.customer,
          formatPtDate(o.date.slice(0, 10)),
          o.stateLabel ?? orderState(o.stateId).label,
          o.payment,
          csvNum(o.total),
        ]),
      )
      return { filename, csv, rows: rows.length }
    }

    case 'top-products': {
      const data = USE_MOCK
        ? mockTopProducts()
        : await fetchTopProducts(period.from, period.to, 100)
      const csv = toCsv(
        ['Produto', 'Unidades', 'Receita (€)'],
        data.map((p) => [p.name, csvNum(p.qty, 0), csvNum(p.revenue)]),
      )
      return { filename, csv, rows: data.length }
    }

    case 'categories': {
      const data = USE_MOCK
        ? mockCategories()
        : await fetchCategories(period.from, period.to, 100)
      const csv = toCsv(
        ['Categoria', 'Unidades', 'Receita (€)'],
        data.map((c) => [c.name, csvNum(c.qty, 0), csvNum(c.revenue)]),
      )
      return { filename, csv, rows: data.length }
    }

    case 'top-customers': {
      const data = USE_MOCK
        ? mockTopCustomers()
        : await fetchTopCustomers(period.from, period.to, 100)
      const csv = toCsv(
        ['Cliente', 'Encomendas', 'Ticket médio (€)', 'Receita (€)'],
        data.map((c) => [
          c.name,
          csvNum(c.orders, 0),
          csvNum(c.orders ? c.revenue / c.orders : 0),
          csvNum(c.revenue),
        ]),
      )
      return { filename, csv, rows: data.length }
    }

    case 'geography': {
      const data = USE_MOCK
        ? mockGeography()
        : await fetchGeography(period.from, period.to, 100)
      const csv = toCsv(
        ['Região', 'Encomendas', 'Receita (€)'],
        data.map((g) => [g.region, csvNum(g.orders, 0), csvNum(g.revenue)]),
      )
      return { filename, csv, rows: data.length }
    }
  }
}
