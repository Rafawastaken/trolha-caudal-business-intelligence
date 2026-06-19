import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

import { formatEur } from '@/lib/format'
import { formatPtDate } from '@/lib/dates'

type KpiSparkProps = {
  data: number[]
  /** Datas (YYYY-MM-DD) alinhadas a `data`, para o tooltip de hover. */
  labels?: string[]
  /** Cor da linha/área (CSS color). Default: laranja trolha. */
  color?: string
  /** Formatação do valor no tooltip. Default: moeda EUR. */
  valueFormat?: (value: number) => string
}

type SparkPoint = { i: number; value: number; label?: string }

/** Sparkline minimalista (sem eixos) com tooltip de valor no hover. */
export function KpiSpark({
  data,
  labels,
  color = 'var(--chart-1)',
  valueFormat = formatEur,
}: KpiSparkProps) {
  const points: SparkPoint[] = data.map((value, i) => ({
    i,
    value,
    label: labels?.[i],
  }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="tt-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          content={<SparkTooltip valueFormat={valueFormat} />}
          cursor={{ stroke: color, strokeOpacity: 0.35, strokeWidth: 1 }}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill="url(#tt-spark)"
          isAnimationActive={false}
          dot={false}
          activeDot={{ r: 3, fill: color, stroke: '#08131F', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

type SparkTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: SparkPoint }>
  valueFormat: (value: number) => string
}

function SparkTooltip({ active, payload, valueFormat }: SparkTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-md border border-white/10 bg-[#0c1a28] px-2.5 py-1.5 text-xs shadow-lg">
      {point.label && (
        <p className="text-[#8DA2B4]">{formatPtDate(point.label)}</p>
      )}
      <p className="font-medium tabular-nums text-white">
        {valueFormat(point.value)}
      </p>
    </div>
  )
}
