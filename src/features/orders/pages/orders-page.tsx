import { useEffect, useState } from 'react'
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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [state, setState] = useState<number | undefined>()
  const [payment, setPayment] = useState<string | undefined>()

  // debounce da pesquisa
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // reset de página quando o período global muda (ajuste em render — padrão React)
  const periodKey = `${period.from}|${period.to}`
  const [prevPeriodKey, setPrevPeriodKey] = useState(periodKey)
  if (periodKey !== prevPeriodKey) {
    setPrevPeriodKey(periodKey)
    setPage(1)
  }

  // handlers de filtro que voltam sempre à 1ª página
  const changeSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }
  const changeState = (v?: number) => {
    setState(v)
    setPage(1)
  }
  const changePayment = (v?: string) => {
    setPayment(v)
    setPage(1)
  }

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
                onSearchChange={setSearch}
                state={state}
                onStateChange={setState}
                payment={payment}
                onPaymentChange={setPayment}
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
