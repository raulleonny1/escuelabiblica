/** Utilidades de compartir en redes (texto). */

export async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch {
    /* fallback */
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = texto
    ta.setAttribute("readonly", "")
    ta.style.position = "fixed"
    ta.style.left = "-9999px"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export function abrirWhatsApp(texto: string) {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(texto)}`,
    "_blank",
    "noopener,noreferrer"
  )
}

export function abrirFacebookCompartir(paginaUrl: string) {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(paginaUrl)}`,
    "_blank",
    "noopener,noreferrer,width=600,height=700"
  )
}

export function abrirX(texto: string) {
  const max = 270
  const cuerpo = texto.length <= max ? texto : `${texto.slice(0, max - 1)}…`
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(cuerpo)}`,
    "_blank",
    "noopener,noreferrer,width=550,height=650"
  )
}

export function abrirInstagram() {
  window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer")
}

export function urlPaginaActual(): string {
  if (typeof window === "undefined") return "https://www.facebook.com/"
  return window.location.href.split("#")[0] || window.location.origin
}
