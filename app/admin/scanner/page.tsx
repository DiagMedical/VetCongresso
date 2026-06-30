'use client'

import { useState, Component, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ArrowLeft, User, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'
import { Scanner } from '@/components/scanner'
import { BackToTop } from '@/components/back-to-top'
import { AdminPageHeader } from '@/components/admin/page-header'
import { AdminSectionCard } from '@/components/admin/section-card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

class ScanErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    console.error('ScanErrorBoundary caught:', error)
  }
  render() {
    if (this.state.hasError) return <p className="text-sm text-danger">Erro interno ao exibir dados do participante</p>
    return this.props.children
  }
}

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

    const trimmed = data.trim()

    const parsed = tryParseQr(trimmed)
    if (parsed) {
      setQrData(parsed)
      return
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)
    if (isUuid) {
      setConfirmando(true)
      try {
        const { obterDadosInscrito } = await import('@/lib/actions/admin')
        const dados = await obterDadosInscrito(trimmed)
        if (dados) {
          setQrData(dados)
          return
        }
      } catch (err) {
        console.error('Erro ao carregar dados do QR code:', err)
      } finally {
        setConfirmando(false)
      }
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
      osc.onended = () => ctx.close()
    } catch {}
  }

  async function doCheckin(inscritoId: string) {
    setConfirmando(true)
    try {
      const { realizarCheckInAdmin } = await import('@/lib/actions/admin')
      await realizarCheckInAdmin(inscritoId)
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
        className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao Dashboard
      </Link>

      <AdminPageHeader
        title="Scanner QR"
        description="Posicione o QR Code do ticket na frente da câmera para realizar o check-in."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <AdminSectionCard
          title="Leitura do QR"
          description="Abra a câmera e aponte para o QR Code. Quando a leitura terminar, os dados aparecem ao lado."
          bodyClassName="space-y-4"
        >
          <div className="flex flex-col items-center gap-4">
            {!qrData && <Scanner key={scannerKey} onScan={handleScan} />}

            {confirmando && (
              <div className="flex items-center gap-2 text-muted-foreground" aria-live="polite">
                <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" role="status" aria-label="Carregando" />
                Carregando dados do participante...
              </div>
            )}

            {!qrData && !confirmando && !resultado && (
              <p className="max-w-md text-center text-sm leading-relaxed text-muted">
                Posicione o QR Code dentro da moldura e aguarde o reconhecimento automático.
              </p>
            )}

            {resultado && (
              <div
                className={`flex w-full items-center gap-3 rounded-xl border p-4 ${
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
        </AdminSectionCard>

        <ScanErrorBoundary>
          <AdminSectionCard
            title="Participante detectado"
            description={qrData ? 'Revise os dados antes de confirmar.' : 'Os dados lidos aparecerão aqui.'}
            bodyClassName="space-y-4"
          >
            {qrData ? (
              <>
                <div className="space-y-3 text-sm">
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
                    <span>{qrData.d?.slice(0, 16).replace('T', ' ')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => doCheckin(qrData.id)}
                    disabled={confirmando}
                    className="flex-1"
                  >
                    {confirmando ? 'Confirmando...' : 'Confirmar Check-in'}
                  </Button>
                  <Button
                    onClick={cancelar}
                    disabled={confirmando}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-background/60 p-4 text-sm text-muted">
                Nenhum QR Code confirmado ainda. Assim que uma leitura válida acontecer, este painel será preenchido automaticamente.
              </div>
            )}
          </AdminSectionCard>
        </ScanErrorBoundary>
      </div>

      <BackToTop />
    </div>
  )
}
