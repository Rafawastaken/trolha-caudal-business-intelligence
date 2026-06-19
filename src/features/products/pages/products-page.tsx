import { PageHeader } from '@/components/layout/page-header'
import { formatPtDate } from '@/lib/dates'
import { usePeriod } from '@/lib/period'

import { CategoriesCard } from '../components/categories-card'
import { LowStockCard } from '../components/low-stock-card'
import { TopProductsCard } from '../components/top-products-card'
import { VouchersCard } from '../components/vouchers-card'

export function ProductsPage() {
  const { period } = usePeriod()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos & Stock"
        description={`Best-sellers, categorias e stock · ${formatPtDate(period.from)} – ${formatPtDate(period.to)}`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProductsCard />
        </div>
        <div>
          <CategoriesCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LowStockCard />
        </div>
        <div>
          <VouchersCard />
        </div>
      </div>
    </div>
  )
}
