import {
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { paths } from '@/paths'

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  /** end => match exato (evita o Dashboard "/" ficar sempre ativo). */
  end?: boolean
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard, end: true },
  { label: 'Encomendas', to: paths.orders.list, icon: ShoppingCart },
  { label: 'Produtos & Stock', to: paths.products, icon: Package },
  { label: 'Clientes', to: paths.customers, icon: Users },
  { label: 'Tendências', to: paths.trends, icon: TrendingUp },
  { label: 'Relatórios', to: paths.reports, icon: FileText },
]

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Definições', to: paths.settings, icon: Settings },
]
