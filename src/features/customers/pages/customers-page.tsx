import { PageHeader } from '@/components/layout/page-header'
import { formatPtDate } from '@/lib/dates'
import { usePeriod } from '@/lib/period'

import { CustomerMixCard } from '../components/customer-mix-card'
import { CustomersSummary } from '../components/customers-summary'
import { GeographyCard } from '../components/geography-card'
import { SegmentsCard } from '../components/segments-card'
import { TopCustomersCard } from '../components/top-customers-card'

export function CustomersPage() {
  const { period } = usePeriod()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`Top clientes, novos vs recorrentes e geografia · ${formatPtDate(period.from)} – ${formatPtDate(period.to)}`}
      />

      <CustomersSummary />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopCustomersCard />
        </div>
        <div>
          <CustomerMixCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GeographyCard />
        </div>
        <div>
          <SegmentsCard />
        </div>
      </div>
    </div>
  )
}
