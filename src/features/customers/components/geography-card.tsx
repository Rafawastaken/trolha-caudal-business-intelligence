import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum } from '@/lib/format'

import { useGeography } from '../queries'

/** Encomendas/receita por região (morada de entrega). */
export function GeographyCard() {
  const { data, isLoading } = useGeography()
  const sorted = [...(data ?? [])].sort((a, b) => b.revenue - a.revenue)
  const max = sorted.reduce((m, g) => Math.max(m, g.revenue), 0)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Geografia</CardTitle>
        <span className="text-xs text-muted-foreground">por receita</span>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem dados de geografia no período.
          </p>
        )}

        {sorted.length > 0 && (
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {sorted.map((g) => (
              <div key={g.region} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span
                    className="min-w-0 truncate text-muted-foreground"
                    title={g.region}
                  >
                    {g.region}
                  </span>
                  <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
                    <span className="font-medium">{formatEur(g.revenue)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatNum(g.orders)} enc.
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-2/70"
                    style={{ width: `${max ? (g.revenue / max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
