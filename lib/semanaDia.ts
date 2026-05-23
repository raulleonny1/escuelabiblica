import type { DiaLeccionId } from "@/lib/lecciones"
import { ORDEN_DIAS_LECCION, diaLeccionIdDesdeIndice } from "@/lib/lecciones"
import { getFechasSemana } from "@/lib/semana"

export function fechaDeDiaLeccion(semana: number, dia: DiaLeccionId): string {
  const dias = getFechasSemana(semana)
  const i = ORDEN_DIAS_LECCION.indexOf(dia)
  return dias[i]?.fecha ?? dias[0]?.fecha ?? ""
}

export function diaLeccionDeFecha(semana: number, fecha: string): DiaLeccionId | null {
  const dias = getFechasSemana(semana)
  const i = dias.findIndex((d) => d.fecha === fecha)
  if (i < 0) return null
  return diaLeccionIdDesdeIndice(i)
}

export function indiceDeDiaLeccion(dia: DiaLeccionId): number {
  return ORDEN_DIAS_LECCION.indexOf(dia)
}
