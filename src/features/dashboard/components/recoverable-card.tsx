import { ArrowUpRight, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Kicker } from '@/components/kicker'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum } from '@/lib/format'
import { paths } from '@/paths'
import { useAbandonedCartsDetail } from '@/features/trends/queries'

/** Carrinhos abandonados recuperáveis (com contacto) — € em aberto, liga a Tendências. */
export function RecoverableCard() {
  const { data } = useAbandonedCartsDetail()

  return (
    <Link
      to={paths.trends}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <Card
        size="sm"
        className="group h-full justify-between px-5 py-5 transition-shadow hover:ring-primary/30"
      >
        <div className="flex items-center justify-between">
          <Kicker>Recuperável</Kicker>
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingCart className="size-3.5" />
          </span>
        </div>

        {!data ? (
          <Skeleton className="mt-3 h-14 w-full" />
        ) : (
          <div className="mt-3">
            <p className="font-display text-3xl font-bold leading-none tracking-tight tabular-nums">
              {formatEur(data.summary.value)}
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              {formatNum(data.summary.carts)} carrinhos com contacto
              <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </p>
          </div>
        )}
      </Card>
    </Link>
  )
}
