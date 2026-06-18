import { cn } from '@/lib/utils'

const WIDTH = 1200
const HEIGHT = 220

/** Gera um caminho sinusoidal suave ao longo da largura total. */
function wavePath(amplitude: number, periods: number, phase: number): string {
  const mid = HEIGHT / 2
  const steps = 80
  let d = `M 0 ${mid}`
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * WIDTH
    const y = mid + Math.sin((i / steps) * periods * Math.PI * 2 + phase) * amplitude
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}

type FlowLineProps = {
  d: string
  color: string
  dash: string
  duration: number
  width: number
  opacity: number
}

/** Partículas a fluir ao longo de uma onda (caudal). */
function FlowLine({ d, color, dash, duration, width, opacity }: FlowLineProps) {
  return (
    <path
      className="tt-flow-line"
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      opacity={opacity}
      style={{ animation: `tt-flow-dash ${duration}s linear infinite` }}
    />
  )
}

type FlowWaveProps = {
  className?: string
}

/**
 * Assinatura do login: o "caudal" do negócio. Duas ondas com partículas a
 * fluir (cyan-água atrás, laranja à frente) sobre um leito ténue. Pausa com
 * prefers-reduced-motion (ver index.css).
 */
export function FlowWave({ className }: FlowWaveProps) {
  const back = wavePath(30, 2, 0)
  const front = wavePath(22, 2.5, Math.PI / 2)

  return (
    <svg
      className={cn('w-full', className)}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* leito do "tubo" */}
      <path d={back} fill="none" stroke="#13354F" strokeWidth={10} opacity={0.5} />
      <FlowLine d={back} color="#36B7CE" dash="2 22" duration={9} width={4} opacity={0.55} />
      <FlowLine d={front} color="#F5811E" dash="2 18" duration={6} width={4.5} opacity={0.95} />
    </svg>
  )
}
