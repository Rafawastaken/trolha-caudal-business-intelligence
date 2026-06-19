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
import { formatNum } from '@/lib/format'

import { useHour } from '../queries'
import type { HourPoint } from '../schemas'
import { ChartTooltipBox } from './chart-tooltip'

const hourLabel = (h: number) => `${h}h`

type TooltipBoxProps = { active?: boolean; payload?: Array<{ payload: HourPoint }> }

function HourTooltip({ active, payload }: TooltipBoxProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <ChartTooltipBox
      title={`${p.hour}h–${p.hour + 1}h`}
      rows={[
        {
          label: 'Encomendas',
          value: formatNum(p.orders),
          color: 'var(--chart-1)',
        },
      ]}
    />
  )
}

/** Distribuição de encomendas por hora do dia (0–23). */
export function HourChart() {
  const { data, isLoading } = useHour()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Por hora do dia</CardTitle>
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
                  dataKey="hour"
                  tickFormatter={hourLabel}
                  tickLine={false}
                  axisLine={false}
                  interval={1}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  content={<HourTooltip />}
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                />
                <Bar
                  dataKey="orders"
                  fill="var(--chart-1)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
