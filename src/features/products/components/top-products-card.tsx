import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum } from '@/lib/format'

import { useTopProducts } from '../queries'

/** Best-sellers do período — ranking por receita, com unidades vendidas. */
export function TopProductsCard() {
  const { data, isLoading } = useTopProducts()
  const max = data?.reduce((m, p) => Math.max(m, p.revenue), 0) ?? 0

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Best-sellers</CardTitle>
        <span className="text-xs text-muted-foreground">por receita</span>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}

        {data?.map((p, i) => (
          <div key={p.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="truncate font-medium" title={p.name}>
                  {p.name}
                </span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatEur(p.revenue)}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-7.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: `${max ? (p.revenue / max) * 100 : 0}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">
                {formatNum(p.qty)} un.
              </span>
            </div>
          </div>
        ))}

        {data && data.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem vendas no período.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
