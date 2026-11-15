import { fechaHoyMadrid } from "@/lib/fechaMadrid"
import {
  getSemanasInicio,
  getTotalSemanas,
  getTrimestreActivo,
  getTrimestreParaFecha,
  type TrimestreConfig,
} from "@/lib/lecciones/trimestres"

/** @deprecated Preferir getTotalSemanas() — el trimestre amor tiene 8 semanas. */
export const TOTAL_SEMANAS = 8

export { getTotalSemanas }

/** Domingo de inicio del trimestre activo hoy */
export function getTrimestreInicio(): string {
  return getTrimestreActivo().inicio
}

/** @deprecated preferir getTrimestreInicio() */
export const TRIMESTRE_INICIO = getTrimestreInicio()

/** Hoy YYYY-MM-DD en Europe/Madrid (no UTC del servidor Vercel). */
export function fechaLocalHoy(): string {
  return fechaHoyMadrid()
}

function diaAnterior(fechaIso: string): string {
  const d = new Date(fechaIso + "T12:00:00")
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function rangoSemana(
  tri: TrimestreConfig,
  semana: number
): { inicio: string; fin: string } {
  const inicios = getSemanasInicio(tri)
  const idx = Math.min(Math.max(semana, 1), inicios.length) - 1
  const inicio = inicios[idx] ?? tri.inicio
  const siguiente = inicios[idx + 1]
  const fin = siguiente ? diaAnterior(siguiente) : tri.fin
  return { inicio, fin: fin < inicio ? inicio : fin }
}

/** Semana de lección según la fecha de hoy dentro del trimestre activo */
export function getSemanaActual(totalSemanas = getTotalSemanas()): number {
  const hoy = fechaLocalHoy()
  const tri = getTrimestreParaFecha(hoy)
  const inicios = getSemanasInicio(tri)
  if (hoy < tri.inicio) return 1
  if (hoy > tri.fin) return Math.min(inicios.length, totalSemanas)

  let semana = 1
  for (let i = 0; i < inicios.length; i++) {
    if (hoy >= inicios[i]!) semana = i + 1
  }
  return Math.min(Math.max(semana, 1), totalSemanas)
}

/** Hoy si cae en la semana; si no, el primer día de esa semana */
export function getFechaDestacadaEnSemana(semana: number): string {
  const hoy = fechaLocalHoy()
  const dias = getFechasSemana(semana)
  if (dias.some((d) => d.fecha === hoy)) return hoy
  return dias[0]?.fecha ?? hoy
}

export type DiaSemana = {
  fecha: string
  diaCorto: string
  diaNum: number
  mesCorto: string
}

export function getFechasSemana(semana: number, fechaReferencia?: string): DiaSemana[] {
  const tri = fechaReferencia
    ? getTrimestreParaFecha(fechaReferencia)
    : getTrimestreActivo()
  const { inicio: inicioStr, fin: finStr } = rangoSemana(tri, semana)
  const inicio = new Date(inicioStr + "T12:00:00")
  const fin = new Date(finStr + "T12:00:00")

  const nombres = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

  const dias: DiaSemana[] = []
  const cursor = new Date(inicio)
  while (cursor <= fin) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, "0")
    const day = String(cursor.getDate()).padStart(2, "0")
    const fecha = `${y}-${m}-${day}`
    dias.push({
      fecha,
      diaCorto: nombres[cursor.getDay()]!,
      diaNum: cursor.getDate(),
      mesCorto: meses[cursor.getMonth()]!,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return dias
}

export function fechaEnSemana(fecha: string, semana: number): boolean {
  return getFechasSemana(semana, fecha).some((d) => d.fecha === fecha)
}

/** Día de la semana lectiva (0=dom … 6=sáb) según la fecha */
export function indiceDiaEnSemana(fecha: string): number {
  return new Date(fecha + "T12:00:00").getDay()
}
