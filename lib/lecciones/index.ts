/** Trimestre activo según la fecha (fe hasta 22/08; corintios desde 23/08). */
export const TOTAL_LECCIONES = 13

export type { BloqueLeccion, DiaLeccionId, LeccionContenido } from "./types"
export { repasoSemana } from "./types"
export {
  TRIMESTRES,
  getTrimestreActivo,
  getTrimestreParaFecha,
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
import { getTrimestreActivo } from "./trimestres"

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
  const n = Math.min(Math.max(Math.floor(semana), 1), TOTAL_LECCIONES)
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
  return leccion.dias[dia] ?? []
}
