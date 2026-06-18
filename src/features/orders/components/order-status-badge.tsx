import { orderState, type StatusTone } from '../order-states'
import { cn } from '@/lib/utils'

const TONE_CLASSES: Record<StatusTone, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  shipped: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',
}

/** Badge de estado de encomenda — cor por "tone" (ver order-states). */
export function OrderStatusBadge({
  stateId,
  label,
}: {
  stateId: number
  label?: string
}) {
  const state = orderState(stateId)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        TONE_CLASSES[state.tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? state.label}
    </span>
  )
}
