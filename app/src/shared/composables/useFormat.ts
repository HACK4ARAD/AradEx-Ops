/** Formatare în română: date, bani, distanțe. Folosit de toate view-urile; nu apela toLocaleString direct. */
const TZ = 'Europe/Bucharest'

const dayFmt = new Intl.DateTimeFormat('ro-RO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ })
const timeFmt = new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
const longFmt = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

export function useFormat() {
  /** "Sâm., 7 nov. · 11:00" */
  function dateTime(iso: string, withTime = true): string {
    const d = new Date(iso)
    const day = cap(dayFmt.format(d))
    return withTime ? `${day} · ${timeFmt.format(d)}` : day
  }
  /** "11:00–13:00" */
  function timeRange(startIso: string, endIso?: string): string {
    const a = timeFmt.format(new Date(startIso))
    return endIso ? `${a}–${timeFmt.format(new Date(endIso))}` : a
  }
  /** "Sâmbătă, 7 noiembrie" */
  function longDate(iso: string): string {
    return cap(longFmt.format(new Date(iso)))
  }
  /** 40 → "40 lei", 0 → "Gratuit" */
  function money(value?: number | null): string {
    if (value === undefined || value === null) return ''
    if (value === 0) return 'Gratuit'
    return `${new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 }).format(value)} lei`
  }
  /** 0.44 → "0,4 km"; 0.08 → "80 m" */
  function km(value?: number | null): string {
    if (value === undefined || value === null) return ''
    if (value < 0.1) return `${Math.round(value * 1000)} m`
    return `${value.toFixed(1).replace('.', ',')} km`
  }
  /** 95 → "1 h 35 min"; 30 → "30 min" */
  function minutes(total: number): string {
    const h = Math.floor(total / 60), m = total % 60
    if (h === 0) return `${m} min`
    return m === 0 ? `${h} h` : `${h} h ${m} min`
  }
  /** 270 → "270 de puncte", 12 → "12 puncte", 1 → "1 punct" */
  function points(n: number): string {
    if (n === 1) return '1 punct'
    const abs = Math.abs(n)
    return abs >= 20 ? `${n} de puncte` : `${n} puncte`
  }
  /** Ziua de azi în Europe/Bucharest ca "YYYY-MM-DD" */
  function todayIso(): string {
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    return p
  }

  return { dateTime, timeRange, longDate, money, km, minutes, points, todayIso }
}
