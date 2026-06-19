import { useQuery } from '@tanstack/react-query'

import { env } from '@/lib/env'
import { usePeriod } from '@/lib/period'

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

const USE_MOCK = env.VITE_USE_MOCK

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
