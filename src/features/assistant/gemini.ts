import { GoogleGenAI } from '@google/genai'

import { env } from '@/lib/env'

// Cliente Gemini — chama a Generative Language API diretamente do browser
// (ferramenta protegida por login). A chave vive em VITE_GEMINI_API_KEY.

export type ChatRole = 'user' | 'assistant'
export type ChatTurn = { role: ChatRole; content: string }

export const assistantConfigured = (): boolean =>
  env.VITE_GEMINI_API_KEY.trim().length > 0

let client: GoogleGenAI | null = null
function getClient(): GoogleGenAI | null {
  if (!assistantConfigured()) return null
  client ??= new GoogleGenAI({ apiKey: env.VITE_GEMINI_API_KEY })
  return client
}

const SYSTEM_INSTRUCTION = `És o Pulse, o assistente de Business Intelligence da loja trolha.pt (nº1 em bombas de água em Portugal). Ajudas a equipa de compras e de gestão a ler o negócio.

Regras:
- Responde sempre em português de Portugal, de forma concisa e orientada à ação.
- Baseia-te APENAS nos dados do período fornecidos em JSON. Não inventes números.
- Se te perguntarem algo que não está nos dados, diz que ainda não tens acesso a essa informação (a app está em desenvolvimento).
- Os valores monetários estão em euros; as variações (delta) são face ao período anterior.
- Usa markdown quando ajudar a ler (listas, negrito), mas mantém-te breve.`

// Erros transitórios do Gemini (sobrecarga / rate limit) que vale a pena repetir.
const TRANSIENT = /unavailable|overloaded|high demand|resource.?exhausted|\b(429|500|503)\b/i

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function friendlyError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err)
  if (TRANSIENT.test(msg)) {
    return new Error(
      'O assistente está com muita procura neste momento. Tenta novamente daqui a pouco.',
    )
  }
  if (/api.?key|permission|unauthenticated|invalid/i.test(msg)) {
    return new Error('Chave do assistente inválida ou sem permissões.')
  }
  return new Error('Não foi possível contactar o assistente.')
}

/**
 * Faz stream da resposta do assistente. `history` inclui a última mensagem do
 * utilizador; `contextJson` é o retrato dos dados do período atual. Repete em
 * erros transitórios (sobrecarga do modelo) com backoff antes de desistir.
 */
export async function* streamAssistant(
  history: ChatTurn[],
  contextJson: string,
): AsyncGenerator<string> {
  const ai = getClient()
  if (!ai) {
    throw new Error('Assistente não configurado (falta a chave Gemini).')
  }

  const contents = [
    {
      role: 'user' as const,
      parts: [
        {
          text: `Dados do período atual (JSON):\n\`\`\`json\n${contextJson}\n\`\`\``,
        },
      ],
    },
    {
      role: 'model' as const,
      parts: [{ text: 'Recebido. Em que posso ajudar com estes dados?' }],
    },
    ...history.map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    })),
  ]

  const params = {
    model: env.VITE_GEMINI_MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
      maxOutputTokens: 1024,
      // gemini-2.5-flash é "thinking" e gastaria o orçamento de tokens a
      // raciocinar, truncando a resposta. Desativamos para chat (mais rápido).
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  // A criação do stream é onde o 503 (sobrecarga) costuma surgir — repetimos
  // com backoff antes de ceder os primeiros chunks.
  const MAX_RETRIES = 2
  let stream
  for (let attempt = 0; ; attempt += 1) {
    try {
      stream = await ai.models.generateContentStream(params)
      break
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (attempt < MAX_RETRIES && TRANSIENT.test(msg)) {
        await sleep(800 * 2 ** attempt)
        continue
      }
      throw friendlyError(err)
    }
  }

  try {
    for await (const chunk of stream) {
      const text = chunk.text
      if (text) yield text
    }
  } catch (err) {
    throw friendlyError(err)
  }
}
