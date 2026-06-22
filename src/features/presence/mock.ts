import type { LiveUsers } from './schemas'

// Valor de demonstração — oscila um pouco ao longo do dia para o badge não ficar
// estático no preview (sem aleatoriedade pura, para ser determinístico por minuto).
export function mockLiveUsers(): LiveUsers {
  const now = new Date()
  const base = 3 + ((now.getHours() + now.getMinutes()) % 9)
  const customers = Math.max(0, Math.round(base * 0.35))
  return { online: base, customers, guests: base - customers }
}
