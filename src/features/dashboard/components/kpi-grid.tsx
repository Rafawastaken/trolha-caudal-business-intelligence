import {
  PackageCheck,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  TrendingDown,
  UserPlus,
} from 'lucide-react'

import { formatEur, formatNum, formatPercent } from '@/lib/format'
import { paths } from '@/paths'

import type { DailyPoint, DashboardKpis } from '../schemas'
import { KpiCard } from './kpi-card'
import { KpiHeroCard } from './kpi-hero-card'

type KpiGridProps = {
  kpis: DashboardKpis
  daily: DailyPoint[]
}

export function KpiGrid({ kpis, daily }: KpiGridProps) {
  return (
    <div className="space-y-3">
      <KpiHeroCard metric={kpis.revenue} daily={daily} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <KpiCard
          label="Encomendas"
          value={formatNum(kpis.orders.value)}
          delta={kpis.orders.delta}
          icon={ShoppingCart}
          to={paths.orders.list}
        />
        <KpiCard
          label="Encomendas válidas"
          value={formatNum(kpis.validOrders.value)}
          delta={kpis.validOrders.delta}
          icon={PackageCheck}
          to={paths.orders.list}
        />
        <KpiCard
          label="Ticket médio"
          value={formatEur(kpis.avgTicket.value)}
          delta={kpis.avgTicket.delta}
          icon={Receipt}
          to={paths.orders.list}
        />
        <KpiCard
          label="Unidades vendidas"
          value={formatNum(kpis.unitsSold.value)}
          delta={kpis.unitsSold.delta}
          icon={ShoppingBag}
          to={paths.products}
        />
        <KpiCard
          label="Novos clientes"
          value={formatNum(kpis.newCustomers.value)}
          delta={kpis.newCustomers.delta}
          icon={UserPlus}
          to={paths.customers}
        />
        <KpiCard
          label="Taxa de abandono"
          value={formatPercent(kpis.abandonmentRate.value)}
          delta={kpis.abandonmentRate.delta}
          icon={TrendingDown}
          invertDelta
          hint="menos é melhor · vs. anterior"
          to={paths.trends}
        />
      </div>
    </div>
  )
}
