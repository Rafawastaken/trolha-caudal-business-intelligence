import type { RouteObject } from 'react-router-dom'

import { ProductsPage } from './pages/products-page'

export const productsRoutes: RouteObject[] = [
  {
    path: 'products',
    element: <ProductsPage />,
  },
]
