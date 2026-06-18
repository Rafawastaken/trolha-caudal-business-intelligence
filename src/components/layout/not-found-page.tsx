import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { paths } from '@/paths'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl font-semibold tracking-tight text-muted-foreground">
        404
      </p>
      <p className="text-sm text-muted-foreground">
        A página que procuras não existe.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link to={paths.home}>Voltar ao dashboard</Link>
      </Button>
    </div>
  )
}
