'use client'

import { useEffect } from 'react'

export function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let retries = 0
    const maxRetries = 3

    function register() {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.debug('[SW] Registered:', reg.scope)

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.debug('[SW] Nova versão disponível — atualize a página')
                }
              })
            }
          })
        })
        .catch((err) => {
          console.debug('[SW] Registration failed:', err)
          if (retries < maxRetries) {
            retries++
            setTimeout(register, 2000 * retries)
          }
        })
    }

    // Register on load, or if already loaded, immediately
    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register)
      return () => window.removeEventListener('load', register)
    }
  }, [])

  return null
}
