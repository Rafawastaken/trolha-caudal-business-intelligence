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
    <Card size="sm" className="gap-0 px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground/70" />}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <span className="mt-2 font-display text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
      )}
      {sublabel && (
        <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
      )}
    </Card>
  )
}
