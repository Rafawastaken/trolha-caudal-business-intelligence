import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNum, formatPercent } from '@/lib/format'

import { useAbandonedCarts } from '../queries'

/** Carrinhos abandonados vs convertidos — taxa de abandono em destaque. */
export function AbandonedCartsCard() {
  const { data, isLoading } = useAbandonedCarts()

  const slices = data
    ? [
        { name: 'Abandonados', value: data.abandoned, color: 'var(--chart-1)' },
        { name: 'Convertidos', value: data.converted, color: 'var(--chart-2)' },
      ]
    : []

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Carrinhos abandonados</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="mx-auto h-44 w-44 rounded-full" />
        ) : data ? (
          <div className="flex flex-col items-center gap-5">
            <div className="relative h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {slices.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold tabular-nums">
                  {formatPercent(data.rate / 100)}
                </span>
                <span className="text-xs text-muted-foreground">abandono</span>
              </div>
            </div>

            <div className="w-full space-y-2 text-sm">
              <LegendRow
                color="var(--chart-1)"
                label="Abandonados"
                value={formatNum(data.abandoned)}
              />
              <LegendRow
                color="var(--chart-2)"
                label="Convertidos"
                value={formatNum(data.converted)}
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function LegendRow({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
