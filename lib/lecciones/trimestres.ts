import { fechaHoyMadrid } from "@/lib/fechaMadrid"
import type { LeccionContenido } from "./types"

export type TrimestreId = "amor"

export type TrimestreConfig = {
  id: TrimestreId
  tema: string
  /** Domingo de la semana 1 (YYYY-MM-DD) */
  inicio: string
  /** Último día del trimestre (YYYY-MM-DD) */
  fin: string
  /**
   * Domingo (o inicio) real de cada semana.
   * Si falta, se asume un domingo cada 7 días desde `inicio`.
   */
  semanasInicio?: string[]
  portada: string
  portadaVersion: string
  lecciones: LeccionContenido[]
}

import { semana01 } from "./amor/semana01"
import { semana02 } from "./amor/semana02"
import { semana03 } from "./amor/semana03"
import { semana04 } from "./amor/semana04"
import { semana05 } from "./amor/semana05"
import { semana06 } from "./amor/semana06"
import { semana07 } from "./amor/semana07"
import { semana08 } from "./amor/semana08"

export const TRIMESTRES: TrimestreConfig[] = [
  {
    id: "amor",
    tema: "amor",
    inicio: "2026-11-15",
    fin: "2026-12-31",
    semanasInicio: [
      "2026-11-15",
      "2026-11-22",
      "2026-11-29",
      "2026-12-06",
      "2026-12-13",
      "2026-12-20",
      "2026-12-27",
      "2026-12-31",
    ],
    portada: "/portada.png",
    portadaVersion: "20261115",
    lecciones: [
      semana01,
      semana02,
      semana03,
      semana04,
      semana05,
      semana06,
      semana07,
      semana08,
    ],
  },
]

function fechaNum(fecha: string): number {
  return new Date(fecha + "T12:00:00").getTime()
}

/** Trimestre vigente para una fecha YYYY-MM-DD */
export function getTrimestreParaFecha(fecha: string): TrimestreConfig {
  const t = fechaNum(fecha)
  for (const tri of TRIMESTRES) {
    if (t >= fechaNum(tri.inicio) && t <= fechaNum(tri.fin)) return tri
  }
  if (t < fechaNum(TRIMESTRES[0]!.inicio)) return TRIMESTRES[0]!
  return TRIMESTRES[TRIMESTRES.length - 1]!
}

export function getTrimestreActivo(): TrimestreConfig {
  return getTrimestreParaFecha(fechaHoyMadrid())
}

export function getSemanasInicio(tri: TrimestreConfig): string[] {
  if (tri.semanasInicio && tri.semanasInicio.length > 0) {
    return tri.semanasInicio
  }
  const total = tri.lecciones.length
  const inicio = new Date(tri.inicio + "T12:00:00")
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i * 7)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  })
}

export function getTotalSemanas(fechaReferencia?: string): number {
  const tri = fechaReferencia
    ? getTrimestreParaFecha(fechaReferencia)
    : getTrimestreActivo()
  return tri.lecciones.length
}
