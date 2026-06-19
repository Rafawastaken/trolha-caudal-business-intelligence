import type { RouteObject } from 'react-router-dom'

import { CustomersPage } from './pages/customers-page'

export const customersRoutes: RouteObject[] = [
  {
    path: 'customers',
    element: <CustomersPage />,
  },
]
