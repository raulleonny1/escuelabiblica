import type { BloqueLeccion, DiaLeccionId } from "@/lib/lecciones"
import { ETIQUETAS_DIA_LECCION } from "@/lib/lecciones"

/** Formato elegante del texto completo del día (sin audio). */
export function formatearLeccionDiaParaCompartir(opts: {
  semana: number
  dia: DiaLeccionId
  numeroLeccion: number
  tituloLeccion: string
  bloques: BloqueLeccion[]
}): string {
  const { semana, dia, numeroLeccion, tituloLeccion, bloques } = opts
  const diaLabel = ETIQUETAS_DIA_LECCION[dia]

  const lineas: string[] = [
    "✦ Estudio diario",
    "━━━━━━━━━━━━━━━━━━━━",
    `Lección ${numeroLeccion} — ${tituloLeccion}`,
    `Semana ${semana} · ${diaLabel}`,
    "━━━━━━━━━━━━━━━━━━━━",
    "",
  ]

  for (const bloque of bloques) {
    const esClave = /^texto\s*clave/i.test(bloque.titulo)
    if (esClave) {
      lineas.push(`📖 ${bloque.titulo}`)
      lineas.push(bloque.texto.trim())
    } else {
      lineas.push(`── ${bloque.titulo} ──`)
      lineas.push(bloque.texto.trim())
    }
    lineas.push("")
  }

  lineas.push("━━━━━━━━━━━━━━━━━━━━")
  lineas.push("Comparte la Palabra · Estudio diario")

  return lineas.join("\n").trim()
}

/** Resumen corto para X (límite de caracteres). */
export function resumenLeccionParaX(opts: {
  numeroLeccion: number
  tituloLeccion: string
  dia: DiaLeccionId
  bloques: BloqueLeccion[]
}): string {
  const clave = opts.bloques.find((b) => /^texto\s*clave/i.test(b.titulo))
  const diaCorto = ETIQUETAS_DIA_LECCION[opts.dia].split(" —")[0] ?? ""
  const base = `✦ Estudio diario\nL${opts.numeroLeccion}: ${opts.tituloLeccion}\n${diaCorto}`
  const extra = clave ? `\n\n${clave.texto.trim()}` : ""
  const full = `${base}${extra}\n\n#EstudioDiario`
  if (full.length <= 270) return full
  return `${full.slice(0, 269)}…`
}
