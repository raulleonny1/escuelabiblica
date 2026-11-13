import type { DiaLeccionId } from "@/lib/lecciones"
import { getBloquesDia, getLeccionPorSemana } from "@/lib/lecciones"
import { getVersiculoDelDia as getVersiculoAmor } from "@/lib/versiculosDia.amor"

export type VersiculoDia = {
  cita: string
  texto: string
}

/** Extrae «texto» — cita del bloque Texto clave u otro bloque con ese formato. */
function parsePasajePrincipal(texto: string): VersiculoDia | null {
  const m = texto.match(/«([^»]+)»\s*[—–-]\s*([^\n]+)/)
  if (!m) return null
  const cuerpo = m[1]!.trim()
  const cita = m[2]!.trim().replace(/\.$/, "")
  if (!cuerpo || !cita) return null
  return { texto: cuerpo, cita }
}

/**
 * Pasaje principal del día: prioriza el «Texto clave» / primer pasaje citado
 * en la lección de ese día; si no, usa la tabla del trimestre.
 */
export function getVersiculoDelDia(
  semana: number,
  dia: DiaLeccionId
): VersiculoDia | null {
  const leccion = getLeccionPorSemana(semana)
  if (leccion) {
    const bloques = getBloquesDia(leccion, dia)
    const clave = bloques.find((b) => /texto\s*clave/i.test(b.titulo))
    if (clave) {
      const desdeClave = parsePasajePrincipal(clave.texto)
      if (desdeClave) return desdeClave
    }
    for (const b of bloques) {
      const parsed = parsePasajePrincipal(b.texto)
      if (parsed) return parsed
    }
  }

  return getVersiculoAmor(semana, dia)
}
