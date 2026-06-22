import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { usePeriod } from '@/lib/period'

import { useAssistantContext } from './context'
import { streamAssistant, type ChatTurn } from './gemini'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e9)}`
}

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { json } = useAssistantContext()
  const { period } = usePeriod()
  const navigate = useNavigate()
  const busyRef = useRef(false)

  const send = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || busyRef.current) return
      busyRef.current = true
      setError(null)

      const userMsg: ChatMessage = { id: uid(), role: 'user', content }
      const replyId = uid()
      const history: ChatTurn[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: replyId, role: 'assistant', content: '' },
      ])
      setStreaming(true)

      try {
        let acc = ''
        for await (const chunk of streamAssistant(history, json, {
          period,
          navigate,
        })) {
          acc += chunk
          setMessages((prev) =>
            prev.map((m) => (m.id === replyId ? { ...m, content: acc } : m)),
          )
        }
        if (!acc) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === replyId ? { ...m, content: 'Sem resposta.' } : m,
            ),
          )
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível contactar o assistente.',
        )
        setMessages((prev) => prev.filter((m) => m.id !== replyId))
      } finally {
        setStreaming(false)
        busyRef.current = false
      }
    },
    [messages, json, period, navigate],
  )

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, send, streaming, error, reset }
}
