import { CalendarClock, Mail } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const EXAMPLES = [
  { name: 'Resumo semanal', when: 'Segunda · 08:00', to: 'gestão@trolha.pt' },
  { name: 'Alerta de stock baixo', when: 'Diário · 07:00', to: 'compras@trolha.pt' },
  { name: 'Top clientes mensal', when: 'Dia 1 · 09:00', to: 'comercial@trolha.pt' },
]

/**
 * Pré-visualização dos relatórios agendados por email (Fase 6). Requer backend
 * de agendamento/envio — ainda não disponível.
 */
export function ScheduledReportsCard() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4" />
          Relatórios agendados
        </CardTitle>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          Em breve
        </span>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <p className="text-xs text-muted-foreground">
          Envio automático por email (ex.: resumo semanal para a gestão) e
          snapshots partilháveis. Requer backend de agendamento/envio.
        </p>
        {EXAMPLES.map((e) => (
          <div
            key={e.name}
            className="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Mail className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{e.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {e.when} · {e.to}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">—</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
