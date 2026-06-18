import type { RouteObject } from 'react-router-dom'

import { OrderDetailPage } from './pages/order-detail-page'
import { OrdersPage } from './pages/orders-page'

export const ordersRoutes: RouteObject[] = [
  { path: 'orders', element: <OrdersPage /> },
  { path: 'orders/:id', element: <OrderDetailPage /> },
]
