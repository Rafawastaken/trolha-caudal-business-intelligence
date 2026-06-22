import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getLeadTimeDays,
  getLowStockThreshold,
  getTargetCoverDays,
  setLeadTimeDays,
  setLowStockThreshold,
  setTargetCoverDays,
} from '@/lib/preferences'
import { notify } from '@/lib/toast'

export function PreferencesCard() {
  const [threshold, setThreshold] = useState(() =>
    String(getLowStockThreshold()),
  )
  const [leadTime, setLeadTime] = useState(() => String(getLeadTimeDays()))
  const [targetCover, setTargetCover] = useState(() =>
    String(getTargetCoverDays()),
  )

  function save() {
    const t = Number(threshold)
    const lt = Number(leadTime)
    const tc = Number(targetCover)
    if (
      !Number.isFinite(t) || t < 1 ||
      !Number.isFinite(lt) || lt < 1 ||
      !Number.isFinite(tc) || tc < 1
    ) {
      // Reverte campos inválidos para o valor guardado.
      setThreshold(String(getLowStockThreshold()))
      setLeadTime(String(getLeadTimeDays()))
      setTargetCover(String(getTargetCoverDays()))
      notify('Valores inválidos', 'Usa números inteiros ≥ 1.')
      return
    }
    setLowStockThreshold(Math.floor(t))
    setLeadTimeDays(Math.floor(lt))
    setTargetCoverDays(Math.floor(tc))
    setThreshold(String(getLowStockThreshold()))
    setLeadTime(String(getLeadTimeDays()))
    setTargetCover(String(getTargetCoverDays()))
    notify('Preferências guardadas', 'Atualizado em Produtos & Stock.')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="threshold">Limiar de stock baixo</Label>
          <Input
            id="threshold"
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="h-9 w-24"
          />
          <p className="text-xs text-muted-foreground">
            Produtos com stock ≤ este valor aparecem em “Stock baixo”.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-time">Lead-time do fornecedor (dias)</Label>
          <Input
            id="lead-time"
            type="number"
            min={1}
            value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
            className="h-9 w-24"
          />
          <p className="text-xs text-muted-foreground">
            Tempo entre encomendar e receber o stock. Usado na “Reposição de
            stock”.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="target-cover">Cobertura alvo (dias)</Label>
          <Input
            id="target-cover"
            type="number"
            min={1}
            value={targetCover}
            onChange={(e) => setTargetCover(e.target.value)}
            className="h-9 w-24"
          />
          <p className="text-xs text-muted-foreground">
            Dias de stock a manter para além do lead-time ao calcular a
            quantidade a encomendar.
          </p>
        </div>

        <Button size="sm" className="h-9" onClick={save}>
          Guardar
        </Button>
      </CardContent>
    </Card>
  )
}
