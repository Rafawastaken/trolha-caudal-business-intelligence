import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/features/auth/auth-context'
import { paths } from '@/paths'

import { RouteFallback } from './route-fallback'

export function PublicLayout() {
  const { isAuthenticated } = useAuth()

  // Já autenticado? Salta o login.
  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Outlet />
    </Suspense>
  )
}
