'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

interface ScannerProps {
  onScan: (data: string) => Promise<void>
}

export function Scanner({ onScan }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>(0)
  const onScanRef = useRef(onScan)
  const startBtnRef = useRef<HTMLButtonElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const stopBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  // Attach stream to video element when scanning starts
  useEffect(() => {
    if (scanning && videoRef.current && streamRef.current) {
      const video = videoRef.current
      video.srcObject = streamRef.current
video.play().then(() => {
          // Give camera a moment to stabilize before scanning
          setTimeout(scanFrame, 500)
        }).catch((e) => {
        console.error('Erro ao iniciar vídeo:', e)
        setError('Erro ao iniciar o vídeo da câmera')
        announceStatus('Erro ao iniciar o vídeo')
        setScanning(false)
      })
    }
  }, [scanning])

  useEffect(() => {
    if (!scanning && !processing) {
      startBtnRef.current?.focus()
    }
  }, [scanning, processing])

  function announceStatus(msg: string) {
    if (statusRef.current) {
      statusRef.current.textContent = msg
    }
  }

  function scanFrame() {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    try {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(scanFrame)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code) {
        stopCamera()
        setProcessing(true)
        announceStatus('QR Code detectado. Processando...')
        onScanRef.current(code.data).finally(() => {
          setProcessing(false)
          announceStatus('')
        })
        return
      }

      animationRef.current = requestAnimationFrame(scanFrame)
    } catch (e) {
      console.error('scanFrame error:', e)
      setError('Erro ao processar o frame da câmera')
      stopCamera()
    }
  }

  function stopCamera() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setScanning(false)
    announceStatus('Câmera desligada')
  }

  async function startCamera() {
    setError('')
    setProcessing(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      // Enable UI and focus stop button; video will be attached in useEffect when rendered
      setScanning(true)
      announceStatus('Câmera ativa. Apontando para o QR Code.')
      stopBtnRef.current?.focus()
    } catch (err) {
      const msg = err instanceof DOMException
        ? err.name === 'NotAllowedError'
          ? 'Permissão de câmera negada. Permita o acesso nos ajustes do navegador.'
          : err.name === 'NotFoundError'
            ? 'Nenhuma câmera encontrada no dispositivo.'
            : err.name === 'NotReadableError'
              ? 'Câmera em uso por outro aplicativo. Feche e tente novamente.'
              : `Erro ao acessar a câmera: ${err.message}`
        : 'Erro ao acessar a câmera. Verifique as permissões.'
      setError(msg)
      announceStatus('Erro ao acessar a câmera')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      />

      {!scanning && !processing && (
        <button
          ref={startBtnRef}
          onClick={startCamera}
          aria-label="Iniciar leitura de QR Code pela câmera"
          className="rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:brightness-110 transition-all"
        >
          Iniciar Scanner
        </button>
      )}

      {scanning && (
        <div className="relative w-full max-w-sm h-72 overflow-hidden rounded-lg border border-border">
          <video ref={videoRef} className="size-full object-cover" autoPlay muted playsInline aria-label="Leitor de QR Code pela câmera" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-[3px] border-primary/50 rounded-lg pointer-events-none" />
        </div>
      )}

      {processing && (
        <div className="flex items-center gap-2 text-muted-foreground" aria-live="polite">
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" role="status" aria-label="Processando" />
          Processando...
        </div>
      )}

      {error && (
        <p className="rounded-md bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>
      )}

      {scanning && (
        <button
          ref={stopBtnRef}
          onClick={stopCamera}
          aria-label="Parar leitura de QR Code"
          className="rounded-md bg-danger px-4 py-2 text-sm text-danger-foreground font-medium hover:brightness-110 transition-all"
        >
          Parar Scanner
        </button>
      )}
    </div>
  )
}
