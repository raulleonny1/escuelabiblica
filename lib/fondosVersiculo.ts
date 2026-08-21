import type { DiaLeccionId } from "@/lib/lecciones"
import { getTrimestreActivo } from "@/lib/lecciones/trimestres"
import { getPortadaVersion } from "@/lib/portada"

/** Fondos generales (sin la portada de Corintios) */
const FONDOS_BASE = [
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
 * Un fondo distinto por día de la lección (dom–sáb).
 * En el trimestre Corintios incluye la portada nueva en la rotación.
 */
export function getFondoVersiculoUrl(semana: number, dia: DiaLeccionId): string {
  const fondos =
    getTrimestreActivo().id === "corintios"
      ? (["corintios.png", ...FONDOS_BASE] as const)
      : FONDOS_BASE
  const slot = (Math.max(1, semana) - 1) * 7 + INDICE_DIA[dia]
  const indice = slot % fondos.length
  const archivo = fondos[indice]!
  return `/fondos/${archivo}?v=${getPortadaVersion()}`
}
