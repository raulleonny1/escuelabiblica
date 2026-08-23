import type { DiaLeccionId } from "@/lib/lecciones"
import { getBloquesDia, getLeccionPorSemana } from "@/lib/lecciones"

export type OracionDia = {
  texto: string
  temaDia: string
  leccionTitulo: string
}

const PEDIDO_POR_DIA: Record<DiaLeccionId, string> = {
  dom: "Abre nuestro entendimiento y danos un corazón dispuesto a creer y obedecer.",
  lun: "Ayúdanos a aplicar con humildad esta verdad en nuestra vida cotidiana.",
  mar: "Examina nuestro corazón y corrígelo con tu Palabra y tu gracia.",
  mie: "Danos valentía para obedecer lo que nos muestras, sin demora.",
  jue: "Enséñanos a vivir esto en comunidad, con amor y paciencia unos con otros.",
  vie: "Afianza en nosotros lo aprendido y renueva nuestro deseo de seguirte.",
  sab: "Muéstranos un paso concreto de obediencia y danos fuerza para darlo.",
}

/**
 * Oración del día ligada al tema del día — sin introducción meta sobre el estudio.
 */
export function getOracionDelDia(
  semana: number,
  dia: DiaLeccionId
): OracionDia | null {
  const leccion = getLeccionPorSemana(semana)
  if (!leccion) return null

  const bloques = getBloquesDia(leccion, dia)
  const temaDia =
    bloques.find((b) => !/texto\s*clave|para reflexionar|introducción/i.test(b.titulo))
      ?.titulo ??
    bloques[0]?.titulo ??
    leccion.titulo

  const pedido = PEDIDO_POR_DIA[dia]

  const texto = [
    `Señor Jesús, por tu Espíritu Santo, obra en nosotros conforme a «${temaDia}».`,
    pedido,
    `Quita el orgullo, la distracción y toda resistencia a tu verdad.`,
    `Que tú seas el centro de nuestra mente, de nuestra iglesia y de nuestras decisiones.`,
    `Enséñanos a vivir el evangelio con amor, unidad y fidelidad.`,
    `En tu nombre, Amén.`,
  ].join(" ")

  return {
    texto,
    temaDia,
    leccionTitulo: leccion.titulo,
  }
}

export function textoParaCompartirOracion(
  oracion: OracionDia,
  semana: number
): string {
  return [
    "Oración del día — Escuela Bíblica",
    "",
    oracion.texto,
    "",
    `Semana ${semana}: ${oracion.leccionTitulo}`,
    `Tema: ${oracion.temaDia}`,
  ].join("\n")
}
