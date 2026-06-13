import { TOTAL_LECCIONES } from "@/lib/lecciones"

export function semanaHojaDominicalValida(semana: number): number {
  return Math.min(Math.max(Math.floor(semana), 1), TOTAL_LECCIONES)
}
