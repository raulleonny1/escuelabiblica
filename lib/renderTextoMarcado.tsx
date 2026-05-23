import type { ReactNode } from "react"
import type { AnotacionLeccion, MarcaFormato } from "@/lib/anotaciones"

function clasesMarcas(marcas: MarcaFormato[]): string {
  const parts: string[] = []
  if (marcas.includes("resaltado")) parts.push("anot-resaltado")
  if (marcas.includes("negrita")) parts.push("font-bold text-slate-900")
  if (marcas.includes("subrayado")) parts.push("underline decoration-2 decoration-amber-600")
  return parts.join(" ")
}

function FragmentoMarcado({
  texto,
  marcas,
}: {
  texto: string
  marcas: MarcaFormato[]
}) {
  const className = clasesMarcas(marcas)
  // <mark> solo para resaltado; si no, el navegador pinta fondo amarillo en negrita/subrayado
  if (marcas.includes("resaltado")) {
    return <mark className={className}>{texto}</mark>
  }
  return <span className={className}>{texto}</span>
}

/** Aplica formatos sobre el texto del bloque según las citas guardadas */
export function renderTextoConMarcas(
  texto: string,
  anotaciones: AnotacionLeccion[]
): ReactNode {
  if (!texto || anotaciones.length === 0) return texto

  const conMarcas = anotaciones.filter((a) => a.marcas.length > 0 && a.cita.trim())
  if (conMarcas.length === 0) return texto

  const ordenadas = [...conMarcas].sort((a, b) => b.cita.length - a.cita.length)
  type Segmento = { texto: string; marcas?: MarcaFormato[] }
  let segmentos: Segmento[] = [{ texto }]

  for (const an of ordenadas) {
    const cita = an.cita.trim()
    if (!cita) continue
    const nuevos: Segmento[] = []
    for (const seg of segmentos) {
      if (seg.marcas) {
        nuevos.push(seg)
        continue
      }
      const idx = seg.texto.indexOf(cita)
      if (idx === -1) {
        nuevos.push(seg)
        continue
      }
      if (idx > 0) nuevos.push({ texto: seg.texto.slice(0, idx) })
      nuevos.push({ texto: cita, marcas: an.marcas })
      const resto = seg.texto.slice(idx + cita.length)
      if (resto) nuevos.push({ texto: resto })
    }
    segmentos = nuevos
  }

  return segmentos.map((seg, i) =>
    seg.marcas ? (
      <FragmentoMarcado key={i} texto={seg.texto} marcas={seg.marcas} />
    ) : (
      <span key={i}>{seg.texto}</span>
    )
  )
}
