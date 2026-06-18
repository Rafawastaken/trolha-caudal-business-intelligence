import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNum, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { FunnelLevel } from '../schemas'

export function FunnelCard({ funnel }: { funnel: FunnelLevel[] }) {
  const top = funnel[0]?.count ?? 1
  const last = funnel[funnel.length - 1]
  const overall = top === 0 ? 0 : (last?.count ?? 0) / top

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Funil de conversão</CardTitle>
        <span className="text-xs text-muted-foreground">
          conversão total{' '}
          <span className="font-medium text-foreground">
            {formatPercent(overall)}
          </span>
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {funnel.map((level, i) => {
          const width = top === 0 ? 0 : (level.count / top) * 100
          const isDrop = i > 0 && level.dropoff > 0
          return (
            <div key={level.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{level.label}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium tabular-nums">
                    {formatNum(level.count)}
                  </span>
                  {isDrop && (
                    <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-destructive">
                      −{formatPercent(level.dropoff)}
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    i === funnel.length - 1 ? 'bg-primary' : 'bg-primary/55',
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
