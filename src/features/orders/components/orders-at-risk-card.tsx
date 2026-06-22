import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, TriangleAlert } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum } from '@/lib/format'
import { paths } from '@/paths'
import { cn } from '@/lib/utils'

import type { OrderRow } from '../schemas'
import { useOrdersAtRisk } from '../queries'

/** Dias decorridos desde a data da encomenda (retrato em risco = antiguidade). */
function daysPending(iso: string): number {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return 0
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000))
}

function ageTone(days: number): string {
  if (days >= 7) return 'bg-destructive/10 text-destructive'
  if (days >= 3) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  return 'bg-muted text-muted-foreground'
}

/**
 * Encomendas em risco — as que aguardam pagamento (ex.: Multibanco gerado e
 * nunca pago), ordenadas por valor, com o total em risco. Cada linha liga ao
 * detalhe para seguimento.
 */
export function OrdersAtRiskCard() {
  const { data, isLoading } = useOrdersAtRisk()

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            Encomendas em risco
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Aguardam pagamento · ordenadas por valor
          </p>
        </div>
        {data && data.count > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-lg font-semibold tabular-nums text-destructive">
              {formatEur(data.totalAtRisk)}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.truncated ? `em risco (top ${data.fetched})` : 'em risco'}
            </p>
          </div>
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

        {data && data.count === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2 className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">Sem encomendas em risco</p>
            <p className="text-xs text-muted-foreground">
              Nenhuma encomenda a aguardar pagamento no período.
            </p>
          </div>
        )}

        {data && data.count > 0 && (
          <>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatNum(data.count)}{' '}
                {data.count === 1 ? 'encomenda' : 'encomendas'} a aguardar
                pagamento
              </span>
            </div>
            <ul className="-my-1 max-h-[26rem] divide-y overflow-y-auto">
              {data.rows.map((row) => (
                <AtRiskRow key={row.id} row={row} />
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function AtRiskRow({ row }: { row: OrderRow }) {
  const days = daysPending(row.date)
  return (
    <li>
      <Link
        to={paths.orders.view(row.id)}
        className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
      >
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium" title={row.customer}>
            {row.customer}
          </p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
            <span className="truncate">{row.reference}</span>
            <span>·</span>
            <span>{row.payment}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
              ageTone(days),
            )}
          >
            {days >= 7 && <TriangleAlert className="size-3" />}
            {days === 0 ? 'hoje' : `há ${days} d`}
          </span>
          <span className="w-20 text-right text-sm font-semibold tabular-nums">
            {formatEur(row.total)}
          </span>
        </div>
      </Link>
    </li>
  )
}
