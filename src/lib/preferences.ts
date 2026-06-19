// Preferências locais do utilizador (localStorage). Simples getters/setters —
// lidas no momento de uso (ex.: o limiar de stock baixo entra no queryKey da
// página de Produtos, por isso muda de efeito assim que se navega para lá).

const LOW_STOCK_KEY = 'tt_low_stock_threshold'

export const LOW_STOCK_DEFAULT = 5

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
