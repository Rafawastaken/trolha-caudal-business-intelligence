import { api } from '@/lib/api'

import { liveUsersSchema, type LiveUsers } from './schemas'

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) {
    return Number(v)
  }
  return 0
}

/** Visitantes online agora (últimos `minutes` minutos). */
export async function fetchLiveUsers(minutes = 5): Promise<LiveUsers> {
  const raw = await api<unknown>('/kpi-api/live-users', { params: { minutes } })
  // API: { online, customers, guests }
  const o = (raw ?? {}) as Record<string, unknown>
  const customers = toNumber(o.customers ?? o.logged_in ?? o.members)
  const guests = toNumber(o.guests ?? o.anonymous ?? o.visitors)
  return liveUsersSchema.parse({
    online: toNumber(o.online ?? o.total ?? o.count) || customers + guests,
    customers,
    guests,
  })
}
