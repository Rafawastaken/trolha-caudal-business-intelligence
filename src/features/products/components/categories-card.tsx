import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatPercent } from '@/lib/format'

import { useCategories } from '../queries'

/** Vendas por categoria (quota de receita no período). */
export function CategoriesCard() {
  const { data, isLoading } = useCategories()
  const max = data?.reduce((m, c) => Math.max(m, c.revenue), 0) ?? 0
  const total = data?.reduce((sum, c) => sum + c.revenue, 0) ?? 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Categorias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}

        {data?.map((c) => (
          <div key={c.id} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate text-muted-foreground" title={c.name}>
                {c.name}
              </span>
              <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
                <span className="font-medium">{formatEur(c.revenue)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatPercent(total ? c.revenue / total : 0)}
                </span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-chart-2/70"
                style={{ width: `${max ? (c.revenue / max) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}

        {data && data.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem dados de categorias.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
