import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/features/auth/auth-context'
import { paths } from '@/paths'

import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

const COLLAPSED_KEY = 'tt_sidebar_collapsed'

/**
 * Shell autenticado (padrão do gestor de campanhas): sidebar flutuante
 * colapsável + um único cartão de conteúdo que contém o topbar (cabeçalho) e o
 * main (scroll). O canvas envolve tudo com margem.
 */
export function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () =>
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(COLLAPSED_KEY) === '1',
  )

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location }} />
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-svh overflow-hidden bg-background p-2.5 sm:p-3">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />

        <div className="relative ml-2.5 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm sm:ml-3">
          <Topbar
            assistantOpen={assistantOpen}
            onToggleAssistant={() => setAssistantOpen((o) => !o)}
          />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Painel do assistente AI — implementado na Fase 5. */}
        {assistantOpen && (
          <aside className="ml-2.5 hidden w-80 shrink-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm sm:ml-3 lg:flex">
            <div className="flex h-14 items-center border-b px-4 font-display text-sm font-semibold">
              Assistente
            </div>
            <div className="flex-1 p-4 text-sm text-muted-foreground">
              O assistente chega na próxima fase.
            </div>
          </aside>
        )}
      </div>
    </TooltipProvider>
  )
}
