import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { lastNDaysRange, toIsoDate } from './dates'

// Período global (from/to) partilhado por todas as features — corresponde aos
// params `from`/`to` da Trolha Tracking API. O topbar controla-o e o assistente
// AI lê-o para contextualizar respostas.

export type PresetKey =
  | 'today'
  | 'last7'
  | 'last30'
  | 'last90'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'custom'

export type Period = { from: string; to: string; preset: PresetKey }

export const PRESET_LABELS: Record<PresetKey, string> = {
  today: 'Hoje',
  last7: 'Últimos 7 dias',
  last30: 'Últimos 30 dias',
  last90: 'Últimos 90 dias',
  thisMonth: 'Este mês',
  lastMonth: 'Mês passado',
  thisYear: 'Este ano',
  custom: 'Personalizado',
}

export function rangeForPreset(preset: Exclude<PresetKey, 'custom'>): {
  from: string
  to: string
} {
  const now = new Date()
  const today = toIsoDate(now)
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'last7':
      return toRange(lastNDaysRange(6))
    case 'last30':
      return toRange(lastNDaysRange(29))
    case 'last90':
      return toRange(lastNDaysRange(89))
    case 'thisMonth': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: toIsoDate(first), to: today }
    }
    case 'lastMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const last = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: toIsoDate(first), to: toIsoDate(last) }
    }
    case 'thisYear': {
      const first = new Date(now.getFullYear(), 0, 1)
      return { from: toIsoDate(first), to: today }
    }
  }
}

function toRange(r: { since: string; until: string }) {
  return { from: r.since, to: r.until }
}

const STORAGE_KEY = 'tt_period'
const DEFAULT_PRESET: Exclude<PresetKey, 'custom'> = 'last90'

function readInitial(): Period {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Period
        if (parsed.from && parsed.to && parsed.preset) return parsed
      } catch {
        /* ignore */
      }
    }
  }
  return { ...rangeForPreset(DEFAULT_PRESET), preset: DEFAULT_PRESET }
}

type PeriodContextValue = {
  period: Period
  setPreset: (preset: Exclude<PresetKey, 'custom'>) => void
  setCustomRange: (from: string, to: string) => void
}

const PeriodContext = createContext<PeriodContextValue | null>(null)

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>(readInitial)

  const persist = useCallback((next: Period) => {
    setPeriod(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const setPreset = useCallback(
    (preset: Exclude<PresetKey, 'custom'>) => {
      persist({ ...rangeForPreset(preset), preset })
    },
    [persist],
  )

  const setCustomRange = useCallback(
    (from: string, to: string) => {
      persist({ from, to, preset: 'custom' })
    },
    [persist],
  )

  const value = useMemo(
    () => ({ period, setPreset, setCustomRange }),
    [period, setPreset, setCustomRange],
  )

  return (
    <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
  )
}

export function usePeriod(): PeriodContextValue {
  const ctx = useContext(PeriodContext)
  if (!ctx) throw new Error('usePeriod deve ser usado dentro de <PeriodProvider>')
  return ctx
}
