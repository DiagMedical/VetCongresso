'use client'

import { QRCodeSVG } from 'qrcode.react'

export function QrCompartilhe({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg border border-border bg-white p-2">
        <QRCodeSVG value={url} size={140} level="M" />
      </div>
      <p className="text-xs text-muted text-center max-w-40 leading-relaxed">
        Escaneie ou compartilhe com outro colega
      </p>
    </div>
  )
}
