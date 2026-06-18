import type { RouteObject } from 'react-router-dom'

import { PlaceholderPage } from '@/components/layout/placeholder-page'

export const reportsRoutes: RouteObject[] = [
  {
    path: 'reports',
    element: (
      <PlaceholderPage
        title="Relatórios"
        description="Gera e exporta relatórios (PDF / CSV)"
      />
    ),
  },
]
