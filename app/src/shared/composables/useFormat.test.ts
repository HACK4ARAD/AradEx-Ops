import { describe, expect, it } from 'vitest'
import { useFormat } from './useFormat'

describe('useFormat', () => {
  const f = useFormat()

  it('formats money in RON', () => {
    expect(f.money(40)).toBe('40 lei')
    expect(f.money(0)).toBe('Gratuit')
    expect(f.money(undefined)).toBe('')
  })

  it('formats distances', () => {
    expect(f.km(0.44)).toBe('0,4 km')
    expect(f.km(0.08)).toBe('80 m')
    expect(f.km(24)).toBe('24,0 km')
  })

  it('formats minutes', () => {
    expect(f.minutes(30)).toBe('30 min')
    expect(f.minutes(60)).toBe('1 h')
    expect(f.minutes(95)).toBe('1 h 35 min')
  })

  it('formats points with Romanian plural', () => {
    expect(f.points(1)).toBe('1 punct')
    expect(f.points(12)).toBe('12 puncte')
    expect(f.points(270)).toBe('270 de puncte')
  })

  it('formats date and time in Europe/Bucharest', () => {
    const s = f.dateTime('2026-11-07T11:00:00+02:00')
    expect(s).toContain('7 nov')
    expect(s).toContain('11:00')
    expect(f.timeRange('2026-11-07T10:00:00+02:00', '2026-11-07T13:00:00+02:00')).toBe('10:00–13:00')
  })
})
