import type { LowStockItem, TopProduct } from './schemas'

// Reposição de stock acionável — cruza o que VENDE (top-products do período)
// com o que está em RUTURA/baixo (low-stock, retrato atual), ambos com
// `product_id`, e devolve uma lista priorizada por urgência: o que repor
// primeiro, quantos dias de cobertura restam e quanto encomendar.
//
// Constrangimento (versão "estreita", só frontend): só vemos produtos que
// aparecem nas DUAS listas. Um best-seller com stock acima do tecto não entra
// — apanhar o catálogo inteiro exigiria um endpoint /stock-velocity.

/** Stock (un.) até ao qual um produto é candidato a reposição. */
export const REORDER_STOCK_CEILING = 40
/** Vendas no período abaixo das quais a velocidade é ruidosa (baixa confiança). */
const LOW_CONFIDENCE_QTY = 5

export type ReorderUrgency = 'out' | 'critical' | 'warning'

export type ReorderSuggestion = {
  id: number
  name: string
  /** Stock atual (pode ser ≤ 0 = esgotado). */
  stock: number
  /** Unidades vendidas no período. */
  soldQty: number
  /** Receita do produto no período. */
  revenue: number
  /** Velocidade de venda em unidades/dia. */
  velocityPerDay: number
  /** Dias até esgotar ao ritmo atual (null se sem velocidade fiável). */
  daysOfCover: number | null
  /** Unidades sugeridas a encomendar para atingir a cobertura alvo. */
  suggestedQty: number
  urgency: ReorderUrgency
  /** Poucas vendas no período → estimativa pouco fiável. */
  lowConfidence: boolean
}

export type ReorderParams = {
  /** Dias cobertos pelo período (divisor da velocidade). */
  periodDays: number
  /** Lead-time do fornecedor (dias). */
  leadTimeDays: number
  /** Dias de stock a manter para além do lead-time. */
  targetCoverDays: number
}

/**
 * Combina best-sellers × stock baixo num plano de reposição.
 *
 * Modelo (ponto de encomenda / par level clássico):
 *   velocidade   = vendidas / diasDoPeríodo            (un./dia)
 *   cobertura    = stock / velocidade                  (dias até esgotar)
 *   stockAlvo    = (leadTime + coberturaAlvo) × velocidade
 *   sugerido     = max(0, ⌈stockAlvo − stock⌉)
 *
 * Devolve só produtos que precisam de ação (sugerido > 0 ou já esgotados),
 * ordenados por urgência (menos dias de cobertura primeiro).
 */
export function computeReorder(
  topProducts: TopProduct[],
  lowStock: LowStockItem[],
  { periodDays, leadTimeDays, targetCoverDays }: ReorderParams,
): ReorderSuggestion[] {
  const days = Math.max(1, periodDays)
  const soldById = new Map(topProducts.map((p) => [p.id, p]))

  const out: ReorderSuggestion[] = []
  for (const item of lowStock) {
    const sold = soldById.get(item.id)
    // Sem vendas no período → nenhum sinal de procura; não repor às cegas.
    if (!sold || sold.qty <= 0) continue

    const stock = item.quantity
    const velocityPerDay = sold.qty / days
    const isOut = stock <= 0
    const daysOfCover =
      velocityPerDay > 0 ? Math.max(0, stock) / velocityPerDay : null

    const targetStock = (leadTimeDays + targetCoverDays) * velocityPerDay
    const suggestedQty = Math.max(0, Math.ceil(targetStock - Math.max(0, stock)))

    // Já tem cobertura suficiente e não está esgotado → fora do plano.
    if (!isOut && suggestedQty <= 0) continue

    const urgency: ReorderUrgency = isOut
      ? 'out'
      : daysOfCover !== null && daysOfCover < leadTimeDays
        ? 'critical'
        : 'warning'

    out.push({
      id: item.id,
      name: item.name,
      stock,
      soldQty: sold.qty,
      revenue: sold.revenue,
      velocityPerDay,
      daysOfCover,
      suggestedQty,
      urgency,
      lowConfidence: sold.qty < LOW_CONFIDENCE_QTY,
    })
  }

  const rank: Record<ReorderUrgency, number> = { out: 0, critical: 1, warning: 2 }
  return out.sort((a, b) => {
    if (rank[a.urgency] !== rank[b.urgency]) return rank[a.urgency] - rank[b.urgency]
    const ca = a.daysOfCover ?? Infinity
    const cb = b.daysOfCover ?? Infinity
    if (ca !== cb) return ca - cb
    return b.revenue - a.revenue // desempate: maior receita primeiro
  })
}
