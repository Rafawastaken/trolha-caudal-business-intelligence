import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  ChevronsLeft,
  ChevronsRight,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'

import { TrolhaMark } from '@/components/brand/trolha-mark'
import { TrolhaWordmark } from '@/components/brand/trolha-wordmark'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { paths } from '@/paths'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  /** end => match exato (evita o Dashboard "/" ficar sempre ativo). */
  end?: boolean
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: paths.dashboard, icon: LayoutDashboard, end: true },
  { label: 'Encomendas', to: paths.orders.list, icon: ShoppingCart },
  { label: 'Produtos & Stock', to: paths.products, icon: Package },
  { label: 'Clientes', to: paths.customers, icon: Users },
  { label: 'Tendências', to: paths.trends, icon: TrendingUp },
  { label: 'Relatórios', to: paths.reports, icon: FileText },
]

const SECONDARY_NAV: NavItem[] = [
  { label: 'Definições', to: paths.settings, icon: Settings },
]

type SidebarProps = {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col overflow-hidden rounded-2xl border bg-sidebar shadow-sm transition-[width] duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b',
          collapsed ? 'justify-center' : 'gap-2 px-4',
        )}
      >
        {collapsed ? (
          <TrolhaMark className="size-7" />
        ) : (
          <>
            <TrolhaWordmark className="text-lg text-foreground" />
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-primary">
              PULSE
            </span>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <NavList items={MAIN_NAV} collapsed={collapsed} />
      </div>

      <div
        className={cn(
          'flex flex-col gap-1 border-t p-2',
          collapsed && 'items-center',
        )}
      >
        <NavList items={SECONDARY_NAV} collapsed={collapsed} />
        <CollapseButton collapsed={collapsed} onToggle={onToggleCollapse} />
      </div>
    </aside>
  )
}

function NavList({
  items,
  collapsed,
}: {
  items: NavItem[]
  collapsed: boolean
}) {
  return (
    <nav className={cn('flex flex-col gap-1', collapsed && 'items-center')}>
      {items.map((item) => (
        <MiniTooltip key={item.to} label={item.label} show={collapsed}>
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'relative flex items-center rounded-lg font-medium transition-colors',
                'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed
                  ? 'size-11 justify-center'
                  : 'w-full gap-3 px-3 py-2.5 text-sm',
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <item.icon className="size-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        </MiniTooltip>
      ))}
    </nav>
  )
}

function CollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const Icon = collapsed ? ChevronsRight : ChevronsLeft
  return (
    <MiniTooltip label="Expandir menu" show={collapsed}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        className={cn(
          'flex items-center rounded-lg font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          collapsed
            ? 'size-11 justify-center'
            : 'w-full gap-3 px-3 py-2.5 text-sm',
        )}
      >
        <Icon className="size-[18px] shrink-0" />
        {!collapsed && <span>Colapsar</span>}
      </button>
    </MiniTooltip>
  )
}

function MiniTooltip({
  label,
  show,
  children,
}: {
  label: string
  show: boolean
  children: ReactNode
}) {
  if (!show) return <>{children}</>
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <span className="font-medium">{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}
