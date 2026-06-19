import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STACK = ['Vite', 'React 19', 'Tailwind v4', 'TanStack Query', 'Recharts']

export function AboutCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sobre</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-display text-base font-semibold">Pulse</p>
        <p className="text-muted-foreground">
          Business Intelligence para o trolha.pt — converte os dados da loja numa
          leitura clara do negócio.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {STACK.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
