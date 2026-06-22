import { Link } from 'react-router-dom'
import { PackageCheck, ShoppingBag, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNum } from '@/lib/format'
import { paths } from '@/paths'
import { cn } from '@/lib/utils'

import { useReorderSuggestions } from '../queries'
import type { ReorderSuggestion, ReorderUrgency } from '../reorder'

const URGENCY: Record<
  ReorderUrgency,
  { label: string; badge: string; bar: string }
> = {
  out: {
    label: 'Esgotado',
    badge: 'bg-destructive/10 text-destructive',
    bar: 'bg-destructive',
  },
  critical: {
    label: 'Crítico',
    badge: 'bg-destructive/10 text-destructive',
    bar: 'bg-destructive',
  },
  warning: {
    label: 'A repor',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
}

function formatCover(days: number | null): string {
  if (days === null) return '—'
  if (days <= 0) return '0 dias'
  if (days < 1) return '< 1 dia'
  const d = Math.round(days)
  return `${formatNum(d)} ${d === 1 ? 'dia' : 'dias'}`
}

/**
 * Reposição de stock acionável — cruza best-sellers do período com o stock
 * baixo atual e prioriza o que encomendar (urgência, dias de cobertura, qtd
 * sugerida). Cálculo no cliente; parâmetros nas Definições.
 */
export function ReorderCard() {
  const { data, isLoading, leadTimeDays } = useReorderSuggestions()

  const outCount = data?.filter((s) => s.urgency === 'out').length ?? 0

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-muted-foreground" />
            Reposição de stock
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Best-sellers em rutura, por urgência · lead-time {leadTimeDays} d
          </p>
        </div>
        {data && data.length > 0 && (
          <Badge variant="outline" className="shrink-0 tabular-nums">
            {data.length} {data.length === 1 ? 'produto' : 'produtos'}
            {outCount > 0 ? ` · ${outCount} esgotado${outCount === 1 ? '' : 's'}` : ''}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <PackageCheck className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">Nada a repor</p>
            <p className="text-xs text-muted-foreground">
              Nenhum best-seller do período está em risco de rutura.
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="-my-1 max-h-[28rem] divide-y overflow-y-auto">
            {data.map((s) => (
              <ReorderRow key={s.id} s={s} />
            ))}
          </ul>
        )}
      </CardContent>

      {data && data.length > 0 && (
        <div className="border-t px-6 py-3 text-xs text-muted-foreground">
          Sugestão para repor a cobertura alvo durante o lead-time. Ajusta os
          prazos nas{' '}
          <Link to={paths.settings} className="text-primary hover:underline">
            Definições
          </Link>
          .
        </div>
      )}
    </Card>
  )
}

function ReorderRow({ s }: { s: ReorderSuggestion }) {
  const u = URGENCY[s.urgency]
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={cn('w-1 shrink-0 self-stretch rounded-full', u.bar)} />
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium" title={s.name}>
            {s.name}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 font-medium',
                u.badge,
              )}
            >
              {u.label}
            </span>
            <span>{formatCover(s.daysOfCover)} cobertura</span>
            <span>·</span>
            <span>{formatNum(s.stock)} em stock</span>
            {s.lowConfidence && (
              <span
                className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"
                title="Poucas vendas no período — estimativa pouco fiável."
              >
                <TriangleAlert className="size-3" />
                baixa confiança
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums">
          +{formatNum(s.suggestedQty)}
        </p>
        <p className="text-xs text-muted-foreground">a encomendar</p>
      </div>
    </li>
  )
}
