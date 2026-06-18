import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatNum } from '@/lib/format'

import type { PageMeta } from '../schemas'

type OrdersPaginationProps = {
  meta: PageMeta
  onPageChange: (page: number) => void
}

export function OrdersPagination({ meta, onPageChange }: OrdersPaginationProps) {
  const { page, pages, total, per_page } = meta
  const start = total === 0 ? 0 : (page - 1) * per_page + 1
  const end = Math.min(page * per_page, total)

  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <p className="text-muted-foreground">
        {formatNum(start)}–{formatNum(end)} de {formatNum(total)}
      </p>
      <div className="flex items-center gap-1.5">
        <span className="mr-1 text-muted-foreground">
          Página {page} de {pages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página seguinte"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
