'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ArrowLeft, User, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'
import { Scanner } from '@/components/scanner'
import { BackToTop } from '@/components/back-to-top'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface QrData {
  v: number
  id: string
  n: string
  t: string
  p: string
  d: string
  e: string
}

export default function ScannerPage() {
  const router = useRouter()
  const [resultado, setResultado] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(null)
  const [qrData, setQrData] = useState<QrData | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [scannerKey, setScannerKey] = useState(0)

  function tryParseQr(data: string): QrData | null {
    try {
      const parsed = JSON.parse(data)
      if (parsed && typeof parsed === 'object' && parsed.v && parsed.id) {
        return parsed as QrData
      }
      return null
    } catch {
      return null
    }
  }

  async function handleScan(data: string) {
    setResultado(null)

    const parsed = tryParseQr(data)
    if (parsed) {
      setQrData(parsed)
      return
    }

    await doCheckin(data)
  }

  function beep() {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 1200
      gain.gain.value = 0.3
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {} // fallback silencioso se AudioContext não disponível
  }

  async function doCheckin(inscritoId: string) {
    setConfirmando(true)
    try {
      const { realizarCheckIn } = await import('@/lib/actions/admin')
      await realizarCheckIn(inscritoId)
      beep()
      setResultado({ tipo: 'sucesso', mensagem: 'Check-in realizado com sucesso!' })
      toast.success('Check-in realizado!')
      setQrData(null)
      setScannerKey((k) => k + 1)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar check-in'
      setResultado({ tipo: 'erro', mensagem: msg })
      toast.error(msg)
    } finally {
      setConfirmando(false)
    }
  }

  function cancelar() {
    setQrData(null)
    setResultado(null)
    setScannerKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar ao Dashboard
      </Link>

      <h2 className="text-2xl font-bold text-foreground">Scanner QR</h2>
      <p className="text-sm text-muted">
        Posicione o QR Code do ticket na frente da câmera para realizar o check-in.
      </p>

      <div className="flex flex-col items-center">
        {!qrData && <Scanner key={scannerKey} onScan={handleScan} />}

        {qrData && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Dados do Participante</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="size-4 text-muted" />
                  <span>{qrData.n}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <BookOpen className="size-4 text-muted" />
                  <div>
                    <p>{qrData.t}</p>
                    <p className="text-xs text-muted">{qrData.p}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="size-4 text-muted" />
                  <span>
                    {format(new Date(qrData.d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => doCheckin(qrData.id)}
                disabled={confirmando}
                className="flex-1 rounded-md bg-success px-4 py-3 text-sm font-medium text-success-foreground hover:brightness-110 transition-all disabled:opacity-50"
              >
                {confirmando ? 'Confirmando...' : '✓ Confirmar Check-in'}
              </button>
              <button
                onClick={cancelar}
                disabled={confirmando}
                className="flex-1 rounded-md border border-border px-4 py-3 text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {resultado && (
          <div
            className={`mt-6 flex w-full max-w-sm items-center gap-3 rounded-lg border p-4 animate-fade-in ${
              resultado.tipo === 'sucesso'
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-danger/30 bg-danger/10 text-danger'
            }`}
          >
            {resultado.tipo === 'sucesso' ? (
              <CheckCircle2 className="size-6 shrink-0" />
            ) : (
              <XCircle className="size-6 shrink-0" />
            )}
            <p className="text-sm font-medium">{resultado.mensagem}</p>
          </div>
        )}
      </div>

      <BackToTop />
    </div>
  )
}
