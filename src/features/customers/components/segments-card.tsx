import { AlertTriangle, Moon, Sparkles, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Segment = { icon: LucideIcon; label: string; hint: string }

const SEGMENTS: Segment[] = [
  { icon: AlertTriangle, label: 'Em risco / churn', hint: 'compravam e pararam' },
  { icon: Moon, label: 'Inativos', hint: 'sem compras recentes' },
  { icon: TrendingUp, label: 'Alto potencial', hint: 'a crescer rápido' },
  { icon: Sparkles, label: 'Valor de vida (LTV)', hint: 'receita acumulada' },
]

/**
 * Pré-visualização da segmentação de clientes (evolução para CRM). Requer
 * histórico por cliente — endpoints ainda não disponíveis no backend.
 */
export function SegmentsCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Segmentação</CardTitle>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          Em breve
        </span>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <p className="text-xs text-muted-foreground">
          Requer histórico por cliente (novos endpoints). Planeado na evolução
          para CRM.
        </p>
        {SEGMENTS.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <s.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{s.label}</p>
              <p className="truncate text-xs text-muted-foreground">{s.hint}</p>
            </div>
            <span className="text-sm text-muted-foreground tabular-nums">—</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
