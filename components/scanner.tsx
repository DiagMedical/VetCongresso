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
  const scanTimeoutRef = useRef<any>(null)
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
        scanTimeoutRef.current = setTimeout(scanFrame, 500)
      }).catch(() => {
        setError('Erro ao iniciar o vídeo da câmera')
        setScanning(false)
      })
    }
  }, [scanning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

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
    if (!videoRef.current || !canvasRef.current || !scanning) return

    const video = videoRef.current
    const canvas = canvasRef.current

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      scanTimeoutRef.current = setTimeout(scanFrame, 100)
      return
    }

    const srcWidth = video.videoWidth
    const srcHeight = video.videoHeight

    // Crop central
    const size = Math.min(srcWidth, srcHeight)
    const offsetX = (srcWidth - size) / 2
    const offsetY = (srcHeight - size) / 2

    // Downscale target size to 400x400 for faster CPU processing
    const targetSize = 400
    canvas.width = targetSize
    canvas.height = targetSize

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      scanTimeoutRef.current = setTimeout(scanFrame, 200)
      return
    }

    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, targetSize, targetSize)
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
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

    // Schedule next frame with 200ms delay to keep the camera feed smooth and CPU cool
    scanTimeoutRef.current = setTimeout(scanFrame, 200)
  }

  function stopCamera() {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }
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
          facingMode: 'environment',
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
        },
      })
      streamRef.current = stream
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
