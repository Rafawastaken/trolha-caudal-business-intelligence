import { useNavigate } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatEur } from '@/lib/format'
import { formatPtDate } from '@/lib/dates'
import { paths } from '@/paths'

import type { OrderRow } from '../schemas'
import { OrderStatusBadge } from './order-status-badge'

type OrdersTableProps = {
  rows: OrderRow[]
  loading?: boolean
  perPage: number
}

export function OrdersTable({ rows, loading, perPage }: OrdersTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Referência</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Pagamento</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: perPage }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => navigate(paths.orders.view(row.id))}
              >
                <TableCell className="font-mono text-xs font-medium">
                  {row.reference}
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-medium">
                  {row.customer}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatPtDate(row.date.slice(0, 10))}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge stateId={row.stateId} label={row.stateLabel} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.payment}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatEur(row.total)}
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
