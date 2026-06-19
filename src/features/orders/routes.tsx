import type { RouteObject } from 'react-router-dom'

import { lazyRoute } from '@/lib/lazy-route'

export const ordersRoutes: RouteObject[] = [
  {
    path: 'orders',
    element: lazyRoute(() =>
      import('./pages/orders-page').then((m) => ({ default: m.OrdersPage })),
    ),
  },
  {
    path: 'orders/:id',
    element: lazyRoute(() =>
      import('./pages/order-detail-page').then((m) => ({
        default: m.OrderDetailPage,
      })),
    ),
  },
]
