import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { orderState, type StatusTone } from '../order-states'
import type { OrderHistoryEntry } from '../schemas'

const DOT_CLASSES: Record<StatusTone, string> = {
  pending: 'bg-amber-500',
  progress: 'bg-blue-500',
  shipped: 'bg-cyan-500',
  success: 'bg-emerald-500',
  cancelled: 'bg-destructive',
  refunded: 'bg-muted-foreground',
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Histórico de estados da encomenda (timeline vertical). */
export function OrderStatusTimeline({
  history,
}: {
  history: OrderHistoryEntry[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l pl-5">
          {history.map((entry, i) => {
            const state = orderState(entry.stateId)
            const isLast = i === history.length - 1
            return (
              <li key={i} className="relative">
                <span
                  className={cn(
                    'absolute top-0.5 -left-[1.4rem] size-2.5 rounded-full ring-4 ring-card',
                    DOT_CLASSES[state.tone],
                  )}
                />
                <p
                  className={cn(
                    'text-sm font-medium',
                    !isLast && 'text-muted-foreground',
                  )}
                >
                  {state.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(entry.at)}
                </p>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
