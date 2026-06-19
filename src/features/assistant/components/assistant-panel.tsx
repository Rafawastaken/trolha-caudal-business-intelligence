import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Minimize2, Send, Sparkles, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useMediaQuery } from '@/lib/use-media-query'

import { assistantConfigured } from '../gemini'
import { useAssistant } from '../use-assistant'
import { MessageBubble } from './message-bubble'

const SUGGESTIONS = [
  'Como está a receita face ao período anterior?',
  'Qual é a taxa de abandono?',
  'Resume-me o funil de conversão.',
]

export function AssistantPanel({ onClose }: { onClose?: () => void }) {
  const { messages, send, streaming, error, reset } = useAssistant()
  const [input, setInput] = useState('')
  const [expanded, setExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const configured = assistantConfigured()

  // Em mobile (<lg) não há painel lateral — o assistente é sempre modal.
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const asModal = expanded || !isDesktop

  // No desktop, "reduzir" volta ao painel; em mobile fecha (não há painel).
  const collapseOrClose = () => {
    if (isDesktop) setExpanded(false)
    else onClose?.()
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // ESC: reduz a modal para painel (desktop) ou fecha (mobile).
  useEffect(() => {
    if (!asModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') collapseOrClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asModal, isDesktop])

  function submit() {
    const t = input.trim()
    if (!t || streaming) return
    setInput('')
    void send(t)
  }

  // Conteúdo partilhado entre painel lateral e modal — os hooks ficam no topo,
  // por isso o estado da conversa persiste ao alternar de modo.
  const panel = (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="font-display text-sm font-semibold">Assistente</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Pulse AI
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={reset}
              aria-label="Limpar conversa"
              title="Limpar conversa"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
          {isDesktop && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Reduzir' : 'Expandir para modal'}
              title={expanded ? 'Reduzir a painel' : 'Expandir para modal'}
            >
              {expanded ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Fechar assistente"
              title="Fechar"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {!configured ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            O assistente precisa de uma chave Gemini
            (<code className="text-xs">VITE_GEMINI_API_KEY</code>).
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5 text-center">
              <Sparkles className="mx-auto size-6 text-primary" />
              <p className="text-sm font-medium">Pergunta sobre o negócio</p>
              <p className="text-xs text-muted-foreground">
                Leio os indicadores do período selecionado e respondo.
              </p>
            </div>
            <div className="mx-auto max-w-md space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="w-full rounded-lg border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t p-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={configured ? 'Pergunta sobre o negócio…' : 'Indisponível'}
            disabled={!configured || streaming}
            rows={1}
            className="max-h-32 min-h-9 resize-none"
          />
          <Button
            size="icon"
            onClick={submit}
            disabled={!configured || streaming || !input.trim()}
            aria-label="Enviar"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </>
  )

  // Modo modal — portal para o body com backdrop. Sempre em mobile; em desktop
  // quando expandido. Clique no backdrop reduz a painel (desktop) ou fecha.
  if (asModal) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/40 p-4 duration-150 fade-in supports-[backdrop-filter]:backdrop-blur-sm sm:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) collapseOrClose()
        }}
      >
        <div className="flex h-full max-h-[90vh] w-full max-w-3xl animate-in flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl duration-150 zoom-in-95">
          {panel}
        </div>
      </div>,
      document.body,
    )
  }

  // Modo painel lateral (inline no shell, só em ecrãs grandes).
  return (
    <aside className="ml-2.5 hidden w-96 shrink-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm sm:ml-3 lg:flex">
      {panel}
    </aside>
  )
}
