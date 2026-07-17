'use client'

import { useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'

interface AnimatedKpiProps {
  title: string
  value: number | string
  icon: ReactNode
  suffix?: string
  className?: string
  gradient?: 'primary' | 'accent' | 'purple' | 'cyan' | 'green' | 'rose'
}

const GRADIENT_MAP = {
  primary: { bg: 'bg-primary/10', text: 'text-primary', glow: 'hsl(var(--primary)/0.15)', iconGlow: 'hsl(var(--primary)/0.3)' },
  accent: { bg: 'bg-accent/10', text: 'text-accent', glow: 'hsl(var(--accent)/0.15)', iconGlow: 'hsl(var(--accent)/0.3)' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'hsl(270 80% 50%/0.15)', iconGlow: 'hsl(270 80% 50%/0.3)' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'hsl(190 90% 50%/0.15)', iconGlow: 'hsl(190 90% 50%/0.3)' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', glow: 'hsl(160 80% 40%/0.15)', iconGlow: 'hsl(160 80% 40%/0.3)' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'hsl(340 80% 50%/0.15)', iconGlow: 'hsl(340 80% 50%/0.3)' },
} as const

export function AnimatedKpi({ title, value, icon, suffix, className, gradient = 'primary' }: AnimatedKpiProps) {
  const isStringVal = typeof value === 'string'
  const numericVal = isStringVal ? 0 : value
  const [display, setDisplay] = useState(isStringVal ? 0 : 0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)
  const g = GRADIENT_MAP[gradient]

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
    <div
      ref={ref}
      className={`flex items-center gap-4 rounded-xl border border-border bg-card p-4 animate-fade-in transition-all duration-300 hover:shadow-[0_0_16px_${g.glow}] ${className ?? ''}`}
      style={{ boxShadow: `0 0 0 1px hsl(var(--border)), 0 0 0 0 transparent` }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 0 1px hsl(var(--border)), 0 0 20px ${g.glow}` }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 0 1px hsl(var(--border))` }}
    >
      <div className={`rounded-xl ${g.bg} ${g.text} p-2.5 transition-all duration-300`}
        style={{ boxShadow: `0 0 0 0 transparent` }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${g.iconGlow}` }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 transparent` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted truncate">{title}</p>
        <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
          {isStringVal ? value : `${display}${suffix ?? ''}`}
        </p>
      </div>
    </div>
  )
}
