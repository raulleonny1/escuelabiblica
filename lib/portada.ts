import { getTrimestreActivo } from "@/lib/lecciones/trimestres"

export function getPortadaVersion(): string {
  return getTrimestreActivo().portadaVersion
}

export function getPortadaSrc(): string {
  const t = getTrimestreActivo()
  return `${t.portada}?v=${t.portadaVersion}`
}

/** @deprecated preferir getPortadaSrc() */
export const PORTADA_VERSION = getPortadaVersion()

/** @deprecated preferir getPortadaSrc() */
export const PORTADA_SRC = getPortadaSrc()
