import { AlertCircle } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPtDate } from '@/lib/dates'
import { usePeriod } from '@/lib/period'

import { KpiGrid } from '../components/kpi-grid'
import { FunnelCard } from '../components/funnel-card'
import { RevenueTrendCard } from '../components/revenue-trend-card'
import { useOverview } from '../queries'

export function DashboardPage() {
  const { period } = usePeriod()
  const { data, isLoading, isError, error } = useOverview()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Visão geral · ${formatPtDate(period.from)} – ${formatPtDate(period.to)}`}
      />

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <Card className="flex flex-col items-center gap-2 py-16 text-center">
          <AlertCircle className="size-7 text-destructive" />
          <p className="text-sm font-medium">Não foi possível carregar os dados</p>
          <p className="max-w-md text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </Card>
      )}

      {data && (
        <>
          <KpiGrid kpis={data.kpis} daily={data.daily} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueTrendCard daily={data.daily} />
            </div>
            <div>
              <FunnelCard funnel={data.funnel} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-36 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  )
}
