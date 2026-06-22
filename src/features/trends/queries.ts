import { useQuery } from '@tanstack/react-query'

import { env } from '@/lib/env'
import { usePeriod } from '@/lib/period'

import {
  fetchAbandonedCarts,
  fetchAbandonedCartsDetail,
  fetchConsent,
  fetchDaily,
  fetchHour,
  fetchMonthly,
  fetchTraffic,
  fetchWeekday,
} from './api'
import {
  mockAbandonedCarts,
  mockAbandonedCartsDetail,
  mockConsent,
  mockDaily,
  mockHour,
  mockMonthly,
  mockTraffic,
  mockWeekday,
} from './mock'

const USE_MOCK = env.VITE_USE_MOCK

export const trendsKeys = {
  all: ['trends'] as const,
  daily: (from: string, to: string) =>
    [...trendsKeys.all, 'daily', from, to] as const,
  monthly: (from: string, to: string) =>
    [...trendsKeys.all, 'monthly', from, to] as const,
  weekday: (from: string, to: string) =>
    [...trendsKeys.all, 'weekday', from, to] as const,
  hour: (from: string, to: string) =>
    [...trendsKeys.all, 'hour', from, to] as const,
  abandoned: (from: string, to: string) =>
    [...trendsKeys.all, 'abandoned', from, to] as const,
  abandonedDetail: (from: string, to: string) =>
    [...trendsKeys.all, 'abandoned-detail', from, to] as const,
  traffic: (from: string, to: string) =>
    [...trendsKeys.all, 'traffic', from, to] as const,
  consent: (from: string, to: string) =>
    [...trendsKeys.all, 'consent', from, to] as const,
}

export function useDaily() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: trendsKeys.daily(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockDaily(period.from, period.to))
        : fetchDaily(period.from, period.to),
  })
}

export function useMonthly() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: trendsKeys.monthly(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockMonthly(period.from, period.to))
        : fetchMonthly(period.from, period.to),
  })
}

export function useWeekday() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: trendsKeys.weekday(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockWeekday())
        : fetchWeekday(period.from, period.to),
  })
}

export function useHour() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: trendsKeys.hour(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockHour())
        : fetchHour(period.from, period.to),
  })
}

export function useAbandonedCarts() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: trendsKeys.abandoned(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockAbandonedCarts())
        : fetchAbandonedCarts(period.from, period.to),
  })
}

export function useAbandonedCartsDetail() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: trendsKeys.abandonedDetail(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockAbandonedCartsDetail(period.from, period.to))
        : fetchAbandonedCartsDetail(period.from, period.to),
  })
}

export function useTraffic() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: trendsKeys.traffic(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockTraffic(period.from, period.to))
        : fetchTraffic(period.from, period.to),
  })
}

export function useConsent() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: trendsKeys.consent(period.from, period.to),
    queryFn: () =>
      USE_MOCK
        ? Promise.resolve(mockConsent())
        : fetchConsent(period.from, period.to),
  })
}
