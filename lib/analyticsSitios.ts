/** Secciones de la app que aparecen en el panel admin. */

export const SITIOS_APP = {
  inicio: "Entrada a la app",
  leccion: "Lección (texto del día)",
  estudio: "Estudio y notas (sin Biblia)",
  biblia: "Biblia",
  chat: "Chat grupal",
  hoja_dominical: "Hoja dominical (PDF)",
  pedido_oracion: "Pedido de oración",
  pasaje_biblico: "Pasaje bíblico (ventana)",
} as const

export type SitioAppId = keyof typeof SITIOS_APP

export function etiquetaSitio(id: string): string {
  return SITIOS_APP[id as SitioAppId] ?? id
}

export function sitioDesdeEvento(tipo: string, destino: string): string {
  if (tipo === "sitio") {
    if (destino.startsWith("Biblia")) return destino
    return destino
  }
  if (tipo === "tab") {
    if (destino.includes("Lección")) return SITIOS_APP.leccion
    if (destino.includes("Chat")) return SITIOS_APP.chat
    if (destino.includes("Estudio") || destino.includes("Biblia")) return SITIOS_APP.estudio
    return destino
  }
  if (tipo === "modal") return destino
  if (tipo === "inicio") return SITIOS_APP.inicio
  return destino
}

export type SitioResumen = {
  sitio: string
  visitas: number
  segundos: number
  ultimaVisita: string | null
}

function claveResumenSitio(tipo: string, destino: string): string {
  const sitio = sitioDesdeEvento(tipo, destino)
  if (sitio.startsWith("Biblia")) return SITIOS_APP.biblia
  if (sitio.includes("Lección")) return SITIOS_APP.leccion
  if (sitio.includes("Chat")) return SITIOS_APP.chat
  if (sitio.includes("Estudio")) return SITIOS_APP.estudio
  if (sitio.includes("Hoja dominical")) return SITIOS_APP.hoja_dominical
  if (sitio.includes("Pedido de oración")) return SITIOS_APP.pedido_oracion
  return sitio
}

export function resumirSitiosVisitados(
  eventos: {
    tipo: string
    destino: string
    duracionSeg: number
    createdAt: string | null
  }[]
): SitioResumen[] {
  const map = new Map<string, SitioResumen>()

  for (const e of eventos) {
    if (!["sitio", "tab", "modal", "inicio"].includes(e.tipo)) continue
    const sitio = claveResumenSitio(e.tipo, e.destino)
    const prev = map.get(sitio) ?? {
      sitio,
      visitas: 0,
      segundos: 0,
      ultimaVisita: null,
    }
    prev.visitas += 1
    prev.segundos += e.duracionSeg || 0
    if (e.createdAt && (!prev.ultimaVisita || e.createdAt > prev.ultimaVisita)) {
      prev.ultimaVisita = e.createdAt
    }
    map.set(sitio, prev)
  }

  return [...map.values()].sort((a, b) => b.visitas - a.visitas)
}
