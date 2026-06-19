import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { orderState } from '../order-states'
import { useOrderStates, usePayments } from '../queries'

const ALL = 'all'

type OrdersFiltersProps = {
  search: string
  onSearchChange: (v: string) => void
  state?: number
  onStateChange: (v?: number) => void
  payment?: string
  onPaymentChange: (v?: string) => void
}

export function OrdersFilters({
  search,
  onSearchChange,
  state,
  onStateChange,
  payment,
  onPaymentChange,
}: OrdersFiltersProps) {
  // Opções vindas dos dados reais do período (ids/estados e métodos de
  // pagamento efetivos) em vez de listas fixas que não batem com o backend.
  const { data: states } = useOrderStates()
  const { data: payments } = usePayments()

  const hasFilters = !!search || state !== undefined || payment !== undefined

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar por referência ou cliente…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-8"
        />
      </div>

      <Select
        value={state === undefined ? ALL : String(state)}
        onValueChange={(v) => onStateChange(v === ALL ? undefined : Number(v))}
      >
        <SelectTrigger className="h-9 w-full sm:w-44">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os estados</SelectItem>
          {(states ?? []).map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.label ?? orderState(s.id).label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={payment ?? ALL}
        onValueChange={(v) => onPaymentChange(v === ALL ? undefined : v)}
      >
        <SelectTrigger className="h-9 w-full sm:w-48">
          <SelectValue placeholder="Pagamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os pagamentos</SelectItem>
          {(payments ?? []).map((p) => (
            <SelectItem key={p.method} value={p.method}>
              {p.method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            onSearchChange('')
            onStateChange(undefined)
            onPaymentChange(undefined)
          }}
        >
          <X className="size-4" />
          Limpar
        </Button>
      )}
    </div>
  )
}
