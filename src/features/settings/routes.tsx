import type { RouteObject } from 'react-router-dom'

import { lazyRoute } from '@/lib/lazy-route'

export const settingsRoutes: RouteObject[] = [
  {
    path: 'settings',
    element: lazyRoute(() =>
      import('./pages/settings-page').then((m) => ({
        default: m.SettingsPage,
      })),
    ),
  },
]
