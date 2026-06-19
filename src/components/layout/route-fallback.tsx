import { Loader2 } from 'lucide-react'

/** Fallback enquanto o chunk da rota (lazy) carrega. */
export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
