import { PageHeader } from '@/components/layout/page-header'
import { formatPtDate } from '@/lib/dates'
import { usePeriod } from '@/lib/period'

import { AbandonedCartsCard } from '../components/abandoned-carts-card'
import { DailyTrendChart } from '../components/daily-trend-chart'
import { HourChart } from '../components/hour-chart'
import { MonthlyChart } from '../components/monthly-chart'
import { TrendsSummary } from '../components/trends-summary'
import { WeekdayChart } from '../components/weekday-chart'

export function TrendsPage() {
  const { period } = usePeriod()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tendências"
        description={`Evolução, sazonalidade e abandono · ${formatPtDate(period.from)} – ${formatPtDate(period.to)}`}
      />

      <TrendsSummary />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyTrendChart />
        </div>
        <div>
          <AbandonedCartsCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <WeekdayChart />
        </div>
        <div className="lg:col-span-2">
          <HourChart />
        </div>
      </div>

      <MonthlyChart />
    </div>
  )
}
