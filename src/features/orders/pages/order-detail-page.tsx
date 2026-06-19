import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/paths'

import { OrderInfoCard } from '../components/order-info-card'
import { OrderLinesTable } from '../components/order-lines-table'
import { OrderStatusBadge } from '../components/order-status-badge'
import { OrderStatusTimeline } from '../components/order-status-timeline'
import { OrderTotals } from '../components/order-totals'
import { useOrder } from '../queries'

export function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data: order, isLoading, isError, error } = useOrder(id)

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link to={paths.orders.list}>
          <ArrowLeft className="size-4" />
          Encomendas
        </Link>
      </Button>

      {isLoading && <DetailSkeleton />}

      {isError && (
        <Card className="flex flex-col items-center gap-2 py-16 text-center">
          <AlertCircle className="size-7 text-destructive" />
          <p className="text-sm font-medium">Encomenda não encontrada</p>
          <p className="max-w-md text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </Card>
      )}

      {order && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {order.reference}
            </h1>
            <OrderStatusBadge stateId={order.stateId} label={order.stateLabel} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border bg-card shadow-xs ring-1 ring-foreground/10">
                <div className="border-b px-5 py-4 font-heading text-base font-medium">
                  Artigos
                </div>
                <OrderLinesTable lines={order.lines} />
                <div className="border-t p-5">
                  <OrderTotals
                    subtotal={order.subtotal}
                    shipping={order.shipping}
                    discount={order.discount}
                    total={order.total}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <OrderInfoCard order={order} />
              <OrderStatusTimeline history={order.history} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
