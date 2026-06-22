import { useQuery } from '@tanstack/react-query'

import { env } from '@/lib/env'
import { usePeriod } from '@/lib/period'

import {
  fetchOrder,
  fetchOrdersAtRisk,
  fetchOrdersList,
  fetchOrdersSummary,
  fetchPayments,
  fetchRefunds,
  fetchStates,
} from './api'
import {
  mockOrder,
  mockOrdersAtRisk,
  mockOrdersList,
  mockOrdersSummary,
  mockPayments,
  mockRefunds,
  mockStates,
} from './mock'
import type { OrdersListParams } from './schemas'

const USE_MOCK = env.VITE_USE_MOCK

export const ordersKeys = {
  all: ['orders'] as const,
  summary: (from: string, to: string) =>
    [...ordersKeys.all, 'summary', from, to] as const,
  refunds: (from: string, to: string) =>
    [...ordersKeys.all, 'refunds', from, to] as const,
  payments: (from: string, to: string) =>
    [...ordersKeys.all, 'payments', from, to] as const,
  states: (from: string, to: string) =>
    [...ordersKeys.all, 'states', from, to] as const,
  atRisk: (from: string, to: string) =>
    [...ordersKeys.all, 'at-risk', from, to] as const,
  list: (params: OrdersListParams) =>
    [...ordersKeys.all, 'list', params] as const,
  detail: (id: number) => [...ordersKeys.all, 'detail', id] as const,
}

export function useOrdersSummary() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: ordersKeys.summary(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockOrdersSummary(period.from, period.to))
        : fetchOrdersSummary(period.from, period.to),
  })
}

export function useRefunds() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: ordersKeys.refunds(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockRefunds(period.from, period.to))
        : fetchRefunds(period.from, period.to),
  })
}

export function usePayments() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: ordersKeys.payments(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockPayments(period.from, period.to))
        : fetchPayments(period.from, period.to),
  })
}

export function useOrderStates() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: ordersKeys.states(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockStates(period.from, period.to))
        : fetchStates(period.from, period.to),
  })
}

/** Encomendas que aguardam pagamento — lista acionável + valor em risco. */
export function useOrdersAtRisk() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: ordersKeys.atRisk(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockOrdersAtRisk(period.from, period.to))
        : fetchOrdersAtRisk(period.from, period.to),
  })
}

type ListFilters = {
  page: number
  perPage: number
  state?: number
  payment?: string
  search?: string
}

export function useOrdersList(filters: ListFilters) {
  const { period } = usePeriod()
  const params: OrdersListParams = {
    from: period.from,
    to: period.to,
    page: filters.page,
    per_page: filters.perPage,
    state: filters.state,
    payment: filters.payment,
    search: filters.search,
  }
  return useQuery({
    queryKey: ordersKeys.list(params),
    queryFn: () =>
      USE_MOCK ? Promise.resolve(mockOrdersList(params)) : fetchOrdersList(params),
    placeholderData: (prev) => prev, // mantém a tabela durante paginação/filtros
  })
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => {
      if (USE_MOCK) {
        const order = mockOrder(id)
        if (!order) throw new Error('Encomenda não encontrada')
        return Promise.resolve(order)
      }
      return fetchOrder(id)
    },
  })
}
