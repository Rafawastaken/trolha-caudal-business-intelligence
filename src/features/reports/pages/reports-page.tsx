import { PageHeader } from '@/components/layout/page-header'
import { formatPtDate } from '@/lib/dates'
import { usePeriod } from '@/lib/period'

import { ReportCard } from '../components/report-card'
import { ScheduledReportsCard } from '../components/scheduled-reports-card'
import { REPORTS } from '../exports'

export function ReportsPage() {
  const { period } = usePeriod()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description={`Exporta os dados do período em CSV (abre no Excel) · ${formatPtDate(period.from)} – ${formatPtDate(period.to)}`}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      <ScheduledReportsCard />
    </div>
  )
}
