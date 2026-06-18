import { Construction } from 'lucide-react'

import { PageHeader } from './page-header'

type PlaceholderPageProps = {
  title: string
  description?: string
}

/** Página estruturada provisória — substituída pela implementação da feature. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
        <Construction className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Em construção</p>
      </div>
    </div>
  )
}
