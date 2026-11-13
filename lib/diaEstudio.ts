import { diaLeccionIdDesdeIndice, type DiaLeccionId } from "@/lib/lecciones"
import {
  getSemanasInicio,
  getTotalSemanas,
  getTrimestreParaFecha,
} from "@/lib/lecciones/trimestres"
import {
  fechaEnSemana,
  fechaLocalHoy,
  getFechaDestacadaEnSemana,
  getSemanaActual,
} from "@/lib/semana"
import { diaLeccionDeFecha } from "@/lib/semanaDia"

export type DiaEstudio = {
  semana: number
  fecha: string
  diaLeccion: DiaLeccionId
}

/** Semana del trimestre a la que pertenece una fecha YYYY-MM-DD */
export function getSemanaDeFecha(fecha: string): number | null {
  const tri = getTrimestreParaFecha(fecha)
  if (fecha < tri.inicio || fecha > tri.fin) return null

  const inicios = getSemanasInicio(tri)
  const total = getTotalSemanas(fecha)
  let semana = 1
  for (let i = 0; i < inicios.length; i++) {
    if (fecha >= inicios[i]!) semana = i + 1
  }
  if (semana < 1 || semana > total) return null
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

/** Al abrir la app: hoy dentro del trimestre activo */
export function diaEstudioInicial(): DiaEstudio {
  const hoy = fechaLocalHoy()
  const semanaHoy = getSemanaDeFecha(hoy)
  if (semanaHoy) {
    return resolverDiaEstudio(hoy, semanaHoy)
  }
  const tri = getTrimestreParaFecha(hoy)
  return resolverDiaEstudio(tri.inicio, 1)
}

export function mismoDiaEstudio(a: DiaEstudio, b: DiaEstudio) {
  return a.semana === b.semana && a.fecha === b.fecha && a.diaLeccion === b.diaLeccion
}
