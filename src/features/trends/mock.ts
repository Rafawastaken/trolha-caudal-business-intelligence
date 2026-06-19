import { fromIsoDate, toIsoDate } from '@/lib/dates'

import type {
  AbandonedCarts,
  DailyPoint,
  HourPoint,
  MonthlyPoint,
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
