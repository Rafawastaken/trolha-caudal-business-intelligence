import { Kicker } from '@/components/kicker'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNum } from '@/lib/format'
import { useTraffic } from '@/features/trends/queries'

/** Tráfego do período, compacto — visitas em destaque, views em apoio. */
export function TrafficMiniCard() {
  const { data } = useTraffic()

  return (
    <Card size="sm" className="h-full justify-between px-5 py-5">
      <div className="flex items-center justify-between">
        <Kicker>Tráfego</Kicker>
        <span className="text-[0.65rem] text-muted-foreground">no período</span>
      </div>

      {!data ? (
        <Skeleton className="mt-3 h-14 w-full" />
      ) : (
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl font-bold leading-none tracking-tight tabular-nums">
              {formatNum(data.visits.value)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">visitas</p>
          </div>
          <div className="space-y-1 text-right">
            <Vital label="page views" value={data.pageViews.value} />
            <Vital label="product views" value={data.productViews.value} />
          </div>
        </div>
      )}
    </Card>
  )
}

function Vital({ label, value }: { label: string; value: number }) {
  return (
    <p className="text-xs text-muted-foreground">
      <span className="mr-1.5 font-display text-sm font-semibold tabular-nums text-foreground">
        {formatNum(value)}
      </span>
      {label}
    </p>
  )
}
