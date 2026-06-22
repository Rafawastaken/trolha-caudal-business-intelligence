import { Kicker } from '@/components/kicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum } from '@/lib/format'

import { useAbandonedCartsDetail } from '../queries'

/**
 * Carrinhos abandonados em detalhe — os mais valiosos, com cliente/contacto,
 * para recuperação. Valor estimado s/ IVA. Só os carrinhos com cliente são
 * acionáveis (têm contacto).
 */
export function AbandonedCartsDetailCard() {
  const { data, isLoading } = useAbandonedCartsDetail()

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <Kicker>Abandono</Kicker>
          <CardTitle>Carrinhos recuperáveis</CardTitle>
          <p className="text-xs text-muted-foreground">
            Abandonados de maior valor · estimativa s/ IVA
          </p>
        </div>
        {data && (
          <div className="shrink-0 text-right">
            <p className="text-lg font-semibold tabular-nums">
              {formatEur(data.summary.value)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatNum(data.summary.carts)} com contacto
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        )}

        {data && data.rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem carrinhos abandonados com detalhe no período.
          </p>
        )}

        {data && data.rows.length > 0 && (
          <ul className="-my-1 max-h-[26rem] divide-y overflow-y-auto">
            {data.rows.map((row, i) => (
              <li
                key={row.id ?? `${row.customer}-${i}`}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium" title={row.customer}>
                    {row.customer}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.email ?? 'sem contacto'} · {formatNum(row.items)}{' '}
                    {row.items === 1 ? 'item' : 'itens'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatEur(row.value)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
