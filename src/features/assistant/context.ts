import { useMemo } from 'react'

import { useOverview } from '@/features/dashboard/queries'
import type { Overview } from '@/features/dashboard/schemas'
import { usePeriod } from '@/lib/period'
import type { Period } from '@/lib/period'

// Constrói o "retrato" dos dados do período atual para injetar no assistente.
// Reutiliza o overview do dashboard (KPIs + funil + série diária) — a snapshot
// canónica do negócio. Mantém-se compacto para poupar tokens.

const pct = (fraction: number) => `${(fraction * 100).toFixed(1)}%`
const eur = (v: number) => Math.round(v * 100) / 100

function buildContext(period: Period, data: Overview | undefined): string {
  const ctx: Record<string, unknown> = {
    periodo: { de: period.from, ate: period.to },
  }

  if (data) {
    const k = data.kpis
    ctx.kpis = {
      receita: { valor: eur(k.revenue.value), variacao: pct(k.revenue.delta) },
      encomendas: { valor: k.orders.value, variacao: pct(k.orders.delta) },
      encomendas_validas: {
        valor: k.validOrders.value,
        variacao: pct(k.validOrders.delta),
      },
      ticket_medio: {
        valor: eur(k.avgTicket.value),
        variacao: pct(k.avgTicket.delta),
      },
      unidades_vendidas: {
        valor: k.unitsSold.value,
        variacao: pct(k.unitsSold.delta),
      },
      novos_clientes: {
        valor: k.newCustomers.value,
        variacao: pct(k.newCustomers.delta),
      },
      taxa_abandono: pct(k.abandonmentRate.value),
    }
    ctx.funil = data.funnel.map((f) => ({
      etapa: f.label,
      total: f.count,
      perda_no_salto: pct(f.dropoff),
    }))
    ctx.dias_com_dados = data.daily.length
  } else {
    ctx.aviso = 'Os indicadores ainda estão a carregar.'
  }

  return JSON.stringify(ctx, null, 2)
}

/** Contexto (JSON) dos dados do período atual, para o assistente. */
export function useAssistantContext(): { json: string; ready: boolean } {
  const { period } = usePeriod()
  const { data } = useOverview()
  const json = useMemo(() => buildContext(period, data), [period, data])
  return { json, ready: !!data }
}
