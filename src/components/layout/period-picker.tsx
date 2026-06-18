import { useState } from 'react'
import { CalendarDays, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatPtDate } from '@/lib/dates'
import {
  PRESET_LABELS,
  usePeriod,
  type PresetKey,
} from '@/lib/period'
import { cn } from '@/lib/utils'

const PRESETS: Exclude<PresetKey, 'custom'>[] = [
  'today',
  'last7',
  'last30',
  'last90',
  'thisMonth',
  'lastMonth',
  'thisYear',
]

export function PeriodPicker() {
  const { period, setPreset } = usePeriod()
  const [open, setOpen] = useState(false)

  const label =
    period.preset === 'custom'
      ? `${formatPtDate(period.from)} – ${formatPtDate(period.to)}`
      : PRESET_LABELS[period.preset]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarDays className="size-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5">
        <div className="flex flex-col gap-0.5">
          {PRESETS.map((key) => {
            const active = period.preset === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPreset(key)
                  setOpen(false)
                }}
                className={cn(
                  'flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors',
                  'hover:bg-muted',
                  active && 'font-medium text-primary',
                )}
              >
                {PRESET_LABELS[key]}
                {active && <Check className="size-4" />}
              </button>
            )
          })}
        </div>
        <div className="mt-1 border-t px-2.5 pt-2 text-xs text-muted-foreground">
          {formatPtDate(period.from)} – {formatPtDate(period.to)}
        </div>
      </PopoverContent>
    </Popover>
  )
}
