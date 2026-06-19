import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/lib/env'

export function DataConnectionCard() {
  const rows = [
    {
      label: 'Fonte de dados',
      value: env.VITE_USE_MOCK ? 'Demonstração (mock)' : 'API em direto',
    },
    { label: 'Endpoint', value: env.VITE_API_URL || 'Mesma origem · /kpi-api' },
    { label: 'Sessão', value: '8 horas (JWT)' },
    {
      label: 'Assistente AI',
      value: env.VITE_GEMINI_API_KEY ? 'Configurado' : 'Sem chave',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados & ligação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="min-w-0 truncate font-medium" title={r.value}>
              {r.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
