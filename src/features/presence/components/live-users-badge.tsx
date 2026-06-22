import { formatNum } from '@/lib/format'

import { useLiveUsers } from '../queries'

/**
 * Badge "X online" — visitantes no site agora. Atualiza sozinho. Discreto:
 * esconde-se enquanto carrega ou se a chamada falhar (não estorva o topbar).
 */
export function LiveUsersBadge() {
  const { data } = useLiveUsers()
  if (!data) return null

  const title =
    `${formatNum(data.online)} online agora` +
    ` · ${formatNum(data.customers)} com conta, ${formatNum(data.guests)} visitantes`

  return (
    <span
      title={title}
      className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-xs font-medium tabular-nums sm:inline-flex"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/70" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      {formatNum(data.online)}
      <span className="text-muted-foreground">online</span>
    </span>
  )
}
