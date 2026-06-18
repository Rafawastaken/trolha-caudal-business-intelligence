// Trolha Tracking API issues a single JWT (8h TTL) — there is no refresh token.
// We persist the token, its absolute expiry, and the logged-in employee so the
// app can restore the session on reload and proactively sign out when expired.

const TOKEN_KEY = 'tt_kpi_token'
const EXPIRES_KEY = 'tt_kpi_expires_at'
const EMPLOYEE_KEY = 'tt_kpi_employee'

export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  // Treat an expired token as absent so callers fall through to login.
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) ?? 0)
  if (expiresAt && Date.now() >= expiresAt) {
    clearSession()
    return null
  }
  return token
}

export function setSession(token: string, expiresInSeconds: number): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresInSeconds * 1000))
}

export function setStoredEmployee(employee: unknown): void {
  localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(employee))
}

export function getStoredEmployee<T = unknown>(): T | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(EMPLOYEE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
  localStorage.removeItem(EMPLOYEE_KEY)
}
