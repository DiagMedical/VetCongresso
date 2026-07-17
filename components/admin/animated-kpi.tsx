'use client'

import { useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'

interface AnimatedKpiProps {
  title: string
  value: number | string
  icon: ReactNode
  suffix?: string
  className?: string
}

export function AnimatedKpi({ title, value, icon, suffix, className }: AnimatedKpiProps) {
  const isStringVal = typeof value === 'string'
  const numericVal = isStringVal ? 0 : value
  const [display, setDisplay] = useState(isStringVal ? 0 : 0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    if (isStringVal) return
    const el = ref.current
    if (!el || counted.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const duration = 600
          const steps = 30
          const increment = numericVal / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= numericVal) {
              setDisplay(numericVal)
              clearInterval(timer)
            } else {
              setDisplay(Math.round(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isStringVal, numericVal])

  return (
    <div ref={ref} className={`flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in hover:ring-accent/20 hover:shadow-[0_0_8px_hsl(var(--accent)/0.1)] transition-all duration-300 ${className ?? ''}`}>
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {isStringVal ? value : `${display}${suffix ?? ''}`}
        </p>
      </div>
    </div>
  )
}
