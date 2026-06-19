import type { RouteObject } from 'react-router-dom'

import { lazyRoute } from '@/lib/lazy-route'

export const authRoutes: RouteObject[] = [
  {
    path: 'login',
    element: lazyRoute(() =>
      import('./pages/login-page').then((m) => ({ default: m.LoginPage })),
    ),
  },
]
