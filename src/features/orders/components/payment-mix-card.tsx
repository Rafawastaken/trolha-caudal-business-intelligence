import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum } from '@/lib/format'

import { usePayments } from '../queries'

/** Quebra de receita por método de pagamento (encomendas válidas). */
export function PaymentMixCard() {
  const { data, isLoading } = usePayments()
  const max = data?.reduce((m, p) => Math.max(m, p.revenue), 0) ?? 0

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
          <div key={p.method} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{p.method}</span>
              <span className="font-medium tabular-nums">
                {formatEur(p.revenue)}
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
          </div>
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
