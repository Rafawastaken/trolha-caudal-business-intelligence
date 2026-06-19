import { CheckCircle2, Euro, ShoppingCart, TrendingDown } from 'lucide-react'

import { StatTile } from '@/components/stat-tile'
import { formatEurCompact, formatNum, formatPercent } from '@/lib/format'

import { useAbandonedCarts, useDaily } from '../queries'

/** Tiles-resumo das tendências (totais do período + abandono). */
export function TrendsSummary() {
  const daily = useDaily()
  const ab = useAbandonedCarts()

  const orders = daily.data?.reduce((s, d) => s + d.orders, 0) ?? 0
  const revenue = daily.data?.reduce((s, d) => s + d.revenue, 0) ?? 0

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Encomendas"
        value={daily.data ? formatNum(orders) : '—'}
        icon={ShoppingCart}
        loading={daily.isLoading}
      />
      <StatTile
        label="Receita"
        value={daily.data ? formatEurCompact(revenue) : '—'}
        icon={Euro}
        loading={daily.isLoading}
      />
      <StatTile
        label="Taxa de abandono"
        value={ab.data ? formatPercent(ab.data.rate / 100) : '—'}
        sublabel="menos é melhor"
        icon={TrendingDown}
        loading={ab.isLoading}
      />
      <StatTile
        label="Carrinhos convertidos"
        value={ab.data ? formatNum(ab.data.converted) : '—'}
        icon={CheckCircle2}
        loading={ab.isLoading}
      />
    </div>
  )
}
