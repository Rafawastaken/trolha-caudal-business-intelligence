import { Kicker } from '@/components/kicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNum, formatPercent } from '@/lib/format'

import { useConsent } from '../queries'

const SEGMENTS = [
  { key: 'granted', label: 'Aceitou', color: 'var(--chart-2)' },
  { key: 'partial', label: 'Parcial', color: 'var(--chart-4)' },
  { key: 'denied', label: 'Recusou', color: 'var(--chart-1)' },
] as const

/** Consentimento de cookies — taxa de aceitação, decisão e repartição. */
export function ConsentCard() {
  const { data, isLoading } = useConsent()

  const total = data ? data.granted + data.partial + data.denied : 0

  return (
    <Card className="h-full">
      <CardHeader>
        <Kicker>RGPD</Kicker>
        <CardTitle>Consentimento de cookies</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-44 w-full" />
        ) : data ? (
          <div className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-3xl font-bold tabular-nums">
                  {formatPercent(data.grantRate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  aceitação (de quem decidiu)
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums">
                  {formatPercent(data.decisionRate)}
                </p>
                <p className="text-xs text-muted-foreground">tomaram decisão</p>
              </div>
            </div>

            {/* barra de repartição */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
              {total > 0 &&
                SEGMENTS.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      width: `${(data[s.key] / total) * 100}%`,
                      backgroundColor: s.color,
                    }}
                  />
                ))}
            </div>

            <div className="space-y-2 text-sm">
              {SEGMENTS.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatNum(data[s.key])}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-2 border-t pt-2 text-muted-foreground">
                <span>Analítica permitida</span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatNum(data.analyticsGranted)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
