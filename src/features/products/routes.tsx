import type { RouteObject } from 'react-router-dom'

import { lazyRoute } from '@/lib/lazy-route'

export const productsRoutes: RouteObject[] = [
  {
    path: 'products',
    element: lazyRoute(() =>
      import('./pages/products-page').then((m) => ({
        default: m.ProductsPage,
      })),
    ),
  },
]
