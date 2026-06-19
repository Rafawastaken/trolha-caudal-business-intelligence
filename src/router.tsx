import { createBrowserRouter } from 'react-router-dom'

import { NotFoundPage } from '@/components/layout/not-found-page'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { PublicLayout } from '@/components/layout/public-layout'
import { authRoutes } from '@/features/auth/routes'
import { customersRoutes } from '@/features/customers/routes'
import { dashboardRoutes } from '@/features/dashboard/routes'
import { ordersRoutes } from '@/features/orders/routes'
import { productsRoutes } from '@/features/products/routes'
import { reportsRoutes } from '@/features/reports/routes'
import { settingsRoutes } from '@/features/settings/routes'
import { trendsRoutes } from '@/features/trends/routes'

export const router = createBrowserRouter(
  [
    { element: <PublicLayout />, children: authRoutes },
    {
      element: <ProtectedLayout />,
      children: [
        ...dashboardRoutes,
        ...ordersRoutes,
        ...productsRoutes,
        ...customersRoutes,
        ...trendsRoutes,
        ...reportsRoutes,
        ...settingsRoutes,
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
