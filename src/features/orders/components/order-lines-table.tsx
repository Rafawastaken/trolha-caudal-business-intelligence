import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatEur, formatNum } from '@/lib/format'

import type { OrderLine } from '../schemas'

/** Linhas de produto de uma encomenda. */
export function OrderLinesTable({ lines }: { lines: OrderLine[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Produto</TableHead>
          <TableHead className="text-right">Qtd</TableHead>
          <TableHead className="text-right">Preço unit.</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line, i) => (
          <TableRow key={i} className="hover:bg-transparent">
            <TableCell>
              <p className="font-medium">{line.name}</p>
              {line.sku && (
                <p className="font-mono text-xs text-muted-foreground">
                  {line.sku}
                </p>
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNum(line.qty)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {formatEur(line.unitPrice)}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatEur(line.total)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
