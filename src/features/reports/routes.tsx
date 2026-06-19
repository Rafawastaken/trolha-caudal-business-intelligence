import type { RouteObject } from 'react-router-dom'

import { lazyRoute } from '@/lib/lazy-route'

export const reportsRoutes: RouteObject[] = [
  {
    path: 'reports',
    element: lazyRoute(() =>
      import('./pages/reports-page').then((m) => ({ default: m.ReportsPage })),
    ),
  },
]
