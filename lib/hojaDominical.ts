import { getFechasSemana } from "@/lib/semana"

/** Nombre de archivo: domingo de la semana → `24-05-2026.pdf` */
export function getHojaDominicalUrl(semana: number): string {
  const domingo = getFechasSemana(semana)[0]?.fecha
  if (!domingo) return "/pdf/24-05-2026.pdf"
  const [y, m, d] = domingo.split("-")
  return `/pdf/${d}-${m}-${y}.pdf`
}
