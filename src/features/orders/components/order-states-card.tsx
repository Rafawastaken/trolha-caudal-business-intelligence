import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNum } from '@/lib/format'

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
          const label = orderState(s.id).label
          const pct = total ? (s.count / total) * 100 : 0
          return (
            <div key={s.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium tabular-nums">
                  {formatNum(s.count)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-2/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
