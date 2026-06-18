import {
  Euro,
  PackageCheck,
  Receipt,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react'

import { StatTile } from '@/components/stat-tile'
import { formatEur, formatEurCompact, formatNum } from '@/lib/format'

import { useOrdersSummary, useRefunds } from '../queries'

/** Faixa de tiles-resumo das encomendas (criadas, válidas, receita, ticket, reembolsos). */
export function OrdersSummary() {
  const summary = useOrdersSummary()
  const refunds = useRefunds()

  const s = summary.data
  const r = refunds.data
  const loading = summary.isLoading
  const loadingR = refunds.isLoading

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <StatTile
        label="Criadas"
        value={s ? formatNum(s.created) : '—'}
        icon={ShoppingCart}
        loading={loading}
      />
      <StatTile
        label="Válidas"
        value={s ? formatNum(s.valid) : '—'}
        icon={PackageCheck}
        loading={loading}
      />
      <StatTile
        label="Receita"
        value={s ? formatEurCompact(s.revenue) : '—'}
        icon={Euro}
        loading={loading}
      />
      <StatTile
        label="Ticket médio"
        value={s ? formatEur(s.avgTicket) : '—'}
        icon={Receipt}
        loading={loading}
      />
      <StatTile
        label="Reembolsos"
        value={r ? formatEur(r.amount) : '—'}
        sublabel={r ? `${formatNum(r.count)} encomendas` : undefined}
        icon={RotateCcw}
        loading={loadingR}
      />
    </div>
  )
}
