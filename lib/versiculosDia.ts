import type { DiaLeccionId } from "@/lib/lecciones"
import { getTrimestreActivo } from "@/lib/lecciones/trimestres"
import { getVersiculoDelDia as getVersiculoFe } from "@/lib/versiculosDia.fe"
import { getVersiculoDelDia as getVersiculoCorintios } from "@/lib/versiculosDia.corintios"

export type VersiculoDia = {
  cita: string
  texto: string
}

export function getVersiculoDelDia(
  semana: number,
  dia: DiaLeccionId
): VersiculoDia | null {
  const id = getTrimestreActivo().id
  if (id === "corintios") return getVersiculoDelDiaCorintios(semana, dia)
  return getVersiculoFe(semana, dia)
}

function getVersiculoDelDiaCorintios(semana: number, dia: DiaLeccionId) {
  return getVersiculoCorintios(semana, dia)
}
