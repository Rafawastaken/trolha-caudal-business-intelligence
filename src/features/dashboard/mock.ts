import { fromIsoDate, toIsoDate } from '@/lib/dates'

import type { DailyPoint, Overview } from './schemas'

// Gerador determinístico de dados de demonstração (loja de bombas de água).
// Determinístico => o mesmo período produz sempre o mesmo gráfico (sem flicker
// entre renders). Substituído por dados reais quando a API estiver ligada.

function seeded(dateIso: string): number {
  // Hash simples e estável da data → [0,1).
  let h = 0
  for (let i = 0; i < dateIso.length; i++) {
    h = (h * 31 + dateIso.charCodeAt(i)) % 100000
  }
  return (h % 1000) / 1000
}

function daysBetween(from: string, to: string): string[] {
  const out: string[] = []
  const start = fromIsoDate(from)
  const end = fromIsoDate(to)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(toIsoDate(new Date(d)))
  }
  return out
}

function buildDaily(dates: string[], scale: number): DailyPoint[] {
  return dates.map((date, i) => {
    const dow = fromIsoDate(date).getDay() // 0=dom
    // Procura B2B: menor ao fim de semana, pico a meio da semana.
    const weekdayFactor = dow === 0 || dow === 6 ? 0.45 : 1
    const trend = 1 + (i / Math.max(dates.length, 1)) * 0.18 // leve crescimento
    const jitter = 0.8 + seeded(date) * 0.5
    const orders = Math.round(28 * weekdayFactor * trend * jitter * scale)
    const avgTicket = 130 + seeded(date + 'x') * 50
    const revenue = Math.round(orders * avgTicket)
    return { date, orders, revenue }
  })
}

function sum(points: DailyPoint[], key: 'orders' | 'revenue'): number {
  return points.reduce((acc, p) => acc + p[key], 0)
}

export function mockOverview(from: string, to: string): Overview {
  const dates = daysBetween(from, to)
  const current = buildDaily(dates, 1)
  // Período anterior ligeiramente mais fraco => deltas positivos.
  const previous = buildDaily(dates, 0.88)

  const revenueNow = sum(current, 'revenue')
  const revenuePrev = sum(previous, 'revenue')
  const ordersNow = sum(current, 'orders')
  const ordersPrev = sum(previous, 'orders')
  const validNow = Math.round(ordersNow * 0.91)
  const validPrev = Math.round(ordersPrev * 0.9)
  const ticketNow = revenueNow / Math.max(ordersNow, 1)
  const ticketPrev = revenuePrev / Math.max(ordersPrev, 1)
  const unitsNow = Math.round(ordersNow * 2.4)
  const unitsPrev = Math.round(ordersPrev * 2.35)
  const newCustNow = Math.round(ordersNow * 0.38)
  const newCustPrev = Math.round(ordersPrev * 0.41)
  const abandonNow = 0.687
  const abandonPrev = 0.712

  const delta = (now: number, prev: number) =>
    prev === 0 ? 0 : (now - prev) / prev

  const m = (value: number, previousValue: number) => ({
    value,
    previous: previousValue,
    delta: delta(value, previousValue),
  })

  // Funil: viu → carrinho → checkout → envio → pagamento → encomenda.
  const viewed = Math.round(ordersNow / (1 - abandonNow) / 0.42)
  const cart = Math.round(viewed * 0.42)
  const checkout = Math.round(cart * 0.55)
  const shipping = Math.round(checkout * 0.82)
  const payment = Math.round(shipping * 0.88)
  const order = validNow
  const lvl = (count: number, prevCount: number) =>
    prevCount === 0 ? 0 : 1 - count / prevCount

  return {
    kpis: {
      revenue: m(revenueNow, revenuePrev),
      orders: m(ordersNow, ordersPrev),
      validOrders: m(validNow, validPrev),
      avgTicket: m(ticketNow, ticketPrev),
      unitsSold: m(unitsNow, unitsPrev),
      newCustomers: m(newCustNow, newCustPrev),
      // Abandono: menos é melhor — delta negativo é "bom".
      abandonmentRate: m(abandonNow, abandonPrev),
    },
    funnel: [
      { key: 'viewed', label: 'Viu produto', count: viewed, dropoff: 0 },
      { key: 'cart', label: 'Adicionou ao carrinho', count: cart, dropoff: lvl(cart, viewed) },
      { key: 'checkout', label: 'Iniciou checkout', count: checkout, dropoff: lvl(checkout, cart) },
      { key: 'shipping', label: 'Dados de envio', count: shipping, dropoff: lvl(shipping, checkout) },
      { key: 'payment', label: 'Pagamento', count: payment, dropoff: lvl(payment, shipping) },
      { key: 'order', label: 'Encomenda concluída', count: order, dropoff: lvl(order, payment) },
    ],
    daily: current,
  }
}
