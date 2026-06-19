// Utilitários de exportação CSV — formato amigável para Excel pt-PT:
//   - delimitador `;` (o Excel pt-PT usa a vírgula como decimal)
//   - BOM UTF-8 para os acentos aparecerem corretos
//   - fim de linha CRLF

const BOM = String.fromCharCode(0xfeff)

function escapeCell(value: string | number): string {
  const s = String(value ?? '')
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Número em formato pt-PT (vírgula decimal, sem separador de milhares). */
export function csvNum(value: number, decimals = 2): string {
  return value.toLocaleString('pt-PT', {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export function toCsv(
  headers: string[],
  rows: Array<Array<string | number>>,
): string {
  const lines = [
    headers.map(escapeCell).join(';'),
    ...rows.map((r) => r.map(escapeCell).join(';')),
  ]
  return BOM + lines.join('\r\n')
}

/** Dispara o download de um ficheiro de texto no browser. */
export function downloadFile(
  filename: string,
  content: string,
  mime = 'text/csv;charset=utf-8;',
): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
