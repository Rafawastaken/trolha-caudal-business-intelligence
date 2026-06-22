import { Type, type FunctionDeclaration } from '@google/genai'

import {
  fetchCustomerMix,
  fetchGeography,
  fetchTopCustomers,
} from '@/features/customers/api'
import { fetchOverview } from '@/features/dashboard/api'
import {
  fetchOrder,
  fetchOrdersAtRisk,
  fetchOrdersList,
  fetchPayments,
  fetchRefunds,
  fetchStates,
} from '@/features/orders/api'
import {
  fetchCategories,
  fetchLowStock,
  fetchTopProducts,
} from '@/features/products/api'
import { computeReorder, REORDER_STOCK_CEILING } from '@/features/products/reorder'
import { fetchLiveUsers } from '@/features/presence/api'
import {
  fetchAbandonedCarts,
  fetchAbandonedCartsDetail,
  fetchConsent,
  fetchDaily,
  fetchHour,
  fetchMonthly,
  fetchTraffic,
  fetchWeekday,
} from '@/features/trends/api'
import { daysInRange } from '@/lib/dates'
import type { Period } from '@/lib/period'
import { getLeadTimeDays, getLowStockThreshold, getTargetCoverDays } from '@/lib/preferences'
import { paths } from '@/paths'

// Tools do assistente Pulse — dão ao modelo acesso de leitura aos dados reais
// da plataforma (via os mesmos fetchers das páginas) e ações de navegação.
// Cada tool corre sobre o período global atual; o executor injeta from/to.

export type ToolRuntime = {
  period: Period
  /** Navegação no router (passada pelo componente; ausente fora do React). */
  navigate?: (path: string) => void
}

const round = (v: number) => Math.round(v * 100) / 100

// ---------------------------------------------------------------------------
// Declarações (esquema que o Gemini vê)
// ---------------------------------------------------------------------------

const noArgs = { type: Type.OBJECT, properties: {} }

export const assistantTools: FunctionDeclaration[] = [
  {
    name: 'get_kpis',
    description:
      'KPIs de topo do período (receita, encomendas, encomendas válidas, ticket médio, unidades vendidas, novos clientes, taxa de abandono) com variação vs período anterior, e o funil de conversão de 6 níveis.',
    parameters: noArgs,
  },
  {
    name: 'get_top_products',
    description: 'Best-sellers do período por receita e unidades vendidas.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: 'Nº de produtos (default 10).' },
      },
    },
  },
  {
    name: 'get_categories',
    description: 'Vendas por categoria de produto no período.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: 'Nº de categorias (default 12).' },
      },
    },
  },
  {
    name: 'get_low_stock',
    description:
      'Retrato atual do stock baixo/esgotado a nível de produto (independente do período).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        threshold: {
          type: Type.NUMBER,
          description: 'Stock máximo a listar. Default = preferência do utilizador.',
        },
      },
    },
  },
  {
    name: 'get_reorder_plan',
    description:
      'Plano de reposição acionável: cruza os best-sellers do período com o stock baixo atual e devolve o que encomendar primeiro (urgência, dias de cobertura, quantidade sugerida). Usa o lead-time e a cobertura alvo das Definições.',
    parameters: noArgs,
  },
  {
    name: 'get_top_customers',
    description: 'Top clientes por receita no período.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: 'Nº de clientes (default 10).' },
      },
    },
  },
  {
    name: 'get_customer_mix',
    description: 'Repartição novos vs. clientes recorrentes no período.',
    parameters: noArgs,
  },
  {
    name: 'get_geography',
    description: 'Encomendas e receita por região (distrito/cidade) no período.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: 'Nº de regiões (default 20).' },
      },
    },
  },
  {
    name: 'get_payments',
    description:
      'Quebra por método de pagamento no período (encomendas válidas e receita por método).',
    parameters: noArgs,
  },
  {
    name: 'get_order_states',
    description:
      'Quebra de encomendas por estado no período, com o id de cada estado. Usa estes ids para filtrar em search_orders.',
    parameters: noArgs,
  },
  {
    name: 'get_refunds',
    description: 'Total reembolsado e nº de encomendas com reembolso no período.',
    parameters: noArgs,
  },
  {
    name: 'get_orders_at_risk',
    description:
      'Encomendas que aguardam pagamento (em risco), ordenadas por valor, com o total em risco. Ex.: Multibanco gerado e nunca pago.',
    parameters: noArgs,
  },
  {
    name: 'search_orders',
    description:
      'Lista paginada de encomendas do período, com filtros opcionais. Para filtrar por estado, obtém primeiro o id em get_order_states.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        state: { type: Type.NUMBER, description: 'id do estado (de get_order_states).' },
        payment: { type: Type.STRING, description: 'Método de pagamento exato.' },
        search: { type: Type.STRING, description: 'Texto: referência ou nome do cliente.' },
        page: { type: Type.NUMBER, description: 'Página (default 1, 25 por página).' },
      },
    },
  },
  {
    name: 'get_order_detail',
    description:
      'Detalhe de uma encomenda: cliente, linhas de produto, totais e histórico de estados.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.NUMBER, description: 'id da encomenda.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_trends',
    description:
      'Série temporal de encomendas/receita no período, na granularidade pedida.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        granularity: {
          type: Type.STRING,
          enum: ['daily', 'monthly', 'weekday', 'hour'],
          description: 'daily, monthly, weekday (dia da semana) ou hour (hora do dia).',
        },
      },
      required: ['granularity'],
    },
  },
  {
    name: 'get_abandoned_carts',
    description: 'Carrinhos abandonados, convertidos e taxa de abandono no período.',
    parameters: noArgs,
  },
  {
    name: 'get_abandoned_carts_detail',
    description:
      'Carrinhos abandonados em detalhe: resumo (quantos, com cliente, valor) + os mais valiosos com cliente/email/itens — recuperáveis.',
    parameters: noArgs,
  },
  {
    name: 'get_traffic',
    description:
      'Tráfego first-party do período: page views, visitas, product views com variação vs período anterior.',
    parameters: noArgs,
  },
  {
    name: 'get_consent',
    description:
      'Consentimento de cookies no período: aceitou/recusou/parcial, analítica, taxa de aceitação e de decisão.',
    parameters: noArgs,
  },
  {
    name: 'get_live_users',
    description:
      'Visitantes online no site AGORA (tempo real): total, com conta e visitantes. Não depende do período.',
    parameters: noArgs,
  },
  {
    name: 'navigate',
    description:
      'Abre uma página da aplicação para o utilizador. Usa quando ele pede para ver/abrir algo. Para encomendas filtradas, usa "orders" com os filtros opcionais.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: {
          type: Type.STRING,
          enum: [
            'dashboard',
            'orders',
            'products',
            'customers',
            'trends',
            'reports',
            'settings',
          ],
        },
        state: { type: Type.NUMBER, description: 'Só para orders: id de estado a filtrar.' },
        payment: { type: Type.STRING, description: 'Só para orders: método de pagamento.' },
      },
      required: ['page'],
    },
  },
]

// ---------------------------------------------------------------------------
// Executor (corre a tool e devolve um objeto serializável)
// ---------------------------------------------------------------------------

type Args = Record<string, unknown>
const numArg = (v: unknown, fallback?: number) =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback
const strArg = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined)

async function run(name: string, args: Args, rt: ToolRuntime): Promise<unknown> {
  const { from, to } = rt.period

  switch (name) {
    case 'get_kpis': {
      const ov = await fetchOverview(from, to)
      const k = ov.kpis
      const m = (x: { value: number; delta: number }) => ({
        valor: round(x.value),
        variacao_pct: round(x.delta * 100),
      })
      return {
        periodo: { de: from, ate: to },
        kpis: {
          receita: m(k.revenue),
          encomendas: m(k.orders),
          encomendas_validas: m(k.validOrders),
          ticket_medio: m(k.avgTicket),
          unidades_vendidas: m(k.unitsSold),
          novos_clientes: m(k.newCustomers),
          taxa_abandono_pct: round(k.abandonmentRate.value * 100),
        },
        funil: ov.funnel.map((f) => ({
          etapa: f.label,
          total: f.count,
          perda_no_salto_pct: round(f.dropoff * 100),
        })),
      }
    }

    case 'get_top_products':
      return { produtos: await fetchTopProducts(from, to, numArg(args.limit, 10)) }

    case 'get_categories':
      return { categorias: await fetchCategories(from, to, numArg(args.limit, 12)) }

    case 'get_low_stock': {
      const threshold = numArg(args.threshold, getLowStockThreshold()) as number
      return { threshold, produtos: await fetchLowStock(threshold) }
    }

    case 'get_reorder_plan': {
      const [top, low] = await Promise.all([
        fetchTopProducts(from, to, 100),
        fetchLowStock(REORDER_STOCK_CEILING),
      ])
      const plan = computeReorder(top, low, {
        periodDays: daysInRange(from, to),
        leadTimeDays: getLeadTimeDays(),
        targetCoverDays: getTargetCoverDays(),
      })
      return {
        lead_time_dias: getLeadTimeDays(),
        cobertura_alvo_dias: getTargetCoverDays(),
        plano: plan.map((s) => ({
          produto: s.name,
          stock: s.stock,
          vendidas_no_periodo: s.soldQty,
          dias_de_cobertura: s.daysOfCover === null ? null : round(s.daysOfCover),
          qtd_sugerida: s.suggestedQty,
          urgencia: s.urgency,
          baixa_confianca: s.lowConfidence,
        })),
      }
    }

    case 'get_top_customers':
      return { clientes: await fetchTopCustomers(from, to, numArg(args.limit, 10)) }

    case 'get_customer_mix':
      return await fetchCustomerMix(from, to)

    case 'get_geography':
      return { regioes: await fetchGeography(from, to, numArg(args.limit, 20)) }

    case 'get_payments':
      return { pagamentos: await fetchPayments(from, to) }

    case 'get_order_states':
      return { estados: await fetchStates(from, to) }

    case 'get_refunds':
      return await fetchRefunds(from, to)

    case 'get_orders_at_risk': {
      const risk = await fetchOrdersAtRisk(from, to)
      return {
        total_em_risco: round(risk.totalAtRisk),
        n_encomendas: risk.count,
        soma_parcial: risk.truncated,
        encomendas: risk.rows.slice(0, 25).map((r) => ({
          id: r.id,
          referencia: r.reference,
          cliente: r.customer,
          data: r.date,
          total: r.total,
          pagamento: r.payment,
        })),
      }
    }

    case 'search_orders': {
      const res = await fetchOrdersList({
        from,
        to,
        page: numArg(args.page, 1) as number,
        per_page: 25,
        state: numArg(args.state),
        payment: strArg(args.payment),
        search: strArg(args.search),
      })
      return {
        total: res.meta.total,
        pagina: res.meta.page,
        paginas: res.meta.pages,
        encomendas: res.rows.map((r) => ({
          id: r.id,
          referencia: r.reference,
          cliente: r.customer,
          data: r.date,
          total: r.total,
          estado: r.stateLabel,
          pagamento: r.payment,
        })),
      }
    }

    case 'get_order_detail': {
      const id = numArg(args.id)
      if (id == null) return { erro: 'É preciso o id da encomenda.' }
      const o = await fetchOrder(id)
      return {
        id: o.id,
        referencia: o.reference,
        cliente: o.customer,
        data: o.date,
        estado: o.stateLabel,
        pagamento: o.payment,
        total: o.total,
        subtotal: o.subtotal,
        portes: o.shipping,
        desconto: o.discount,
        linhas: o.lines.map((l) => ({
          produto: l.name,
          qtd: l.qty,
          preco_unit: l.unitPrice,
          total: l.total,
        })),
        historico: o.history.map((h) => ({ estado: h.label, data: h.at })),
      }
    }

    case 'get_trends': {
      const g = strArg(args.granularity) ?? 'daily'
      if (g === 'monthly') return { mensal: await fetchMonthly(from, to) }
      if (g === 'weekday') return { dia_da_semana: await fetchWeekday(from, to) }
      if (g === 'hour') return { hora: await fetchHour(from, to) }
      return { diario: await fetchDaily(from, to) }
    }

    case 'get_abandoned_carts':
      return await fetchAbandonedCarts(from, to)

    case 'get_abandoned_carts_detail': {
      const d = await fetchAbandonedCartsDetail(from, to)
      return {
        resumo: {
          carrinhos: d.summary.carts,
          com_cliente: d.summary.withCustomer,
          valor_total: round(d.summary.value),
        },
        carrinhos: d.rows.slice(0, 25).map((r) => ({
          cliente: r.customer,
          email: r.email ?? null,
          itens: r.items,
          valor: round(r.value),
        })),
      }
    }

    case 'get_traffic': {
      const t = await fetchTraffic(from, to)
      const m = (x: { value: number; delta: number }) => ({
        valor: x.value,
        variacao_pct: round(x.delta * 100),
      })
      return {
        page_views: m(t.pageViews),
        visitas: m(t.visits),
        product_views: m(t.productViews),
      }
    }

    case 'get_consent': {
      const c = await fetchConsent(from, to)
      return {
        aceitou: c.granted,
        recusou: c.denied,
        parcial: c.partial,
        analitica_permitida: c.analyticsGranted,
        taxa_aceitacao_pct: round(c.grantRate * 100),
        taxa_decisao_pct: round(c.decisionRate * 100),
      }
    }

    case 'get_live_users':
      return await fetchLiveUsers()

    case 'navigate': {
      const page = strArg(args.page)
      const map: Record<string, string> = {
        dashboard: paths.dashboard,
        orders: paths.orders.list,
        products: paths.products,
        customers: paths.customers,
        trends: paths.trends,
        reports: paths.reports,
        settings: paths.settings,
      }
      let path = map[page ?? '']
      if (!path) return { erro: `Página desconhecida: ${page}` }
      if (page === 'orders') {
        const qs = new URLSearchParams()
        const state = numArg(args.state)
        const payment = strArg(args.payment)
        if (state != null) qs.set('state', String(state))
        if (payment) qs.set('payment', payment)
        if ([...qs].length) path += `?${qs.toString()}`
      }
      rt.navigate?.(path)
      return { ok: true, abriu: path }
    }

    default:
      return { erro: `Tool desconhecida: ${name}` }
  }
}

/** Executa uma tool, convertendo qualquer erro num objeto que o modelo entende. */
export async function executeAssistantTool(
  name: string,
  args: Args,
  rt: ToolRuntime,
): Promise<unknown> {
  try {
    return await run(name, args, rt)
  } catch (err) {
    return { erro: err instanceof Error ? err.message : 'Falha ao obter os dados.' }
  }
}
