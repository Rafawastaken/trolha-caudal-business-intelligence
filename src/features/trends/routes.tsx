import type { RouteObject } from 'react-router-dom'

import { TrendsPage } from './pages/trends-page'

export const trendsRoutes: RouteObject[] = [
  {
    path: 'trends',
    element: <TrendsPage />,
  },
]
