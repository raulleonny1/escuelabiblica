import type { DiaLeccionId } from "@/lib/lecciones"

/** Paleta legible (texto blanco) — un color distinto por slot semana×día */
const COLORES_FONDO = [
  "#0f5c5c", // teal profundo
  "#1a4d7c", // azul
  "#5c3d1a", // marrón cálido
  "#3d4a1a", // oliva
  "#4a1a3d", // mora
  "#1a3d4a", // petróleo
  "#5c2a1a", // terracota
  "#2a3d5c", // índigo
  "#1a5c3d", // verde bosque
  "#4a2a5c", // púrpura
  "#5c4a1a", // mostaza oscuro
  "#1a2a5c", // azul noche
  "#3d1a2a", // vino
  "#2a5c5c", // verde azulado
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

/** Color sólido de fondo del versículo del día (cambia con semana + día). */
export function getColorFondoVersiculo(semana: number, dia: DiaLeccionId): string {
  const slot = (Math.max(1, semana) - 1) * 7 + INDICE_DIA[dia]
  return COLORES_FONDO[slot % COLORES_FONDO.length]!
}
