import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePeriod } from '@/lib/period'
import { notify, notifyError, notifyInfo } from '@/lib/toast'

import { downloadFile } from '../csv'
import { runReport, type ReportMeta } from '../exports'

export function ReportCard({ report }: { report: ReportMeta }) {
  const { period } = usePeriod()
  const [busy, setBusy] = useState(false)
  const Icon = report.icon

  async function onExport() {
    setBusy(true)
    try {
      const res = await runReport(report.id, period)
      if (res.rows === 0) {
        notifyInfo('Sem dados', 'Não há registos para exportar neste período.')
        return
      }
      downloadFile(res.filename, res.csv)
      notify('Relatório exportado', `${res.filename} · ${res.rows} linhas`)
    } catch (err) {
      notifyError(err, 'Não foi possível exportar o relatório')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card size="sm" className="h-full px-5">
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-medium">{report.title}</p>
          <p className="text-xs text-muted-foreground">{report.description}</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-auto w-full gap-2"
        onClick={onExport}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {busy ? 'A gerar…' : 'Exportar CSV'}
      </Button>
    </Card>
  )
}
