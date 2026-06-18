import { TrolhaWordmark } from '@/components/brand/trolha-wordmark'

import { FlowWave } from '../components/flow-wave'
import { LoginBrandPanel } from '../components/login-brand-panel'
import { LoginForm } from '../components/login-form'

/**
 * Página de login: split-screen escuro. Painel de marca à esquerda (ecrãs
 * largos), formulário à direita. Em mobile o painel colapsa para um cabeçalho
 * de marca + assinatura ao fundo. Força o esquema escuro (classe `dark`).
 */
export function LoginPage() {
  return (
    <div className="dark grid min-h-svh bg-[#08131F] text-[#E8EEF3] lg:grid-cols-2">
      <LoginBrandPanel />

      <div className="relative flex flex-col justify-between px-6 py-10 sm:px-12 lg:justify-center lg:py-12">
        {/* cabeçalho de marca — só em mobile (em desktop vive no painel) */}
        <div className="lg:hidden">
          <TrolhaWordmark className="text-white" />
          <p className="mt-8 font-mono text-[11px] tracking-[0.25em] text-[#36B7CE]">
            SISTEMA DE INTELIGÊNCIA
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight font-bold tracking-tight text-white">
            O caudal do teu negócio.
          </h1>
        </div>

        <div className="mx-auto w-full max-w-sm py-10 lg:py-0">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white">
              Iniciar sessão
            </h2>
            <p className="mt-2 text-sm text-[#8DA2B4]">
              Entra com a tua conta de funcionário.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0E2233] p-6 shadow-2xl sm:p-8">
            <LoginForm />
          </div>

          <p className="mt-8 text-center font-mono text-[11px] tracking-[0.2em] text-[#5C7689]">
            TROLHA.PT · PULSE
          </p>
          <p className="mt-2 text-center text-xs text-[#5C7689]">
            Desenvolvido por{' '}
            <a
              href="https://github.com/Rafawastaken"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#F5811E] transition-colors hover:text-[#FFB066]"
            >
              @Rafawastaken
            </a>
          </p>
        </div>

        {/* assinatura — só em mobile (full-bleed ao fundo) */}
        <div
          aria-hidden="true"
          className="-mx-6 lg:hidden sm:-mx-12"
        >
          <FlowWave className="h-16" />
        </div>
      </div>
    </div>
  )
}
