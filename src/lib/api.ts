import { env } from './env'
import { clearSession, getAccessToken } from './tokens'

export class ApiError extends Error {
  status: number
  code: string | undefined
  body: unknown

  constructor(status: number, body: unknown, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
    this.body = body
  }
}

// Trolha Tracking API response envelope.
//   success: { ok: true, meta?: {...}, data: <payload> }
//   error:   { ok: false, error: { message, code } }
type SuccessEnvelope<T> = { ok: true; meta?: Record<string, unknown>; data: T }
type ErrorEnvelope = {
  ok: false
  error: { message: string; code?: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  // Query params appended to the path; undefined/null values are skipped.
  params?: Record<string, string | number | boolean | undefined | null>
  // When true, a 401 resolves to null instead of throwing (session probes).
  unauthorizedAsNull?: boolean
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = `${env.VITE_API_URL}${path}`
  if (!params) return url
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    qs.append(key, String(value))
  }
  const query = qs.toString()
  return query ? `${url}?${query}` : url
}

/**
 * Core request that returns the full parsed envelope. On non-2xx or `ok:false`
 * it throws ApiError. On 401 it clears the local session (the JWT is dead and
 * there is no refresh token to swap).
 */
async function request<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<SuccessEnvelope<T>> {
  const { body, params, unauthorizedAsNull, headers, ...rest } = opts

  const token = getAccessToken()
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  // O login da Trolha API espera `application/x-www-form-urlencoded`. Passa um
  // URLSearchParams como body e deixamos o fetch definir o content-type; os
  // restantes endpoints (JSON) seguem o caminho normal.
  const isForm = body instanceof URLSearchParams
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...authHeader,
    ...(headers as Record<string, string>),
  }
  if (!isForm && body !== undefined) {
    baseHeaders['Content-Type'] = 'application/json'
  }

  const res = await fetch(buildUrl(path, params), {
    ...rest,
    headers: baseHeaders,
    body:
      body === undefined
        ? undefined
        : isForm
          ? (body as URLSearchParams)
          : JSON.stringify(body),
  })

  if (res.status === 401) {
    clearSession()
    if (unauthorizedAsNull) {
      return { ok: true, data: null as T }
    }
  }

  const contentType = res.headers.get('content-type') ?? ''
  const payload = (
    contentType.includes('application/json')
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null)
  ) as Envelope<T> | null

  if (!res.ok || (payload && payload.ok === false)) {
    const err =
      payload && payload.ok === false ? payload.error : undefined
    throw new ApiError(
      res.status,
      payload,
      err?.message ?? `${res.status} ${res.statusText}`,
      err?.code,
    )
  }

  return payload as SuccessEnvelope<T>
}

/** Returns just the unwrapped `data` payload. The common case. */
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const envelope = await request<T>(path, opts)
  return envelope.data
}

/** Returns `data` plus the `meta` envelope (pagination, period bounds). */
export async function apiWithMeta<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<{ data: T; meta: Record<string, unknown> }> {
  const envelope = await request<T>(path, opts)
  return { data: envelope.data, meta: envelope.meta ?? {} }
}
