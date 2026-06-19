type Row = { label: string; value: string; color?: string }

/** Caixa de tooltip partilhada pelos gráficos de tendências. */
export function ChartTooltipBox({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{title}</p>
      {rows.map((r, i) => (
        <p key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {r.color && (
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: r.color }}
              />
            )}
            {r.label}
          </span>
          <span className="font-medium tabular-nums">{r.value}</span>
        </p>
      ))}
    </div>
  )
}
