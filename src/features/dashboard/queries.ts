import { useQuery } from '@tanstack/react-query'

import { env } from '@/lib/env'
import { usePeriod } from '@/lib/period'

import { fetchOverview } from './api'
import { mockOverview } from './mock'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (from: string, to: string) =>
    [...dashboardKeys.all, 'overview', from, to] as const,
}

export function useOverview() {
  const { period } = usePeriod()
  return useQuery({
    queryKey: dashboardKeys.overview(period.from, period.to),
    queryFn: () =>
      env.VITE_USE_MOCK
        ? Promise.resolve(mockOverview(period.from, period.to))
        : fetchOverview(period.from, period.to),
  })
}
