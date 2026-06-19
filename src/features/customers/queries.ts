import { useQuery } from '@tanstack/react-query'

import { env } from '@/lib/env'
import { usePeriod } from '@/lib/period'

import { fetchCustomerMix, fetchGeography, fetchTopCustomers } from './api'
import { mockCustomerMix, mockGeography, mockTopCustomers } from './mock'

const USE_MOCK = env.VITE_USE_MOCK

export const customersKeys = {
  all: ['customers'] as const,
  top: (from: string, to: string) =>
    [...customersKeys.all, 'top', from, to] as const,
  mix: (from: string, to: string) =>
    [...customersKeys.all, 'mix', from, to] as const,
  geography: (from: string, to: string) =>
    [...customersKeys.all, 'geography', from, to] as const,
}

export function useTopCustomers() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: customersKeys.top(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockTopCustomers())
        : fetchTopCustomers(period.from, period.to),
  })
}

export function useCustomerMix() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: customersKeys.mix(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockCustomerMix())
        : fetchCustomerMix(period.from, period.to),
  })
}

export function useGeography() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: customersKeys.geography(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockGeography())
        : fetchGeography(period.from, period.to),
  })
}
