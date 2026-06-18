import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { UNAUTHORIZED_EVENT } from '@/lib/query'
import {
  clearSession,
  getAccessToken,
  getStoredEmployee,
  setSession,
  setStoredEmployee,
} from '@/lib/tokens'

import { logout as logoutApi } from './api'
import type { Employee, LoginResponse } from './schemas'

type AuthContextValue = {
  employee: Employee | null
  isAuthenticated: boolean
  /** Persiste sessão + funcionário a partir da resposta de login. */
  authenticate: (res: LoginResponse) => void
  /** Termina sessão (server best-effort) e limpa estado local. */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readInitialEmployee(): Employee | null {
  // Só consideramos autenticado se houver token válido E funcionário guardado.
  if (!getAccessToken()) return null
  return getStoredEmployee<Employee>()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(readInitialEmployee)

  const authenticate = useCallback((res: LoginResponse) => {
    setSession(res.token, res.expires_in)
    setStoredEmployee(res.employee)
    setEmployee(res.employee)
  }, [])

  const signOut = useCallback(async () => {
    await logoutApi()
    clearSession()
    setEmployee(null)
  }, [])

  // Qualquer query que apanhe 401 dispara este evento → força logout local.
  useEffect(() => {
    const onUnauthorized = () => {
      clearSession()
      setEmployee(null)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      employee,
      isAuthenticated: employee !== null && getAccessToken() !== null,
      authenticate,
      signOut,
    }),
    [employee, authenticate, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
