import type { LeccionContenido } from "./types"

export type TrimestreId = "fe" | "corintios"

export type TrimestreConfig = {
  id: TrimestreId
  tema: string
  /** Domingo de la semana 1 (YYYY-MM-DD) */
  inicio: string
  /** Sábado de la semana 13 (YYYY-MM-DD) */
  fin: string
  portada: string
  portadaVersion: string
  lecciones: LeccionContenido[]
}

import { semana01 as fe01 } from "./fe/semana01"
import { semana02 as fe02 } from "./fe/semana02"
import { semana03 as fe03 } from "./fe/semana03"
import { semana04 as fe04 } from "./fe/semana04"
import { semana05 as fe05 } from "./fe/semana05"
import { semana06 as fe06 } from "./fe/semana06"
import { semana07 as fe07 } from "./fe/semana07"
import { semana08 as fe08 } from "./fe/semana08"
import { semana09 as fe09 } from "./fe/semana09"
import { semana10 as fe10 } from "./fe/semana10"
import { semana11 as fe11 } from "./fe/semana11"
import { semana12 as fe12 } from "./fe/semana12"
import { semana13 as fe13 } from "./fe/semana13"

import { semana01 as co01 } from "./corintios/semana01"
import { semana02 as co02 } from "./corintios/semana02"
import { semana03 as co03 } from "./corintios/semana03"
import { semana04 as co04 } from "./corintios/semana04"
import { semana05 as co05 } from "./corintios/semana05"
import { semana06 as co06 } from "./corintios/semana06"
import { semana07 as co07 } from "./corintios/semana07"
import { semana08 as co08 } from "./corintios/semana08"
import { semana09 as co09 } from "./corintios/semana09"
import { semana10 as co10 } from "./corintios/semana10"
import { semana11 as co11 } from "./corintios/semana11"
import { semana12 as co12 } from "./corintios/semana12"
import { semana13 as co13 } from "./corintios/semana13"

export const TRIMESTRES: TrimestreConfig[] = [
  {
    id: "fe",
    tema: "fe",
    inicio: "2026-05-24",
    fin: "2026-08-22",
    portada: "/portada-fe.png",
    portadaVersion: "20260524",
    lecciones: [
      fe01, fe02, fe03, fe04, fe05, fe06, fe07,
      fe08, fe09, fe10, fe11, fe12, fe13,
    ],
  },
  {
    id: "corintios",
    tema: "corintios",
    inicio: "2026-08-23",
    fin: "2026-11-21",
    portada: "/portada.png",
    portadaVersion: "20260823b",
    lecciones: [
      co01, co02, co03, co04, co05, co06, co07,
      co08, co09, co10, co11, co12, co13,
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
  // Antes del primero → primer trimestre; después del último → último
  if (t < fechaNum(TRIMESTRES[0]!.inicio)) return TRIMESTRES[0]!
  return TRIMESTRES[TRIMESTRES.length - 1]!
}

export function getTrimestreActivo(): TrimestreConfig {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return getTrimestreParaFecha(`${y}-${m}-${day}`)
}
