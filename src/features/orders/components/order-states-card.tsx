import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNum } from '@/lib/format'
import { paths } from '@/paths'

import { orderState } from '../order-states'
import { useOrderStates } from '../queries'

/** Distribuição de encomendas por estado, no período. */
export function OrderStatesCard() {
  const { data, isLoading } = useOrderStates()
  const total = data?.reduce((a, s) => a + s.count, 0) ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}

        {data?.map((s) => {
          const label = s.label ?? orderState(s.id).label
          const pct = total ? (s.count / total) * 100 : 0
          return (
            <Link
              key={s.id}
              to={`${paths.orders.list}?state=${s.id}`}
              title={`Ver encomendas · ${label}`}
              className="-mx-2 block space-y-1 rounded-md px-2 py-1 transition-colors hover:bg-muted/60"
            >
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate text-muted-foreground">
                  {label}
                </span>
                <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
                  <span className="font-medium">{formatNum(s.count)}</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(pct)}%
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-2/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
