import type { DiaLeccionId } from "@/lib/lecciones"
import { ORDEN_DIAS_LECCION, diaLeccionIdDesdeIndice } from "@/lib/lecciones"
import { getFechasSemana } from "@/lib/semana"

export function fechaDeDiaLeccion(semana: number, dia: DiaLeccionId): string {
  const dias = getFechasSemana(semana)
  const target = ORDEN_DIAS_LECCION.indexOf(dia)
  const found = dias.find((d) => new Date(d.fecha + "T12:00:00").getDay() === target)
  return found?.fecha ?? dias[0]?.fecha ?? ""
}

export function diaLeccionDeFecha(semana: number, fecha: string): DiaLeccionId | null {
  const dias = getFechasSemana(semana)
  if (!dias.some((d) => d.fecha === fecha)) return null
  return diaLeccionIdDesdeIndice(new Date(fecha + "T12:00:00").getDay())
}

export function indiceDeDiaLeccion(dia: DiaLeccionId): number {
  return ORDEN_DIAS_LECCION.indexOf(dia)
}
