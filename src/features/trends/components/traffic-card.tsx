import { Eye, MousePointerClick, Users } from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'

import { Kicker } from '@/components/kicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fromIsoDate } from '@/lib/dates'
import { formatNum } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useTraffic } from '../queries'
import type { TrafficMetric } from '../schemas'
import { ChartTooltipBox } from './chart-tooltip'

function shortDay(iso: string): string {
  return fromIsoDate(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
  })
}

function DeltaChip({ delta }: { delta: number }) {
  const up = delta >= 0
  const pct = Math.abs(delta * 100).toLocaleString('pt-PT', {
    maximumFractionDigits: 1,
  })
  return (
    <span
      className={cn(
        'rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
        up
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'bg-destructive/10 text-destructive',
      )}
    >
      {up ? '+' : '−'}
      {pct}%
    </span>
  )
}

function Metric({
  icon: Icon,
  label,
  metric,
}: {
  icon: typeof Eye
  label: string
  metric: TrafficMetric
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-lg font-bold tabular-nums">
            {formatNum(metric.value)}
          </span>
          {/* sem base no período anterior → o delta seria enganador */}
          {metric.previous > 0 && <DeltaChip delta={metric.delta} />}
        </div>
      </div>
    </div>
  )
}

type TrafficTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: { date: string; visits: number; pageViews: number } }>
}

function TrafficTooltip({ active, payload }: TrafficTooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <ChartTooltipBox
      title={shortDay(p.date)}
      rows={[
        { label: 'Visitas', value: formatNum(p.visits), color: 'var(--chart-1)' },
        {
          label: 'Page views',
          value: formatNum(p.pageViews),
          color: 'var(--chart-2)',
        },
      ]}
    />
  )
}

/** Tráfego first-party (cookieless) — page views, visitas, product views. */
export function TrafficCard() {
  const { data, isLoading } = useTraffic()

  return (
    <Card className="h-full">
      <CardHeader>
        <Kicker>First-party · cookieless</Kicker>
        <CardTitle>Tráfego</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Metric icon={Eye} label="Page views" metric={data.pageViews} />
              <Metric icon={Users} label="Visitas" metric={data.visits} />
              <Metric
                icon={MousePointerClick}
                label="Product views"
                metric={data.productViews}
              />
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.daily}
                  margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
                >
                  <defs>
                    <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={shortDay}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  />
                  <Tooltip
                    content={<TrafficTooltip />}
                    cursor={{ stroke: 'var(--border)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#trafficFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
