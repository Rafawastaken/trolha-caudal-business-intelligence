import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { daysInRange } from '@/lib/dates'
import { env } from '@/lib/env'
import { usePeriod } from '@/lib/period'
import { getLeadTimeDays, getTargetCoverDays } from '@/lib/preferences'

import {
  fetchCategories,
  fetchLowStock,
  fetchTopProducts,
  fetchVouchers,
} from './api'
import {
  mockCategories,
  mockLowStock,
  mockTopProducts,
  mockVouchers,
} from './mock'
import { computeReorder, REORDER_STOCK_CEILING } from './reorder'

const USE_MOCK = env.VITE_USE_MOCK

// Amostra alargada de best-sellers para o cruzamento da reposição (queremos
// apanhar mais do que o top-10 mostrado no card de best-sellers).
const REORDER_TOP_LIMIT = 100

export const productsKeys = {
  all: ['products'] as const,
  top: (from: string, to: string) =>
    [...productsKeys.all, 'top', from, to] as const,
  categories: (from: string, to: string) =>
    [...productsKeys.all, 'categories', from, to] as const,
  lowStock: (threshold: number) =>
    [...productsKeys.all, 'low-stock', threshold] as const,
  vouchers: (from: string, to: string) =>
    [...productsKeys.all, 'vouchers', from, to] as const,
}

export function useTopProducts() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: productsKeys.top(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockTopProducts())
        : fetchTopProducts(period.from, period.to),
  })
}

export function useCategories() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: productsKeys.categories(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockCategories())
        : fetchCategories(period.from, period.to),
  })
}

/** Stock baixo — retrato atual (sem dependência do período). */
export function useLowStock(threshold = 5) {
  return useQuery({
    queryKey: productsKeys.lowStock(threshold),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockLowStock(threshold))
        : fetchLowStock(threshold),
  })
}

/**
 * Plano de reposição — deriva de top-products (procura) × low-stock (stock
 * atual). Reusa o cache de ambos os fetches; o cálculo corre no cliente e
 * reage às preferências de lead-time / cobertura alvo guardadas nas Definições.
 */
export function useReorderSuggestions() {
  const { period } = usePeriod()

  const topQuery = useQuery({
    queryKey: [...productsKeys.top(period.from, period.to), 'reorder', REORDER_TOP_LIMIT],
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockTopProducts(REORDER_TOP_LIMIT))
        : fetchTopProducts(period.from, period.to, REORDER_TOP_LIMIT),
  })

  const stockQuery = useQuery({
    queryKey: productsKeys.lowStock(REORDER_STOCK_CEILING),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockLowStock(REORDER_STOCK_CEILING))
        : fetchLowStock(REORDER_STOCK_CEILING),
  })

  const leadTimeDays = getLeadTimeDays()
  const targetCoverDays = getTargetCoverDays()

  const suggestions = useMemo(() => {
    if (!topQuery.data || !stockQuery.data) return undefined
    return computeReorder(topQuery.data, stockQuery.data, {
      periodDays: daysInRange(period.from, period.to),
      leadTimeDays,
      targetCoverDays,
    })
  }, [
    topQuery.data,
    stockQuery.data,
    period.from,
    period.to,
    leadTimeDays,
    targetCoverDays,
  ])

  return {
    data: suggestions,
    isLoading: topQuery.isLoading || stockQuery.isLoading,
    isError: topQuery.isError || stockQuery.isError,
    leadTimeDays,
    targetCoverDays,
  }
}

export function useVouchers() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: productsKeys.vouchers(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockVouchers())
        : fetchVouchers(period.from, period.to),
  })
}
