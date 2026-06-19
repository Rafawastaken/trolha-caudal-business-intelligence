import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/features/auth/auth-context'
import { paths } from '@/paths'

import { RouteFallback } from './route-fallback'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

// Lazy — tira o @google/genai (e deps de markdown) do bundle inicial; carrega
// só quando o assistente é aberto pela 1ª vez.
const AssistantPanel = lazy(() =>
  import('@/features/assistant/components/assistant-panel').then((m) => ({
    default: m.AssistantPanel,
  })),
)

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

        <div className="relative ml-2.5 flex min-w-0 flex-1 flex-col overflow-y-auto rounded-2xl border bg-card shadow-sm sm:ml-3">
          <Topbar
            assistantOpen={assistantOpen}
            onToggleAssistant={() => setAssistantOpen((o) => !o)}
          />
          <main className="flex-1 px-4 pt-5 pb-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full">
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>

        {/* Painel do assistente AI (Gemini) — lê os KPIs do período e responde. */}
        {assistantOpen && (
          <Suspense fallback={null}>
            <AssistantPanel onClose={() => setAssistantOpen(false)} />
          </Suspense>
        )}
      </div>
    </TooltipProvider>
  )
}
