// Estados de encomenda (catálogo). A API real devolve `state` como id + nome;
// aqui mapeamos id → label + "tone" para o badge de estado colorir de forma
// coerente. Ajustar os ids/labels quando confirmarmos os reais.

export type StatusTone =
  | 'pending'
  | 'progress'
  | 'shipped'
  | 'success'
  | 'cancelled'
  | 'refunded'

export type OrderState = {
  id: number
  label: string
  tone: StatusTone
}

export const ORDER_STATES: OrderState[] = [
  { id: 1, label: 'Aguarda pagamento', tone: 'pending' },
  { id: 2, label: 'Pago', tone: 'progress' },
  { id: 3, label: 'Em processamento', tone: 'progress' },
  { id: 4, label: 'Enviado', tone: 'shipped' },
  { id: 5, label: 'Entregue', tone: 'success' },
  { id: 6, label: 'Cancelado', tone: 'cancelled' },
  { id: 7, label: 'Reembolsado', tone: 'refunded' },
]

const STATE_VALID_IDS = new Set([2, 3, 4, 5])

/** Encomenda "válida" = paga em diante (não cancelada/reembolsada). */
export function isValidState(id: number): boolean {
  return STATE_VALID_IDS.has(id)
}

export function orderState(id: number): OrderState {
  return (
    ORDER_STATES.find((s) => s.id === id) ?? {
      id,
      label: 'Desconhecido',
      tone: 'pending',
    }
  )
}
