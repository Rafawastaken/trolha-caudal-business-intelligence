import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type KpiCardProps = {
  label: string
  value: string
  delta: number
  icon: LucideIcon
  /** Métrica em que descer é positivo (ex.: taxa de abandono). */
  invertDelta?: boolean
  /** Subtítulo opcional (ex.: "vs. período anterior" implícito). */
  hint?: string
}

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  invertDelta = false,
  hint,
}: KpiCardProps) {
  const up = delta >= 0
  // "Bom" = subiu (ou desceu, se invertido). Define a cor do badge.
  const good = invertDelta ? !up : up
  const pct = Math.abs(delta * 100)

  return (
    <Card size="sm" className="gap-0 px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground/70" />
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="font-display text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
        <span
          className={cn(
            'mb-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
            good
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 text-destructive',
          )}
        >
          {up ? (
            <ArrowUpRight className="size-3" />
          ) : (
            <ArrowDownRight className="size-3" />
          )}
          {pct.toLocaleString('pt-PT', { maximumFractionDigits: 1 })}%
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {hint ?? 'vs. período anterior'}
      </p>
    </Card>
  )
}
