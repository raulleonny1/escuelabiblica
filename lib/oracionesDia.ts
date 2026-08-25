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

const TITULOS_GENERICOS = [
  /texto\s*clave/i,
  /para\s+reflexionar/i,
  /^introducci[oó]n$/i,
  /^desarrollo$/i,
  /^historia b[ií]blica/i,
  /^aplicaci[oó]n espiritual$/i,
]

const PREFIJOS_TECNICOS = [
  /^aplicaci[oó]n:\s*/i,
  /^pr[aá]ctica:\s*/i,
  /^pr[aá]ctica\s+/i,
  /^ejercicio:\s*/i,
  /^ejercicio\s+/i,
  /^reflexi[oó]n:\s*/i,
  /^compromiso:\s*/i,
  /^compromiso\s+/i,
  /^desaf[ií]o:\s*/i,
  /^desaf[ií]o\s+/i,
  /^paso\s+\d+:\s*/i,
  /^vers[ií]culo de cierre/i,
  /^promesa/i,
  /^registro/i,
  /^repaso/i,
  /^rutina/i,
]

const REEMPLAZOS_ORACION: Array<[RegExp, string]> = [
  [/informes de divisi[oó]n en la casa de clo[eé]/i, "la unidad de tu iglesia"],
  [/(yo soy de pablo|yo de apolos|otro bando|desarma tu bando)/i, "la unidad en Cristo"],
  [/(est[aá] dividido cristo|fue pablo crucificado)/i, "Cristo como nuestro único centro"],
  [/(sabidur[ií]a mundana|iron[ií]a pastoral|espect[aá]culo)/i, "la humildad que viene de ti"],
  [/(superap[oó]stoles|disfraz de ap[oó]stoles|otro jes[uú]s|otro evangelio)/i, "la fidelidad al verdadero evangelio"],
  [/(comer y beber indignamente|discernir el cuerpo|cena del se[nñ]or)/i, "reverencia ante tu presencia"],
  [/(no te necesito|miembro fuerte|sufrir y gozarse juntos)/i, "el cuidado mutuo en tu cuerpo"],
  [/(fe vana|conmiseraci[oó]n|testigos falsos)/i, "la esperanza firme en la resurrección"],
  [/(ministerio|palabra) de la reconciliaci[oó]n/i, "la reconciliación que viene de Cristo"],
  [/(lectio divina|intelectualismo espiritual|diaconado|intercessora)/i, ""],
]

function limpiarTemaBase(titulo: string) {
  let tema = titulo.trim()
  for (const patron of PREFIJOS_TECNICOS) {
    tema = tema.replace(patron, "")
  }
  return tema.trim()
}

function temaSuenaExtrano(tema: string) {
  return (
    tema.length > 52 ||
    /[¿?«»"]/.test(tema) ||
    /\b(Clo[eé]|Pablo|Apolos|superap[oó]stoles|diaconado|intercessora|intelectualismo)\b/i.test(
      tema
    )
  )
}

function resolverTemaOracion(titulo: string | undefined, leccionTitulo: string) {
  const base = limpiarTemaBase(titulo ?? "")
  if (!base) return leccionTitulo

  for (const [patron, reemplazo] of REEMPLAZOS_ORACION) {
    if (patron.test(base)) {
      return reemplazo || leccionTitulo
    }
  }

  if (temaSuenaExtrano(base)) return leccionTitulo
  return base
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
    resolverTemaOracion(
      bloques.find((b) => !TITULOS_GENERICOS.some((patron) => patron.test(b.titulo)))?.titulo ??
        bloques[0]?.titulo,
      leccion.titulo
    )

  const pedido = PEDIDO_POR_DIA[dia]

  const texto = [
    `Señor Jesús, por tu Espíritu Santo, obra en nosotros en ${temaDia}.`,
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
