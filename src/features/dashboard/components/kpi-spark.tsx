import { Area, AreaChart, ResponsiveContainer } from 'recharts'

type KpiSparkProps = {
  data: number[]
  /** Cor da linha/área (CSS color). Default: laranja trolha. */
  color?: string
}

/** Sparkline minimalista (sem eixos) para reforçar a tendência de um KPI. */
export function KpiSpark({ data, color = 'var(--chart-1)' }: KpiSparkProps) {
  const points = data.map((value, i) => ({ i, value }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="tt-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill="url(#tt-spark)"
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
