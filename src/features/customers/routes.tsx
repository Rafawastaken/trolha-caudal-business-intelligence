import type { RouteObject } from 'react-router-dom'

import { lazyRoute } from '@/lib/lazy-route'

export const customersRoutes: RouteObject[] = [
  {
    path: 'customers',
    element: lazyRoute(() =>
      import('./pages/customers-page').then((m) => ({
        default: m.CustomersPage,
      })),
    ),
  },
]
