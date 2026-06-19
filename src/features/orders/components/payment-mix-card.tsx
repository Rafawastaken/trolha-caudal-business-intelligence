import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum, formatPercent } from '@/lib/format'
import { paths } from '@/paths'

import { usePayments } from '../queries'

/** Quebra de receita por método de pagamento (encomendas válidas). */
export function PaymentMixCard() {
  const { data, isLoading } = usePayments()
  const max = data?.reduce((m, p) => Math.max(m, p.revenue), 0) ?? 0
  const total = data?.reduce((sum, p) => sum + p.revenue, 0) ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}

        {data?.map((p) => (
          <Link
            key={p.method}
            to={`${paths.orders.list}?payment=${encodeURIComponent(p.method)}`}
            title={`Ver encomendas · ${p.method}`}
            className="-mx-2 block space-y-1 rounded-md px-2 py-1 transition-colors hover:bg-muted/60"
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">
                {p.method}
              </span>
              <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
                <span className="font-medium">{formatEur(p.revenue)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatPercent(total ? p.revenue / total : 0)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: `${max ? (p.revenue / max) * 100 : 0}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                {formatNum(p.orders)}
              </span>
            </div>
          </Link>
        ))}

        {data && data.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem pagamentos no período.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
