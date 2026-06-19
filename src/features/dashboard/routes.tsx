import type { RouteObject } from 'react-router-dom'

import { lazyRoute } from '@/lib/lazy-route'

export const dashboardRoutes: RouteObject[] = [
  {
    index: true,
    element: lazyRoute(() =>
      import('./pages/dashboard-page').then((m) => ({
        default: m.DashboardPage,
      })),
    ),
  },
]
