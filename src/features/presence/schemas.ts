import { z } from 'zod'

// Presença em tempo real — /live-users devolve quantos visitantes estão online
// agora (janela de N minutos, via connections do PrestaShop).

export const liveUsersSchema = z.object({
  /** Total online agora. */
  online: z.number(),
  /** Subconjunto autenticado (com conta). */
  customers: z.number(),
  /** Subconjunto anónimo (visitantes). */
  guests: z.number(),
})
export type LiveUsers = z.infer<typeof liveUsersSchema>
