import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNum, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useCustomerMix } from '../queries'

/** Novos vs recorrentes no período — total + repartição. */
export function CustomerMixCard() {
  const { data, isLoading } = useCustomerMix()
  const total = data ? data.newCustomers + data.returning : 0
  const newPct = total ? data!.newCustomers / total : 0
  const retPct = total ? data!.returning / total : 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Novos vs recorrentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <Skeleton className="h-28 w-full" />}

        {data && (
          <>
            <div>
              <p className="text-xs text-muted-foreground">
                Clientes no período
              </p>
              <p className="font-display text-3xl font-bold tracking-tight tabular-nums">
                {formatNum(total)}
              </p>
            </div>

            <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="bg-primary" style={{ width: `${newPct * 100}%` }} />
              <div
                className="bg-chart-2"
                style={{ width: `${retPct * 100}%` }}
              />
            </div>

            <div className="space-y-2 text-sm">
              <LegendRow
                color="bg-primary"
                label="Novos"
                count={data.newCustomers}
                pct={newPct}
              />
              <LegendRow
                color="bg-chart-2"
                label="Recorrentes"
                count={data.returning}
                pct={retPct}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function LegendRow({
  color,
  label,
  count,
  pct,
}: {
  color: string
  label: string
  count: number
  pct: number
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className={cn('size-2.5 rounded-full', color)} />
        {label}
      </span>
      <span className="flex items-baseline gap-1.5 tabular-nums">
        <span className="font-medium">{formatNum(count)}</span>
        <span className="text-xs text-muted-foreground">
          {formatPercent(pct)}
        </span>
      </span>
    </div>
  )
}
