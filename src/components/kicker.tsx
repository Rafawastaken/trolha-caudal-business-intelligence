import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Eyebrow/kicker — etiqueta curta em monospace maiúsculas com tracking largo.
 * É a assinatura tipográfica do Pulse (vem do banner da Receita) e dá coerência
 * a todos os cards de topo. Mantém-se discreta; o número é que manda.
 */
export function Kicker({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground',
        className,
      )}
    >
      {children}
    </p>
  )
}
