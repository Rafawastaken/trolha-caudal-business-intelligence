import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

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
  /** Classes extra no cartão (ex.: `h-full` para alinhar com o hero). */
  className?: string
  /** Se definido, o cartão liga (drill-down) para esta rota. */
  to?: string
}

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  invertDelta = false,
  hint,
  className,
  to,
}: KpiCardProps) {
  const up = delta >= 0
  // "Bom" = subiu (ou desceu, se invertido). Define a cor do badge.
  const good = invertDelta ? !up : up
  const pct = Math.abs(delta * 100)

  const card = (
    <Card
      size="sm"
      className={cn(
        'justify-center px-5 py-4',
        to && 'h-full transition-shadow hover:ring-primary/30',
        className,
      )}
    >
      <div className="flex items-center gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-display text-2xl font-bold leading-tight tracking-tight tabular-nums">
              {value}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
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
          <p className="truncate text-xs text-muted-foreground">
            {hint ?? 'vs. período anterior'}
          </p>
        </div>
      </div>
    </Card>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {card}
      </Link>
    )
  }
  return card
}
