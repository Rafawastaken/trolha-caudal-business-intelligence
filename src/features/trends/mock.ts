import { fromIsoDate, toIsoDate } from '@/lib/dates'

import type {
  AbandonedCarts,
  AbandonedCartsDetail,
  Consent,
  DailyPoint,
  HourPoint,
  MonthlyPoint,
  Traffic,
  WeekdayPoint,
} from './schemas'

// Dataset de demonstração determinístico (loja de bombas de água). O mesmo
// período produz sempre os mesmos gráficos (sem flicker entre renders).

function seeded(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000
  return (h % 1000) / 1000
}

function daysBetween(from: string, to: string): string[] {
  const out: string[] = []
  const end = fromIsoDate(to)
  for (let d = fromIsoDate(from); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(toIsoDate(new Date(d)))
  }
  return out
}

export function mockDaily(from: string, to: string): DailyPoint[] {
  return daysBetween(from, to).map((date) => {
    const dow = fromIsoDate(date).getDay()
    const weekendFactor = dow === 0 || dow === 6 ? 0.45 : 1
    const jitter = 0.7 + seeded(date) * 0.6
    const orders = Math.max(0, Math.round(6 * weekendFactor * jitter))
    const revenue = Math.round(orders * (120 + seeded(date + 'r') * 130))
    return { date, orders, revenue }
  })
}

export function mockMonthly(from: string, to: string): MonthlyPoint[] {
  const map = new Map<string, MonthlyPoint>()
  for (const d of mockDaily(from, to)) {
    const month = d.date.slice(0, 7)
    const cur = map.get(month) ?? { month, orders: 0, revenue: 0 }
    cur.orders += d.orders
    cur.revenue += d.revenue
    map.set(month, cur)
  }
  return [...map.values()].map((m) => ({
    ...m,
    revenue: Math.round(m.revenue * 100) / 100,
  }))
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function mockWeekday(): WeekdayPoint[] {
  const orders = [6, 22, 18, 20, 24, 16, 5]
  return WEEKDAY_LABELS.map((label, i) => ({
    weekday: i + 1,
    label,
    orders: orders[i],
    revenue: Math.round(orders[i] * (140 + i * 8)),
  }))
}

export function mockHour(): HourPoint[] {
  const peak: Record<number, number> = {
    9: 5,
    10: 8,
    11: 9,
    12: 7,
    14: 8,
    15: 9,
    16: 7,
    17: 6,
    18: 4,
  }
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    orders: peak[hour] ?? (hour >= 8 && hour <= 20 ? 2 : 0),
  }))
}

export function mockAbandonedCarts(): AbandonedCarts {
  return { abandoned: 190, converted: 28, rate: 87.2 }
}

export function mockTraffic(from: string, to: string): Traffic {
  const days = daysBetween(from, to)
  const daily = days.map((date) => {
    const dow = fromIsoDate(date).getDay()
    const weekend = dow === 0 || dow === 6 ? 0.5 : 1
    const j = 0.7 + seeded(date + 't') * 0.6
    const visits = Math.round(140 * weekend * j)
    return {
      date,
      visits,
      pageViews: Math.round(visits * (3 + seeded(date + 'p'))),
      productViews: Math.round(visits * (1.2 + seeded(date + 'pv'))),
    }
  })
  const sum = (k: 'visits' | 'pageViews' | 'productViews') =>
    daily.reduce((a, d) => a + d[k], 0)
  // "anterior" = ~8% abaixo para um delta positivo plausível.
  const metric = (value: number) => ({
    value,
    previous: Math.round(value * 0.92),
    delta: value === 0 ? 0 : (value - value * 0.92) / (value * 0.92),
  })
  return {
    pageViews: metric(sum('pageViews')),
    visits: metric(sum('visits')),
    productViews: metric(sum('productViews')),
    daily,
  }
}

export function mockConsent(): Consent {
  const granted = 412
  const denied = 118
  const partial = 36
  const decided = granted + denied + partial
  const visitors = Math.round(decided / 0.78)
  return {
    granted,
    denied,
    partial,
    analyticsGranted: granted + partial,
    grantRate: granted / decided,
    decisionRate: decided / visitors,
  }
}

const CART_CUSTOMERS = [
  'Hidráulica Coelho, Lda',
  'João Sousa',
  'AgroRega Sul',
  'Quinta do Vale',
  'Construções Ferreira',
  'Estufas do Oeste',
  'Adega Cooperativa',
  'Rega Norte, Lda',
]

export function mockAbandonedCartsDetail(
  _from: string,
  _to: string,
  limit = 50,
): AbandonedCartsDetail {
  const rows = Array.from({ length: Math.min(limit, 12) }, (_, i) => {
    const customer = CART_CUSTOMERS[i % CART_CUSTOMERS.length]
    const value = Math.round((80 + seeded('cart' + i) * 540) * 100) / 100
    return {
      id: 5000 + i,
      customer,
      email: `${customer.split(' ')[0].toLowerCase()}@email.pt`,
      items: 1 + Math.floor(seeded('it' + i) * 4),
      value,
    }
  }).sort((a, b) => b.value - a.value)
  // Vista "com contacto": resumo restrito aos carrinhos recuperáveis.
  const value = Math.round(rows.reduce((a, r) => a + r.value, 0) * 2.4 * 100) / 100
  return {
    summary: { carts: 52, withCustomer: 52, value },
    rows,
  }
}
