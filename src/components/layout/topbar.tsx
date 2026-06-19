import { LogOut, Moon, Sparkles, Sun, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/auth-context'
import { useLogout } from '@/features/auth/hooks'
import { useTheme } from '@/lib/theme'

import { PeriodPicker } from './period-picker'

type TopbarProps = {
  /** Alterna o painel do assistente AI. */
  onToggleAssistant?: () => void
  assistantOpen?: boolean
}

export function Topbar({ onToggleAssistant, assistantOpen }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { employee } = useAuth()
  const logout = useLogout()

  const displayName = employee?.name ?? employee?.email ?? 'Funcionário'

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-card/70 px-4 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60">
      <div className="min-w-0">
        <PeriodPicker />
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant={assistantOpen ? 'secondary' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={onToggleAssistant}
        >
          <Sparkles className="size-4 text-primary" />
          <span className="hidden sm:inline">Assistente</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Conta">
              <User className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium">{displayName}</p>
              {employee?.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {employee.email}
                </p>
              )}
            </div>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="size-4" />
              Terminar sessão
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
