import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatEurCompact, formatNum } from '@/lib/format'

import { useMonthly } from '../queries'
import type { MonthlyPoint } from '../schemas'
import { ChartTooltipBox } from './chart-tooltip'

function monthLabel(m: string): string {
  const [y, mo] = m.split('-')
  if (!y || !mo) return m
  const d = new Date(Number(y), Number(mo) - 1, 1)
  const label = d.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

type TooltipBoxProps = {
  active?: boolean
  payload?: Array<{ payload: MonthlyPoint }>
}

function MonthlyTooltip({ active, payload }: TooltipBoxProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <ChartTooltipBox
      title={monthLabel(p.month)}
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

/** Tendência mensal — receita (barras) + encomendas (linha). */
export function MonthlyChart() {
  const { data, isLoading } = useMonthly()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência mensal</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={monthLabel}
                  tickLine={false}
                  axisLine={false}
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
                  content={<MonthlyTooltip />}
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                />
                <Bar
                  yAxisId="rev"
                  dataKey="revenue"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                <Line
                  yAxisId="ord"
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
