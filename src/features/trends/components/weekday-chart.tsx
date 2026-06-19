import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEur, formatNum } from '@/lib/format'

import { useWeekday } from '../queries'
import type { WeekdayPoint } from '../schemas'
import { ChartTooltipBox } from './chart-tooltip'

type TooltipBoxProps = {
  active?: boolean
  payload?: Array<{ payload: WeekdayPoint }>
}

function WeekdayTooltip({ active, payload }: TooltipBoxProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <ChartTooltipBox
      title={p.label}
      rows={[
        {
          label: 'Encomendas',
          value: formatNum(p.orders),
          color: 'var(--chart-2)',
        },
        { label: 'Receita', value: formatEur(p.revenue) },
      ]}
    />
  )
}

/** Distribuição de encomendas por dia da semana. */
export function WeekdayChart() {
  const { data, isLoading } = useWeekday()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Por dia da semana</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  content={<WeekdayTooltip />}
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                />
                <Bar
                  dataKey="orders"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
