import { diaLeccionIdDesdeIndice, type DiaLeccionId } from "@/lib/lecciones"
import {
  fechaEnSemana,
  fechaLocalHoy,
  getFechaDestacadaEnSemana,
  getSemanaActual,
  TOTAL_SEMANAS,
  TRIMESTRE_INICIO,
} from "@/lib/semana"
import { diaLeccionDeFecha } from "@/lib/semanaDia"

export type DiaEstudio = {
  semana: number
  fecha: string
  diaLeccion: DiaLeccionId
}

/** Semana del trimestre (1–13) a la que pertenece una fecha YYYY-MM-DD */
export function getSemanaDeFecha(fecha: string): number | null {
  const inicio = new Date(TRIMESTRE_INICIO + "T12:00:00")
  const f = new Date(fecha + "T12:00:00")
  if (Number.isNaN(f.getTime())) return null

  const diffDias = Math.floor((f.getTime() - inicio.getTime()) / (24 * 60 * 60 * 1000))
  if (diffDias < 0) return null

  const semana = Math.floor(diffDias / 7) + 1
  if (semana < 1 || semana > TOTAL_SEMANAS) return null
  if (!fechaEnSemana(fecha, semana)) return null
  return semana
}

/** Día de lección a partir de fecha; si no está en la semana indicada, null */
export function diaLeccionDesdeFecha(semana: number, fecha: string): DiaLeccionId | null {
  return diaLeccionDeFecha(semana, fecha)
}

/**
 * Una sola fuente de verdad: fecha + semana + día de lección siempre alineados.
 */
export function resolverDiaEstudio(
  fechaEntrada: string,
  semanaPreferida?: number
): DiaEstudio {
  let semana = semanaPreferida ?? getSemanaDeFecha(fechaEntrada) ?? getSemanaActual()

  let fecha = fechaEntrada
  if (!fechaEnSemana(fecha, semana)) {
    fecha = getFechaDestacadaEnSemana(semana)
  }

  const dia =
    diaLeccionDeFecha(semana, fecha) ??
    diaLeccionIdDesdeIndice(new Date(fecha + "T12:00:00").getDay())

  return { semana, fecha, diaLeccion: dia }
}

/** Al abrir la app: hoy si está en el trimestre; si no, inicio del trimestre */
export function diaEstudioInicial(): DiaEstudio {
  const hoy = fechaLocalHoy()
  const semanaHoy = getSemanaDeFecha(hoy)
  if (semanaHoy) {
    return resolverDiaEstudio(hoy, semanaHoy)
  }
  return resolverDiaEstudio(getFechaDestacadaEnSemana(1), 1)
}

export function mismoDiaEstudio(a: DiaEstudio, b: DiaEstudio) {
  return a.semana === b.semana && a.fecha === b.fecha && a.diaLeccion === b.diaLeccion
}
