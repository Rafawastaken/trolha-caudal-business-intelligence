import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum, formatPercent } from '@/lib/format'
import { useOrdersSummary } from '@/features/orders/queries'

import { useTopCustomers } from '../queries'

const INSET =
  '[&_th:first-child]:pl-5 [&_td:first-child]:pl-5 [&_th:last-child]:pr-5 [&_td:last-child]:pr-5'

/** Top clientes do período — tabela por receita, com ticket médio e concentração. */
export function TopCustomersCard() {
  const { data, isLoading } = useTopCustomers()
  const summary = useOrdersSummary()

  const topRevenue = data?.reduce((s, c) => s + c.revenue, 0) ?? 0
  const totalRevenue = summary.data?.revenue ?? 0
  const concentration = totalRevenue
    ? Math.min(1, topRevenue / totalRevenue)
    : 0

  return (
    <div className="h-full overflow-hidden rounded-xl border bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <span className="font-heading text-base font-medium">Top clientes</span>
        <span className="text-xs text-muted-foreground">por receita</span>
      </div>

      <Table className={INSET}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8">#</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Enc.</TableHead>
            <TableHead className="text-right">Ticket médio</TableHead>
            <TableHead className="text-right">Receita</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data?.map((c, i) => (
                <TableRow key={c.id} className="hover:bg-transparent">
                  <TableCell className="text-muted-foreground tabular-nums">
                    {i + 1}
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate font-medium"
                    title={c.name}
                  >
                    {c.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNum(c.orders)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatEur(c.orders ? c.revenue / c.orders : 0)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatEur(c.revenue)}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {data && data.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Sem clientes no período.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          Os top {data.length} clientes representam{' '}
          <span className="font-medium text-foreground">
            {formatPercent(concentration)}
          </span>{' '}
          da receita do período.
        </div>
      )}
    </div>
  )
}
