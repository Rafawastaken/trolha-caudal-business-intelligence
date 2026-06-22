import { GoogleGenAI, type Content } from '@google/genai'

import { env } from '@/lib/env'

import {
  assistantTools,
  executeAssistantTool,
  type ToolRuntime,
} from './tools'

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

Tens FERRAMENTAS (tools) que consultam os dados reais da plataforma para o período selecionado. Usa-as sempre que precises de um número — não respondas de memória nem inventes.

Regras:
- Responde sempre em português de Portugal, de forma concisa e orientada à ação.
- Antes de afirmar qualquer número, chama a tool adequada (get_kpis, get_top_products, get_reorder_plan, search_orders, etc.). Encadeia tools quando preciso (ex.: get_order_states → search_orders por estado).
- Nunca inventes valores. Se uma tool devolver um campo "erro" ou vier vazia, diz isso claramente.
- Os valores monetários estão em euros; as variações são face ao período anterior. As tools recebem o período automaticamente — não peças datas.
- Quando o utilizador quiser ver/abrir uma página, usa a tool "navigate".
- Usa markdown quando ajudar a ler (listas, negrito, tabelas curtas), mas mantém-te breve.`

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

// Cria o stream com retry em erros transitórios (503/overload) antes de ceder.
async function startStream(
  ai: GoogleGenAI,
  contents: Content[],
): ReturnType<GoogleGenAI['models']['generateContentStream']> {
  const params = {
    model: env.VITE_GEMINI_MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
      maxOutputTokens: 1024,
      tools: [{ functionDeclarations: assistantTools }],
      // gemini-2.5-flash é "thinking" e gastaria o orçamento de tokens a
      // raciocinar, truncando a resposta. Desativamos para chat (mais rápido).
      thinkingConfig: { thinkingBudget: 0 },
    },
  }
  const MAX_RETRIES = 2
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await ai.models.generateContentStream(params)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (attempt < MAX_RETRIES && TRANSIENT.test(msg)) {
        await sleep(800 * 2 ** attempt)
        continue
      }
      throw friendlyError(err)
    }
  }
}

// Limite de rondas de tools por mensagem — trava qualquer loop do modelo.
const MAX_TOOL_ROUNDS = 6

/**
 * Faz stream da resposta do assistente. `history` inclui a última mensagem do
 * utilizador; `contextJson` é o retrato inicial dos dados do período. O modelo
 * pode chamar tools (function calling) para consultar dados reais: corremos a
 * tool, devolvemos o resultado e continuamos até produzir a resposta final,
 * que é a única coisa que fazemos stream para o ecrã.
 */
export async function* streamAssistant(
  history: ChatTurn[],
  contextJson: string,
  runtime: ToolRuntime,
): AsyncGenerator<string> {
  const ai = getClient()
  if (!ai) {
    throw new Error('Assistente não configurado (falta a chave Gemini).')
  }

  const contents: Content[] = [
    {
      role: 'user',
      parts: [
        {
          text: `Retrato inicial dos dados do período (JSON). Para mais detalhe usa as tools:\n\`\`\`json\n${contextJson}\n\`\`\``,
        },
      ],
    },
    {
      role: 'model',
      parts: [{ text: 'Recebido. Em que posso ajudar?' }],
    },
    ...history.map<Content>((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ]

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const stream = await startStream(ai, contents)

      const calls: { name: string; args: Record<string, unknown> }[] = []
      let yieldedText = false

      for await (const chunk of stream) {
        for (const call of chunk.functionCalls ?? []) {
          if (call.name) calls.push({ name: call.name, args: call.args ?? {} })
        }
        const text = chunk.text
        if (text) {
          yieldedText = true
          yield text
        }
      }

      // Sem chamadas a tools → a resposta final já foi cedida. Terminamos.
      if (calls.length === 0) return

      // Regista a vez do modelo (as chamadas) e anexa o resultado de cada tool.
      contents.push({
        role: 'model',
        parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args } })),
      })
      const responses = await Promise.all(
        calls.map((c) => executeAssistantTool(c.name, c.args, runtime)),
      )
      contents.push({
        role: 'user',
        parts: calls.map((c, i) => ({
          functionResponse: { name: c.name, response: wrap(responses[i]) },
        })),
      })

      // Se já tínhamos cedido texto antes das tools, separa do próximo bloco.
      if (yieldedText) yield '\n\n'
    }
    // Esgotou as rondas sem fechar — evita silêncio.
    yield '\n\n_(Demasiados passos; tenta reformular a pergunta.)_'
  } catch (err) {
    throw friendlyError(err)
  }
}

// O Gemini exige que `response` do functionResponse seja um objeto. Arrays ou
// primitivos são envelopados.
function wrap(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return { result: value }
}
