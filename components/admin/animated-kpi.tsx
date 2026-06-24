'use client'

import { useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'

interface AnimatedKpiProps {
  title: string
  value: number
  icon: ReactNode
  suffix?: string
}

export function AnimatedKpi({ title, value, icon, suffix }: AnimatedKpiProps) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || counted.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const duration = 600
          const steps = 30
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setDisplay(value)
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
  }, [value])

  return (
    <div ref={ref} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in">
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {display}{suffix ?? ''}
        </p>
      </div>
    </div>
  )
}
