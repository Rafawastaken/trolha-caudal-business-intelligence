import type { RouteObject } from 'react-router-dom'

import { lazyRoute } from '@/lib/lazy-route'

export const trendsRoutes: RouteObject[] = [
  {
    path: 'trends',
    element: lazyRoute(() =>
      import('./pages/trends-page').then((m) => ({ default: m.TrendsPage })),
    ),
  },
]
