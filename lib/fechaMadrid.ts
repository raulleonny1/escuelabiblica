/** Calendario civil de la app: siempre Europe/Madrid (no UTC del servidor). */

export const TZ_APP = "Europe/Madrid"

/** YYYY-MM-DD en Europe/Madrid para un instante (por defecto ahora). */
export function fechaHoyMadrid(d = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ_APP,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d)
  } catch {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
}

/**
 * Día de la semana 0=dom … 6=sáb según el calendario de Madrid
 * (evita que getDay() del reloj UTC adelantine el domingo a las 23:00 CET).
 */
export function indiceDiaSemanaMadrid(d = new Date()): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ_APP,
    weekday: "short",
  }).format(d)
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  return map[wd] ?? 0
}
