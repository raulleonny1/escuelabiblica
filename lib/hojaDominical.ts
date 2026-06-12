import { TOTAL_LECCIONES } from "@/lib/lecciones"

/** PDF de respaldo si no hay uno subido para la semana. */
export const HOJA_DOMINICAL_PDF_PATH = "/pdf/Hoja-dominical.pdf"

export function semanaHojaDominicalValida(semana: number): number {
  return Math.min(Math.max(Math.floor(semana), 1), TOTAL_LECCIONES)
}
