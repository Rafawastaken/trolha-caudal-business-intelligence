import { Repeat, UserPlus, Users, Percent } from 'lucide-react'

import { StatTile } from '@/components/stat-tile'
import { formatNum, formatPercent } from '@/lib/format'

import { useCustomerMix } from '../queries'

/** Faixa de tiles-resumo dos clientes (total, novos, recorrentes, recorrência). */
export function CustomersSummary() {
  const { data, isLoading } = useCustomerMix()
  const total = data ? data.newCustomers + data.returning : 0
  const retRate = total ? data!.returning / total : 0

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Clientes"
        value={data ? formatNum(total) : '—'}
        icon={Users}
        loading={isLoading}
      />
      <StatTile
        label="Novos"
        value={data ? formatNum(data.newCustomers) : '—'}
        icon={UserPlus}
        loading={isLoading}
      />
      <StatTile
        label="Recorrentes"
        value={data ? formatNum(data.returning) : '—'}
        icon={Repeat}
        loading={isLoading}
      />
      <StatTile
        label="Taxa de recorrência"
        value={data ? formatPercent(retRate) : '—'}
        sublabel="recorrentes / total"
        icon={Percent}
        loading={isLoading}
      />
    </div>
  )
}
