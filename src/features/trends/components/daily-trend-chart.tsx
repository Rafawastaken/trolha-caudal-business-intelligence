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
import { Skeleton } from '@/components/ui/skeleton'
import { fromIsoDate } from '@/lib/dates'
import { formatEur, formatEurCompact, formatNum } from '@/lib/format'

import { useDaily } from '../queries'
import type { DailyPoint } from '../schemas'
import { ChartTooltipBox } from './chart-tooltip'

function shortDay(iso: string): string {
  return fromIsoDate(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
  })
}

type TooltipBoxProps = { active?: boolean; payload?: Array<{ payload: DailyPoint }> }

function DailyTooltip({ active, payload }: TooltipBoxProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <ChartTooltipBox
      title={shortDay(p.date)}
      rows={[
        { label: 'Receita', value: formatEur(p.revenue), color: 'var(--chart-1)' },
        {
          label: 'Encomendas',
          value: formatNum(p.orders),
          color: 'var(--chart-2)',
        },
      ]}
    />
  )
}

/** Série diária — receita (área) + encomendas (barras), eixos independentes. */
export function DailyTrendChart() {
  const { data, isLoading } = useDaily()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Receita & encomendas por dia</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="trendRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
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
                  content={<DailyTooltip />}
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
                  fill="url(#trendRevFill)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
