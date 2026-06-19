import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-context'
import { useLogout } from '@/features/auth/hooks'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const i = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  return i.toUpperCase() || '—'
}

export function AccountCard({ className }: { className?: string }) {
  const { employee } = useAuth()
  const logout = useLogout()
  const name = employee?.name ?? employee?.email ?? 'Funcionário'

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Conta</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="font-medium">{name}</p>
            {employee?.email && (
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            )}
            {employee?.role && (
              <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {employee.role}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="size-4" />
          Terminar sessão
        </Button>
      </CardContent>
    </Card>
  )
}
