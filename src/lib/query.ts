import { QueryCache, QueryClient } from '@tanstack/react-query'

import { ApiError } from './api'

// Event the AuthProvider listens to so an expired/invalid JWT surfaced by ANY
// query forces a sign-out + redirect, instead of each feature handling 401s.
export const UNAUTHORIZED_EVENT = 'tt:unauthorized'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Never retry auth failures — the token is dead.
        if (error instanceof ApiError && error.status === 401) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})
