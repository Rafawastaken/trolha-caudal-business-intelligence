import { cn } from '@/lib/utils'

import { TrolhaMark } from './trolha-mark'

type TrolhaWordmarkProps = {
  className?: string
}

/**
 * Wordmark tipográfico do trolha — gota (TrolhaMark) + "trolha.pt" em texto
 * (não a imagem com fundo branco) para assentar em superfícies escuras. ".pt"
 * em laranja. Usa a face display.
 */
export function TrolhaWordmark({ className }: TrolhaWordmarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight',
        className,
      )}
    >
      <TrolhaMark className="size-[1.1em]" />
      <span className="leading-none">
        trolha<span className="text-[#F5811E]">.pt</span>
      </span>
    </span>
  )
}
