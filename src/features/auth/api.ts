import { api } from '@/lib/api'
import { env } from '@/lib/env'

import {
  loginResponseSchema,
  type LoginInput,
  type LoginResponse,
} from './schemas'

export async function login(input: LoginInput): Promise<LoginResponse> {
  // Modo mock: autentica localmente sem backend (preview de design).
  if (env.VITE_USE_MOCK) {
    return {
      token: 'mock-token',
      token_type: 'Bearer',
      expires_in: 28800,
      employee: {
        name: input.email.split('@')[0] || 'Funcionário',
        email: input.email,
        role: 'Compras',
      },
    }
  }

  const data = await api<unknown>('/kpi-api/login', {
    method: 'POST',
    body: input,
  })
  return loginResponseSchema.parse(data)
}

export async function logout(): Promise<void> {
  if (env.VITE_USE_MOCK) return
  await api<unknown>('/kpi-api/logout', { method: 'POST' }).catch(() => undefined)
}
