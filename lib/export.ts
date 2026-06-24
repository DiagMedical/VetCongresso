import type { LeadExport } from '@/lib/actions/admin'

export async function exportToXLSX(data: LeadExport[], filename: string) {
  const XLSX = await import('xlsx')

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Leads')

  const colWidths = Object.keys(data[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key as keyof LeadExport] ?? '').length)
    ),
  }))
  ws['!cols'] = colWidths

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export async function exportToCSV(data: LeadExport[], filename: string) {
  const XLSX = await import('xlsx')

  const ws = XLSX.utils.json_to_sheet(data)
  const csv: string = XLSX.utils.sheet_to_csv(ws)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
