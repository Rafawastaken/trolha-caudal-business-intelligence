import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { queryClient } from '@/lib/query'
import { paths } from '@/paths'

import { login } from './api'
import { useAuth } from './auth-context'
import type { LoginInput } from './schemas'

export function useLogin() {
  const navigate = useNavigate()
  const { authenticate } = useAuth()

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (res) => {
      authenticate(res)
      navigate(paths.home, { replace: true })
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      queryClient.clear()
      navigate(paths.login, { replace: true })
    },
  })
}
