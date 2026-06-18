import type { RouteObject } from 'react-router-dom'

import { PlaceholderPage } from '@/components/layout/placeholder-page'

export const settingsRoutes: RouteObject[] = [
  {
    path: 'settings',
    element: (
      <PlaceholderPage
        title="Definições"
        description="Preferências da conta e da aplicação"
      />
    ),
  },
]
