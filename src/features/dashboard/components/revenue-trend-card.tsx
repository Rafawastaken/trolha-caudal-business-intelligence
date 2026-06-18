import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fromIsoDate } from '@/lib/dates'
import { formatEur, formatEurCompact, formatNum } from '@/lib/format'

import type { DailyPoint } from '../schemas'

function shortDay(iso: string): string {
  return fromIsoDate(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
  })
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ payload: DailyPoint }>
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{shortDay(point.date)}</p>
      <p className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Receita</span>
        <span className="font-medium tabular-nums">
          {formatEur(point.revenue)}
        </span>
      </p>
      <p className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Encomendas</span>
        <span className="font-medium tabular-nums">
          {formatNum(point.orders)}
        </span>
      </p>
    </div>
  )
}

export function RevenueTrendCard({ daily }: { daily: DailyPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita & encomendas por dia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={daily}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tickFormatter={shortDay}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                yAxisId="rev"
                tickFormatter={(v: number) => formatEurCompact(v)}
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis yAxisId="ord" hide />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              />
              <Bar
                yAxisId="ord"
                dataKey="orders"
                fill="var(--chart-2)"
                opacity={0.25}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
              <Area
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#revFill)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
