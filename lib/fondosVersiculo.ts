import type { DiaLeccionId } from "@/lib/lecciones"
import { PORTADA_VERSION } from "@/lib/portada"

/** Solo archivos que existen en `public/fondos/` */
export const FONDOS_VERSICULO = [
  "12019-plouzane-1758197_640.jpg",
  "22419767-cross-7219450_640.jpg",
  "bessi-tree-838666_640.jpg",
  "darkmoon_art-road-3478977_640.jpg",
  "dimhou-sea-3652697_640.jpg",
  "fondo.jpg",
  "ichristian-khmer-bible-7357136_640.jpg",
  "karigamb08-cruz-1655381_640.jpg",
  "leoooooooooo-jesus-light-2141937_640.jpg",
  "photo-graphe-sky-3294543_640.jpg",
  "toniad-bible-888305_640.jpg",
] as const

const INDICE_DIA: Record<DiaLeccionId, number> = {
  dom: 0,
  lun: 1,
  mar: 2,
  mie: 3,
  jue: 4,
  vie: 5,
  sab: 6,
}

/**
 * Un fondo distinto por día de la lección (dom–sáb), rotando por las 11 imágenes.
 * Misma semana + mismo día = misma foto; al cambiar de pestaña cambia el fondo.
 */
export function getFondoVersiculoUrl(semana: number, dia: DiaLeccionId): string {
  const slot = (Math.max(1, semana) - 1) * 7 + INDICE_DIA[dia]
  const indice = slot % FONDOS_VERSICULO.length
  const archivo = FONDOS_VERSICULO[indice]!
  return `/fondos/${archivo}?v=${PORTADA_VERSION}`
}
