'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

// Native BarcodeDetector API (Chrome 83+, Android Chrome - hardware accelerated)
declare class BarcodeDetector {
  constructor(options: { formats: string[] })
  detect(source: HTMLVideoElement | ImageBitmap): Promise<{ rawValue: string }[]>
  static getSupportedFormats(): Promise<string[]>
}

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
  const rafRef = useRef<number>(0)
  const frameCountRef = useRef(0)
  const detectorRef = useRef<BarcodeDetector | null>(null)
  const onScanRef = useRef(onScan)
  const startBtnRef = useRef<HTMLButtonElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const stopBtnRef = useRef<HTMLButtonElement>(null)
  const processingRef = useRef(false)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    if (typeof BarcodeDetector !== 'undefined') {
      try {
        detectorRef.current = new BarcodeDetector({ formats: ['qr_code'] })
      } catch {
        detectorRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return

    const video = videoRef.current
    let active = true

    const loop = () => {
      if (!active) return

      if (!video || processingRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      frameCountRef.current++
      if (frameCountRef.current % 5 !== 0) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      if (detectorRef.current) {
        detectorRef.current
          .detect(video)
          .then((results) => {
            if (!active) return

            if (results.length > 0 && !processingRef.current) {
              handleDetected(results[0].rawValue)
            } else {
              rafRef.current = requestAnimationFrame(loop)
            }
          })
          .catch(() => {
            rafRef.current = requestAnimationFrame(loop)
          })
        return
      }

      const canvas = canvasRef.current
      if (!canvas) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      try {
        const srcWidth = video.videoWidth
        const srcHeight = video.videoHeight
        if (!srcWidth || !srcHeight) {
          rafRef.current = requestAnimationFrame(loop)
          return
        }

        const targetWidth = 400
        const targetHeight = Math.round((srcHeight / srcWidth) * targetWidth)
        canvas.width = targetWidth
        canvas.height = targetHeight

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          rafRef.current = requestAnimationFrame(loop)
          return
        }

        ctx.drawImage(video, 0, 0, srcWidth, srcHeight, 0, 0, targetWidth, targetHeight)
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        })

        if (code && !processingRef.current) {
          handleDetected(code.data)
          return
        }
      } catch (err) {
        console.error('Erro no scanner jsQR:', err)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    video.srcObject = streamRef.current
    video
      .play()
      .then(() => {
        frameCountRef.current = 0
        rafRef.current = requestAnimationFrame(loop)
      })
      .catch(() => {
        setError('Erro ao iniciar o vídeo da câmera')
        setScanning(false)
      })

    return () => {
      active = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!scanning && !processing) startBtnRef.current?.focus()
  }, [scanning, processing])

  function announceStatus(msg: string) {
    if (statusRef.current) statusRef.current.textContent = msg
  }

  function handleDetected(data: string) {
    if (processingRef.current) return
    processingRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    stopCamera()
    setProcessing(true)
    announceStatus('QR Code detectado. Processando...')
    onScanRef.current(data).finally(() => {
      processingRef.current = false
      setProcessing(false)
      announceStatus('')
    })
  }

  function stopCamera() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
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
    processingRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
          // @ts-expect-error - advanced constraint (Chrome on Android)
          advanced: [{ focusMode: 'continuous' }],
        },
      })
      streamRef.current = stream
      setScanning(true)
      announceStatus('Câmera ativa. Apontando para o QR Code.')
      stopBtnRef.current?.focus()
    } catch (err) {
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
      } catch (err2) {
        const e = err2 instanceof DOMException ? err2 : (err instanceof DOMException ? err : null)
        const msg = e
          ? e.name === 'NotAllowedError'
            ? 'Permissão de câmera negada. Permita o acesso nos ajustes do navegador.'
            : e.name === 'NotFoundError'
              ? 'Nenhuma câmera encontrada no dispositivo.'
              : e.name === 'NotReadableError'
                ? 'Câmera em uso por outro aplicativo. Feche e tente novamente.'
                : `Erro ao acessar a câmera: ${e.message}`
          : 'Erro ao acessar a câmera. Verifique as permissões.'
        setError(msg)
        announceStatus('Erro ao acessar a câmera')
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={statusRef} role="status" aria-live="polite" className="sr-only" />

      {!scanning && !processing && (
        <button
          ref={startBtnRef}
          onClick={startCamera}
          aria-label="Iniciar leitura de QR Code pela câmera"
          className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          Iniciar Scanner
        </button>
      )}

      {scanning && (
        <div className="relative h-72 w-full max-w-md overflow-hidden rounded-lg border border-border lg:max-w-lg">
          <video ref={videoRef} className="size-full object-cover" autoPlay muted playsInline aria-label="Leitor de QR Code pela câmera" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="size-48 rounded-lg border-2 border-accent opacity-70" />
          </div>
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
          className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-danger-foreground transition-all hover:brightness-110"
        >
          Parar Scanner
        </button>
      )}
    </div>
  )
}
