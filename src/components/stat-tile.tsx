import type { LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type StatTileProps = {
  label: string
  value: string
  icon?: LucideIcon
  sublabel?: string
  loading?: boolean
}

/** Tile de estatística simples (sem variação) — reutilizável entre features. */
export function StatTile({
  label,
  value,
  icon: Icon,
  sublabel,
  loading,
}: StatTileProps) {
  return (
    <Card size="sm" className="justify-center px-4 py-4 sm:px-5">
      <div className="flex items-center gap-3 sm:gap-3.5">
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-11">
            <Icon className="size-4 sm:size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-tight text-muted-foreground sm:text-sm">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-20" />
          ) : (
            <p className="font-display text-xl font-bold leading-tight tracking-tight tabular-nums sm:text-2xl">
              {value}
            </p>
          )}
          {sublabel && (
            <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
