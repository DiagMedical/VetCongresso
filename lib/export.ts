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

export async function exportarRelatorioPDF(containerId: string, filename: string) {
  const element = document.getElementById(containerId)
  if (!element) throw new Error('Container não encontrado')

  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 10
  const imgWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const usableHeight = pageHeight - margin * 2

  let yOffset = margin
  pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight)

  let remaining = imgHeight - usableHeight
  while (remaining > 0) {
    yOffset = -(imgHeight - remaining) + margin
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight)
    remaining -= usableHeight
  }

  pdf.save(`${filename}.pdf`)
}
