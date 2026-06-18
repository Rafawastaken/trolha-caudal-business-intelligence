import type { RouteObject } from 'react-router-dom'

import { PlaceholderPage } from '@/components/layout/placeholder-page'

export const trendsRoutes: RouteObject[] = [
  {
    path: 'trends',
    element: (
      <PlaceholderPage
        title="Tendências"
        description="Séries temporais, padrões e abandono de carrinho"
      />
    ),
  },
]
