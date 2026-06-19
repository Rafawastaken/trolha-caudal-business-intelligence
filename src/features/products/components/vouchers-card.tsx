import { Ticket } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum } from '@/lib/format'

import { useVouchers } from '../queries'

/** Uso de cupões e desconto dado no período. */
export function VouchersCard() {
  const { data, isLoading } = useVouchers()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Cupões</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Ticket className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">Sem cupões no período</p>
            <p className="text-xs text-muted-foreground">
              Não houve uso de cupões.
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="-my-1 divide-y">
            {data.map((v) => (
              <li
                key={v.code}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-xs font-medium">
                    {v.code}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatNum(v.uses)} usos
                  </span>
                </span>
                <span className="shrink-0 font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                  −{formatEur(v.discount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
