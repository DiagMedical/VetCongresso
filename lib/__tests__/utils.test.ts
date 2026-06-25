import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatTime } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b')
  })
})

describe('formatDate', () => {
  it('formats a date string in pt-BR', () => {
    const result = formatDate('2026-07-01T09:00:00-03:00')
    expect(result).toContain('jul')
    expect(result).toContain('2026')
  })
})

describe('formatTime', () => {
  it('formats time from ISO string', () => {
    const result = formatTime('2026-07-01T09:00:00-03:00')
    expect(result).toBe('09:00')
  })
})
