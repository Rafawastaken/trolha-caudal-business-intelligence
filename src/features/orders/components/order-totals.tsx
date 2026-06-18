import { formatEur } from '@/lib/format'

type OrderTotalsProps = {
  subtotal: number
  shipping: number
  discount: number
  total: number
}

/** Resumo de totais (subtotal, portes, desconto, total) de uma encomenda. */
export function OrderTotals({
  subtotal,
  shipping,
  discount,
  total,
}: OrderTotalsProps) {
  return (
    <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
      <Row label="Subtotal" value={formatEur(subtotal)} />
      <Row label="Portes" value={formatEur(shipping)} />
      {discount > 0 && (
        <Row label="Desconto" value={`−${formatEur(discount)}`} muted />
      )}
      <div className="flex items-center justify-between border-t pt-2">
        <span className="font-medium">Total</span>
        <span className="font-display text-lg font-bold tabular-nums">
          {formatEur(total)}
        </span>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? 'tabular-nums text-emerald-600 dark:text-emerald-400' : 'tabular-nums'}>
        {value}
      </span>
    </div>
  )
}
