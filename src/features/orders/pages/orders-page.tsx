import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, Download, Inbox } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { notifyInfo } from '@/lib/toast'
import { usePeriod } from '@/lib/period'

import { OrderStatesCard } from '../components/order-states-card'
import { OrdersFilters } from '../components/orders-filters'
import { OrdersPagination } from '../components/orders-pagination'
import { OrdersSummary } from '../components/orders-summary'
import { OrdersTable } from '../components/orders-table'
import { PaymentMixCard } from '../components/payment-mix-card'
import { useOrdersList } from '../queries'

const PER_PAGE = 25

export function OrdersPage() {
  const { period } = usePeriod()

  // Estado/pagamento/página vivem na URL → drill-down deep-linkable (ex.: os
  // cards Pagamentos/Estados ligam para ?payment=… / ?state=…) e o botão
  // "voltar" funciona. A pesquisa fica local (com debounce).
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const state = searchParams.get('state')
    ? Number(searchParams.get('state'))
    : undefined
  const payment = searchParams.get('payment') || undefined

  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const patchParams = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            if (v == null || v === '') next.delete(k)
            else next.set(k, v)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setPage = (n: number) => patchParams({ page: n > 1 ? String(n) : null })

  // reset de página quando o período global muda (ajuste em render — padrão React)
  const periodKey = `${period.from}|${period.to}`
  const [prevPeriodKey, setPrevPeriodKey] = useState(periodKey)
  if (periodKey !== prevPeriodKey) {
    setPrevPeriodKey(periodKey)
    if (page !== 1) setPage(1)
  }

  // handlers de filtro que voltam sempre à 1ª página
  const changeSearch = (v: string) => {
    setSearch(v)
    if (page !== 1) setPage(1)
  }
  const changeState = (v?: number) =>
    patchParams({ state: v != null ? String(v) : null, page: null })
  const changePayment = (v?: string) =>
    patchParams({ payment: v ?? null, page: null })

  const { data, isLoading, isError, error, isPlaceholderData } = useOrdersList({
    page,
    perPage: PER_PAGE,
    state,
    payment,
    search: debounced || undefined,
  })

  const rows = data?.rows ?? []
  const isEmpty = !isLoading && !isError && rows.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encomendas"
        description="Lista, estados, pagamentos e reembolsos no período"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => notifyInfo('Exportação chega na fase de relatórios')}
          >
            <Download className="size-4" />
            Exportar
          </Button>
        }
      />

      <OrdersSummary />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border bg-card shadow-xs ring-1 ring-foreground/10">
            <div className="border-b p-4">
              <OrdersFilters
                search={search}
                onSearchChange={changeSearch}
                state={state}
                onStateChange={changeState}
                payment={payment}
                onPaymentChange={changePayment}
              />
            </div>

            {isError ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <AlertCircle className="size-7 text-destructive" />
                <p className="text-sm font-medium">
                  Não foi possível carregar as encomendas
                </p>
                <p className="max-w-md text-xs text-muted-foreground">
                  {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <Inbox className="size-7 text-muted-foreground" />
                <p className="text-sm font-medium">Sem encomendas</p>
                <p className="text-xs text-muted-foreground">
                  Ajusta os filtros ou o período.
                </p>
              </div>
            ) : (
              <div
                className={
                  isPlaceholderData ? 'opacity-60 transition-opacity' : undefined
                }
              >
                <OrdersTable
                  rows={rows}
                  loading={isLoading}
                  perPage={PER_PAGE}
                />
                {data && <OrdersPagination meta={data.meta} onPageChange={setPage} />}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <PaymentMixCard />
          <OrderStatesCard />
        </div>
      </div>
    </div>
  )
}
