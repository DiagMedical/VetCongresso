import QRCode from 'qrcode'

export async function QrCompartilhe({ url }: { url: string }) {
  const dataUrl = await QRCode.toDataURL(url, {
    width: 280,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg border border-border bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt={`QR Code: ${url}`} className="size-36" />
      </div>
      <p className="text-xs text-muted text-center max-w-40 leading-relaxed">
        Escaneie ou compartilhe com outro colega
      </p>
    </div>
  )
}
