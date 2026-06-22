// Preferências locais do utilizador (localStorage). Simples getters/setters —
// lidas no momento de uso (ex.: o limiar de stock baixo entra no queryKey da
// página de Produtos, por isso muda de efeito assim que se navega para lá).

const LOW_STOCK_KEY = 'tt_low_stock_threshold'
const LEAD_TIME_KEY = 'tt_reorder_lead_time_days'
const TARGET_COVER_KEY = 'tt_reorder_target_cover_days'

export const LOW_STOCK_DEFAULT = 5
/** Prazo médio (dias) entre fazer a encomenda ao fornecedor e ter o stock. */
export const LEAD_TIME_DEFAULT = 14
/** Dias de stock que se quer manter para além do lead-time (par level). */
export const TARGET_COVER_DEFAULT = 30

export function getLowStockThreshold(): number {
  if (typeof localStorage === 'undefined') return LOW_STOCK_DEFAULT
  const v = Number(localStorage.getItem(LOW_STOCK_KEY))
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : LOW_STOCK_DEFAULT
}

export function setLowStockThreshold(value: number): void {
  if (typeof localStorage === 'undefined') return
  const v = Math.max(1, Math.floor(value))
  localStorage.setItem(LOW_STOCK_KEY, String(v))
}

// Lê um inteiro positivo do localStorage com fallback (partilhado pelos dois
// parâmetros de reposição, que têm a mesma validação).
function readPositiveInt(key: string, fallback: number): number {
  if (typeof localStorage === 'undefined') return fallback
  const v = Number(localStorage.getItem(key))
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback
}

function writePositiveInt(key: string, value: number): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, String(Math.max(1, Math.floor(value))))
}

export function getLeadTimeDays(): number {
  return readPositiveInt(LEAD_TIME_KEY, LEAD_TIME_DEFAULT)
}

export function setLeadTimeDays(value: number): void {
  writePositiveInt(LEAD_TIME_KEY, value)
}

export function getTargetCoverDays(): number {
  return readPositiveInt(TARGET_COVER_KEY, TARGET_COVER_DEFAULT)
}

export function setTargetCoverDays(value: number): void {
  writePositiveInt(TARGET_COVER_KEY, value)
}
