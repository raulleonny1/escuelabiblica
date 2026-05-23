/** Domingo de inicio: semana 1 = Lección 1 (domingo a sábado) */
export const TRIMESTRE_TEMA = "fe"
export const TOTAL_LECCIONES = 13

export type { BloqueLeccion, DiaLeccionId, LeccionContenido } from "./types"
export { repasoSemana } from "./types"

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
import { semana01 } from "./semana01"
import { semana02 } from "./semana02"
import { semana03 } from "./semana03"
import { semana04 } from "./semana04"
import { semana05 } from "./semana05"
import { semana06 } from "./semana06"
import { semana07 } from "./semana07"
import { semana08 } from "./semana08"
import { semana09 } from "./semana09"
import { semana10 } from "./semana10"
import { semana11 } from "./semana11"
import { semana12 } from "./semana12"
import { semana13 } from "./semana13"

export const LECCIONES: LeccionContenido[] = [
  semana01,
  semana02,
  semana03,
  semana04,
  semana05,
  semana06,
  semana07,
  semana08,
  semana09,
  semana10,
  semana11,
  semana12,
  semana13,
]

export function getLeccionPorSemana(semana: number): LeccionContenido | null {
  const n = Math.min(Math.max(Math.floor(semana), 1), TOTAL_LECCIONES)
  return LECCIONES.find((l) => l.numero === n) ?? null
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
