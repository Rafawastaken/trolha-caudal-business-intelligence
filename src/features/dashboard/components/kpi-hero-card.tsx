import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { formatEur, formatEurCompact } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { DailyPoint, KpiMetric } from '../schemas'
import { KpiSpark } from './kpi-spark'

type KpiHeroCardProps = {
  metric: KpiMetric
  daily: DailyPoint[]
  className?: string
}

/**
 * Banner da Receita — a métrica que comanda a leitura do dia. Largura total:
 * stats à esquerda, sparkline largo a preencher a direita.
 */
export function KpiHeroCard({ metric, daily, className }: KpiHeroCardProps) {
  const up = metric.delta >= 0
  const pct = Math.abs(metric.delta * 100)

  return (
    <Card
      className={cn(
        'relative flex-row items-center gap-6 overflow-hidden bg-[#08131F] px-6 py-8 text-white ring-0',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-[#F5811E]/15 blur-3xl"
      />

      <div className="relative shrink-0">
        <p className="font-mono text-xs tracking-[0.2em] text-[#8DA2B4]">
          RECEITA
        </p>
        <div className="mt-2 flex items-center gap-3">
          <p className="font-display text-4xl font-bold tracking-tight tabular-nums">
            {formatEur(metric.value)}
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium tabular-nums',
              up
                ? 'bg-emerald-400/15 text-emerald-300'
                : 'bg-red-400/15 text-red-300',
            )}
          >
            {up ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {pct.toLocaleString('pt-PT', { maximumFractionDigits: 1 })}%
          </span>
        </div>
        <p className="mt-2 text-xs text-[#8DA2B4]">
          vs. {formatEurCompact(metric.previous)} no período anterior
        </p>
      </div>

      <div className="relative -my-1 h-24 min-w-0 flex-1">
        <KpiSpark
          data={daily.map((d) => d.revenue)}
          labels={daily.map((d) => d.date)}
          color="#F5811E"
        />
      </div>
    </Card>
  )
}
