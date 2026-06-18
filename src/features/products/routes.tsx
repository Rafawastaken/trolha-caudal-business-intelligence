import type { RouteObject } from 'react-router-dom'

import { PlaceholderPage } from '@/components/layout/placeholder-page'

export const productsRoutes: RouteObject[] = [
  {
    path: 'products',
    element: (
      <PlaceholderPage
        title="Produtos & Stock"
        description="Best-sellers, categorias, stock baixo e cupões"
      />
    ),
  },
]
