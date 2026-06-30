'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  intervalMs?: number
}

export function PalestrasAutoRefresh({ intervalMs = 30000 }: Props) {
  const router = useRouter()

  useEffect(() => {
    const refresh = () => router.refresh()
    const timer = window.setInterval(refresh, intervalMs)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [intervalMs, router])

  return null
}
