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

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  function scanFrame() {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

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
      onScanRef.current(code.data).finally(() => setProcessing(false))
      return
    }

    animationRef.current = requestAnimationFrame(scanFrame)
  }

  function stopCamera() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  async function startCamera() {
    setError('')
    setProcessing(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      scanFrame()
    } catch {
      setError('Erro ao acessar a câmera. Verifique as permissões.')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!scanning && !processing && (
        <button
          onClick={startCamera}
          className="rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:brightness-110 transition-all"
        >
          Iniciar Scanner
        </button>
      )}

      {scanning && (
        <div className="relative overflow-hidden rounded-lg border border-border">
          <video ref={videoRef} className="max-w-full" playsInline aria-label="Leitor de QR Code pela câmera" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-[3px] border-primary/50 rounded-lg pointer-events-none" />
        </div>
      )}

      {processing && (
        <div className="flex items-center gap-2 text-muted">
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Processando...
        </div>
      )}

      {error && (
        <p className="rounded-md bg-danger/10 p-3 text-sm text-danger">{error}</p>
      )}

      {scanning && (
        <button
          onClick={stopCamera}
          className="rounded-md bg-danger px-4 py-2 text-sm text-danger-foreground font-medium hover:brightness-110 transition-all"
        >
          Parar Scanner
        </button>
      )}
    </div>
  )
}
