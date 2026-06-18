import { useId } from 'react'

import { cn } from '@/lib/utils'

type TrolhaMarkProps = {
  className?: string
}

/**
 * Marca do trolha — só a gota de água (sem texto). Usada na sidebar colapsada
 * e dentro do wordmark. Gradiente com id único por instância (`useId`) para o
 * fill não partir quando há várias gotas na página.
 */
export function TrolhaMark({ className }: TrolhaMarkProps) {
  const gradientId = useId()
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#36B7CE" />
          <stop offset="100%" stopColor="#F5811E" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5c0 0 6.5 7.2 6.5 12.1A6.5 6.5 0 0 1 5.5 14.6C5.5 9.7 12 2.5 12 2.5Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M9.6 13.4a2.6 2.6 0 0 0 2.2 3.2"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  )
}
