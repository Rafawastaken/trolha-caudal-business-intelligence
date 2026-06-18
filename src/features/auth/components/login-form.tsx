import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notifyError } from '@/lib/toast'

import { useLogin } from '../hooks'
import { loginInputSchema } from '../schemas'

/**
 * Formulário de autenticação: estado, validação Zod e submit. Única
 * responsabilidade — a apresentação da página vive no login-page.
 */
export function LoginForm() {
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = loginInputSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }
    setErrors({})
    login.mutate(parsed.data, {
      onError: (err) => notifyError(err, 'Não foi possível iniciar sessão'),
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="nome@trolha.pt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          autoFocus
          className="h-11"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Esconder password' : 'Mostrar password'}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="group mt-1 h-11 w-full text-sm font-semibold"
        disabled={login.isPending}
      >
        {login.isPending ? 'A entrar…' : 'Entrar'}
        {!login.isPending && (
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        )}
      </Button>
    </form>
  )
}
