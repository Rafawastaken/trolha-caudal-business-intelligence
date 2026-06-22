import { Kicker } from '@/components/kicker'
import { Card } from '@/components/ui/card'
import { formatNum } from '@/lib/format'
import { useLiveUsers } from '@/features/presence/queries'

/**
 * "Ao vivo" — o pulso da loja agora. Peça-assinatura do dashboard: reusa o
 * material do banner da Receita (navy + glow laranja) mas com a sua própria
 * identidade — o ponto verde a pulsar e o número de visitantes em tempo real.
 */
export function LiveNowCard() {
  const { data } = useLiveUsers()
  const online = data?.online ?? 0
  const customers = data?.customers ?? 0
  const guests = data?.guests ?? 0
  const custPct = online > 0 ? (customers / online) * 100 : 0

  return (
    <Card className="relative h-full justify-between gap-4 overflow-hidden bg-[#08131F] px-5 py-5 text-white ring-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-8 size-40 rounded-full bg-[#F5811E]/15 blur-3xl"
      />

      <div className="relative flex items-center justify-between">
        <Kicker className="text-[#8DA2B4]">Ao vivo</Kicker>
        <span className="relative flex size-2.5" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
        </span>
      </div>

      <div className="relative">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold tracking-tight tabular-nums">
            {formatNum(online)}
          </span>
          <span className="text-sm text-[#8DA2B4]">
            {online === 1 ? 'visitante online' : 'visitantes online'}
          </span>
        </div>

        {online > 0 ? (
          <div className="mt-3 space-y-1.5">
            <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="bg-[#F5811E]"
                style={{ width: `${custPct}%` }}
              />
              <div className="bg-[#4F7DA8]" style={{ width: `${100 - custPct}%` }} />
            </div>
            <p className="text-xs text-[#8DA2B4]">
              <span className="text-white tabular-nums">{formatNum(customers)}</span>{' '}
              com conta ·{' '}
              <span className="text-white tabular-nums">{formatNum(guests)}</span>{' '}
              visitantes
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-[#8DA2B4]">
            Ninguém no site neste momento.
          </p>
        )}
      </div>
    </Card>
  )
}
