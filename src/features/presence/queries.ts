import { useQuery } from '@tanstack/react-query'

import { env } from '@/lib/env'

import { fetchLiveUsers } from './api'
import { mockLiveUsers } from './mock'

const USE_MOCK = env.VITE_USE_MOCK

/**
 * Visitantes online agora. Atualiza sozinho (~30s) e não depende do período
 * global — é um retrato em tempo real. Falhas ficam silenciosas (badge esconde).
 */
export function useLiveUsers(minutes = 5) {
  return useQuery({
    queryKey: ['presence', 'live-users', minutes],
    queryFn: () =>
      USE_MOCK ? Promise.resolve(mockLiveUsers()) : fetchLiveUsers(minutes),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    retry: false,
  })
}
