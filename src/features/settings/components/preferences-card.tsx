import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getLowStockThreshold, setLowStockThreshold } from '@/lib/preferences'
import { notify } from '@/lib/toast'

export function PreferencesCard() {
  const [value, setValue] = useState(() => String(getLowStockThreshold()))

  function save() {
    const n = Number(value)
    if (!Number.isFinite(n) || n < 1) {
      setValue(String(getLowStockThreshold()))
      return
    }
    const v = Math.floor(n)
    setLowStockThreshold(v)
    setValue(String(v))
    notify('Preferências guardadas', `Limiar de stock baixo: ${v} un.`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <Label htmlFor="threshold">Limiar de stock baixo</Label>
          <div className="flex gap-2">
            <Input
              id="threshold"
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-9 w-24"
            />
            <Button size="sm" className="h-9" onClick={save}>
              Guardar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Produtos com stock ≤ este valor aparecem em “Stock baixo” na página de
            Produtos.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
