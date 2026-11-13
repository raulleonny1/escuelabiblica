/** Trimestre activo según la fecha (amor: 15/11/2026 – 31/12/2026). */
export type { BloqueLeccion, DiaLeccionId, LeccionContenido } from "./types"
export { repasoSemana } from "./types"
export {
  TRIMESTRES,
  getTrimestreActivo,
  getTrimestreParaFecha,
  getTotalSemanas,
  getSemanasInicio,
  type TrimestreConfig,
  type TrimestreId,
} from "./trimestres"

export const ORDEN_DIAS_LECCION = [
  "dom",
  "lun",
  "mar",
  "mie",
  "jue",
  "vie",
  "sab",
] as const

export const ETIQUETAS_DIA_LECCION: Record<
  (typeof ORDEN_DIAS_LECCION)[number],
  string
> = {
  dom: "Domingo — Lección principal",
  lun: "Lunes — Tema de apoyo",
  mar: "Martes — Tema de apoyo",
  mie: "Miércoles — Tema de apoyo",
  jue: "Jueves — Tema de apoyo",
  vie: "Viernes — Repaso de la semana",
  sab: "Sábado — Desafío",
}

import type { LeccionContenido } from "./types"
import { getTotalSemanas, getTrimestreActivo } from "./trimestres"
import { getVersiculoDelDia as getVersiculoAmor } from "@/lib/versiculosDia.amor"

/** Número de lecciones del trimestre vigente */
export function getTotalLecciones(): number {
  return getTotalSemanas()
}

/** @deprecated Preferir getTotalLecciones() */
export const TOTAL_LECCIONES = 8

/** Tema del trimestre vigente hoy */
export function getTrimestreTema(): string {
  return getTrimestreActivo().tema
}

/** @deprecated usar getTrimestreTema() — se mantiene para imports existentes */
export const TRIMESTRE_TEMA = getTrimestreTema()

export function getLeccionesActivas(): LeccionContenido[] {
  return getTrimestreActivo().lecciones
}

export function getLeccionPorSemana(semana: number): LeccionContenido | null {
  const max = getTotalLecciones()
  const n = Math.min(Math.max(Math.floor(semana), 1), max)
  return getLeccionesActivas().find((l) => l.numero === n) ?? null
}

export function diaLeccionIdDesdeIndice(diaSemana: number) {
  const map = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const
  return map[diaSemana] ?? "dom"
}

export function diaLeccionIdDesdeFecha(fecha: string) {
  const d = new Date(fecha + "T12:00:00")
  return diaLeccionIdDesdeIndice(d.getDay())
}

export function getBloquesDia(
  leccion: LeccionContenido,
  dia: (typeof ORDEN_DIAS_LECCION)[number]
) {
  const bloques = leccion.dias[dia] ?? []
  const yaTieneClave = bloques.some((b) => /^texto\s*clave/i.test(b.titulo))
  if (yaTieneClave) return bloques

  const v = getVersiculoAmor(leccion.numero, dia)
  if (!v) return bloques

  return [
    {
      titulo: "Texto clave",
      texto: `«${v.texto}» — ${v.cita}`,
    },
    ...bloques,
  ]
}
