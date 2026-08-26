import type { DiaLeccionId } from "@/lib/lecciones"
import { ETIQUETAS_DIA_LECCION, getLeccionPorSemana } from "@/lib/lecciones"
import { getPortadaSrc } from "@/lib/portada"

/**
 * Catálogo opcional de audios grabados (MP3/URL).
 * Si no hay entrada publicada con urlAudio, la app usa la voz/TTS del estudio del día.
 * Puedes añadir entradas aquí o, más adelante, cargarlas desde Firestore/Storage.
 */
export type AudioLeccionRegistro = {
  id: string
  semana: number
  dia: DiaLeccionId
  titulo: string
  descripcion?: string
  urlAudio: string | null
  duracionSeg?: number
  imagen?: string
  fecha?: string
  publicado: boolean
}

/** Añade aquí audios grabados cuando existan (ej. /audio/semana-01-dom.mp3). */
export const CATALOGO_AUDIOS_LECCION: AudioLeccionRegistro[] = []

export type AudioLeccionSesion = {
  id: string
  semana: number
  dia: DiaLeccionId
  numeroLeccion: number
  titulo: string
  descripcion: string
  imagen: string
  fecha?: string
  /** 'tts' = lectura del texto del día; 'archivo' = MP3/URL publicada */
  modo: "tts" | "archivo"
  urlAudio: string | null
  duracionSeg?: number
  disponible: boolean
  mensajeNoDisponible?: string
}

export function idAudioLeccion(semana: number, dia: DiaLeccionId): string {
  return `s${semana}-${dia}`
}

export function resolverAudioLeccion(
  semana: number,
  dia: DiaLeccionId
): AudioLeccionSesion {
  const leccion = getLeccionPorSemana(semana)
  const numero = leccion?.numero ?? semana
  const tituloLeccion = leccion?.titulo ?? `Lección ${semana}`
  const diaLabel = ETIQUETAS_DIA_LECCION[dia].split(" —")[0] ?? dia
  const id = idAudioLeccion(semana, dia)
  const reg = CATALOGO_AUDIOS_LECCION.find(
    (a) => a.publicado && a.semana === semana && a.dia === dia && a.urlAudio
  )

  if (reg?.urlAudio) {
    return {
      id: reg.id || id,
      semana,
      dia,
      numeroLeccion: numero,
      titulo: reg.titulo || tituloLeccion,
      descripcion: reg.descripcion || `${diaLabel} · Lección ${numero}`,
      imagen: reg.imagen || getPortadaSrc(),
      fecha: reg.fecha,
      modo: "archivo",
      urlAudio: reg.urlAudio,
      duracionSeg: reg.duracionSeg,
      disponible: true,
    }
  }

  // Sin archivo grabado: disponible vía TTS si hay lección
  const disponible = Boolean(leccion)
  return {
    id,
    semana,
    dia,
    numeroLeccion: numero,
    titulo: tituloLeccion,
    descripcion: `${diaLabel} · Lección ${numero}`,
    imagen: getPortadaSrc(),
    modo: "tts",
    urlAudio: null,
    disponible,
    mensajeNoDisponible: disponible
      ? undefined
      : "El audio de esta lección estará disponible próximamente.",
  }
}
