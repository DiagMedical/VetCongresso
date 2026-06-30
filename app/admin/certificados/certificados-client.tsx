'use client'

import { useState, useRef } from 'react'
import { Award, Download, Loader2, Search, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import type { CertificadoData } from '@/lib/actions/admin'
import { formatDateShort, formatDuracao } from '@/lib/utils'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  dados: CertificadoData[]
}

export function CertificadosClient({ dados }: Props) {
  const [busca, setBusca] = useState('')
  const [emitindo, setEmitindo] = useState<string | null>(null)
  const [selected, setSelected] = useState<CertificadoData | null>(null)
  const certRef = useRef<HTMLDivElement>(null)

  const filtrados = dados.filter(
    (d) =>
      d.nome.toLowerCase().includes(busca.toLowerCase()) ||
      d.email.toLowerCase().includes(busca.toLowerCase()) ||
      d.palestra_nome.toLowerCase().includes(busca.toLowerCase())
  )

  async function handleEmitirPDF(item: CertificadoData) {
    if (!certRef.current) return

    setEmitindo(item.id)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('l', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 15
      const imgW = pageW - margin * 2
      const imgH = (canvas.height * imgW) / canvas.width

      pdf.addImage(imgData, 'JPEG', margin, (pageH - imgH) / 2, imgW, imgH)
      pdf.save(`certificado-${item.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`)

      toast.success(`Certificado de ${item.nome} exportado!`)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar certificado')
    } finally {
      setEmitindo(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold text-foreground">Certificados</h2>
        <p className="text-sm text-muted-foreground">
          {dados.length} participante(s) com check-in
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou palestra..."
          aria-label="Buscar certificados"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Participantes com check-in">
          <caption className="sr-only">Lista de participantes habilitados para certificado</caption>
          <thead className="bg-card">
            <tr className="text-left text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Nome</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Palestra</th>
              <th scope="col" className="px-4 py-3 font-medium">Check-in</th>
              <th scope="col" className="px-4 py-3 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((item) => (
              <tr key={item.id} className="bg-background hover:bg-card/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{item.nome}</td>
                <td className="px-4 py-3 text-muted">{item.email}</td>
                <td className="px-4 py-3 text-foreground">{item.palestra_nome}</td>
                <td className="px-4 py-3 text-xs text-muted">{formatDateShort(item.checkin_at)}</td>
                <td className="px-4 py-3">
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(item)}
                        >
                          <Award className="size-3.5" />
                          Emitir
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Certificado</DialogTitle>
                      </DialogHeader>
                      {selected && selected.id === item.id && (
                        <>
                          <div
                            ref={certRef}
                            className="relative overflow-hidden rounded-lg bg-white p-8 text-center text-gray-900"
                            style={{ width: '680px', minHeight: '480px' }}
                          >
                            <div className="absolute inset-0 opacity-[0.03]"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                              }}
                            />

                            <div className="relative flex flex-col items-center">
                              <div className="flex items-center justify-center gap-6 mb-6">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/logo-abraveq.svg"
                                  alt="ABRAVEQ"
                                  className="h-14 w-auto"
                                />
                                <div className="h-12 w-px bg-gray-300" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/logo-diagnostic-vet.png"
                                  alt="Diagnostic Vet"
                                  className="h-12 w-auto"
                                />
                              </div>

                              <div className="mb-2 text-lg font-light tracking-[0.3em] text-gray-400">
                                ABRAVEQ 2026
                              </div>

                              <h1 className="mb-6 text-4xl font-bold tracking-wide text-gray-900">
                                C E R T I F I C A D O
                              </h1>

                              <div className="mb-8 w-24 border-t-2 border-gray-300" />

                              <p className="mb-6 text-sm leading-relaxed text-gray-600 max-w-lg">
                                Certificamos que{' '}
                                <span className="font-bold text-gray-900">{item.nome}</span>
                                {' '}participou da palestra{' '}
                                <span className="font-bold text-gray-900">&ldquo;{item.palestra_nome}&rdquo;</span>
                                , ministrada por{' '}
                                <span className="font-bold text-gray-900">{item.palestrante}</span>
                                , no dia{' '}
                                <span className="font-bold text-gray-900">
                                  {formatDateShort(item.horario_inicio)}
                                </span>
                                , durante a XXVI Conferência Anual da ABRAVEQ, realizada de 2 a 4 de Junho de 2026 no
                                estande da Diagnostic Vet, com carga horária de{' '}
                                <span className="font-bold text-gray-900">
                                  {formatDuracao(item.horario_inicio, item.horario_fim)}
                                </span>
                                .
                              </p>

                              <div className="mb-6 w-24 border-t border-gray-200" />

                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>ABRAVEQ — Associação Brasileira de Médicos Veterinários de Equídeos</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="default"
                              onClick={() => handleEmitirPDF(item)}
                              disabled={emitindo === item.id}
                            >
                              {emitindo === item.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Download className="size-4" />
                              )}
                              {emitindo === item.id ? 'Gerando...' : 'Download PDF'}
                            </Button>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="mb-4 size-12 text-muted/40" />
            <p className="text-sm font-medium text-foreground">
              {busca
                ? 'Nenhum participante encontrado'
                : 'Nenhum participante com check-in ainda'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
