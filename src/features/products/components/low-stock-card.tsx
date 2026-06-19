import { PackageX } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNum } from '@/lib/format'
import { getLowStockThreshold } from '@/lib/preferences'
import { cn } from '@/lib/utils'

import { useLowStock } from '../queries'

/** Produtos em rutura / stock baixo (retrato atual, nível produto). */
export function LowStockCard() {
  // Limiar configurável nas Definições; entra no queryKey via useLowStock.
  const threshold = getLowStockThreshold()
  const { data, isLoading } = useLowStock(threshold)

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Stock baixo</CardTitle>
        <span className="text-xs text-muted-foreground">≤ {threshold} un.</span>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <PackageX className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">Stock em dia</p>
            <p className="text-xs text-muted-foreground">
              Nenhum produto em rutura.
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="-my-1 max-h-80 divide-y overflow-y-auto">
            {data.map((p) => {
              const out = p.quantity <= 0
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate" title={p.name}>
                    {p.name}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                      out
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {out ? 'Esgotado' : `${formatNum(p.quantity)} un.`}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
