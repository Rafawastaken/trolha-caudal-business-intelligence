import type { RouteObject } from 'react-router-dom'

import { PlaceholderPage } from '@/components/layout/placeholder-page'

export const customersRoutes: RouteObject[] = [
  {
    path: 'customers',
    element: (
      <PlaceholderPage
        title="Clientes"
        description="Top clientes, novos vs recorrentes e geografia"
      />
    ),
  },
]
