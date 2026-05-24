import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"
import { getDb, isFirebaseConfigured } from "@/lib/firebase"

function tsIso(v: unknown): string | null {
  if (!v || typeof v !== "object") return null
  const t = v as { toDate?: () => Date }
  if (typeof t.toDate === "function") return t.toDate().toISOString()
  return null
}

/** Respaldo: leer analíticas desde el cliente (requiere reglas de lectura para usuarios autenticados). */
export async function cargarAnalyticsDesdeCliente() {
  if (!isFirebaseConfigured()) throw new Error("Firebase no configurado")

  const db = getDb()
  const [sesSnap, evSnap] = await Promise.all([
    getDocs(query(collection(db, "analyticsSesiones"), orderBy("ultimoAcceso", "desc"), limit(500))),
    getDocs(query(collection(db, "analyticsEventos"), orderBy("createdAt", "desc"), limit(3000))),
  ])

  const sesiones = sesSnap.docs.map((d) => {
    const x = d.data()
    return {
      sessionId: String(x.sessionId ?? d.id),
      usuarioId: String(x.usuarioId ?? ""),
      nombre: String(x.nombre ?? ""),
      ip: String(x.ip ?? ""),
      ciudad: String(x.ciudad ?? ""),
      region: String(x.region ?? ""),
      pais: String(x.pais ?? ""),
      dispositivo: String(x.dispositivo ?? ""),
      inicioEn: tsIso(x.inicioEn),
      ultimoAcceso: tsIso(x.ultimoAcceso),
      tiempoTotalSeg: Number(x.tiempoTotalSeg) || 0,
      ultimaRuta: String(x.ultimaRuta ?? ""),
      activo: x.activo !== false,
    }
  })

  const eventos = evSnap.docs.map((d) => {
    const x = d.data()
    return {
      id: d.id,
      sessionId: String(x.sessionId ?? ""),
      usuarioId: String(x.usuarioId ?? ""),
      nombre: String(x.nombre ?? ""),
      tipo: String(x.tipo ?? ""),
      destino: String(x.destino ?? ""),
      duracionSeg: Number(x.duracionSeg) || 0,
      createdAt: tsIso(x.createdAt),
    }
  })

  const porUsuario = new Map<
    string,
    {
      usuarioId: string
      nombre: string
      sesiones: number
      tiempoTotalSeg: number
      ultimaCiudad: string
      ultimaIp: string
      ultimoAcceso: string | null
      eventos: typeof eventos
    }
  >()

  for (const s of sesiones) {
    const prev = porUsuario.get(s.usuarioId) ?? {
      usuarioId: s.usuarioId,
      nombre: s.nombre,
      sesiones: 0,
      tiempoTotalSeg: 0,
      ultimaCiudad: s.ciudad,
      ultimaIp: s.ip,
      ultimoAcceso: s.ultimoAcceso,
      eventos: [],
    }
    prev.sesiones += 1
    prev.tiempoTotalSeg += s.tiempoTotalSeg
    if (s.nombre) prev.nombre = s.nombre
    if (s.ultimoAcceso && (!prev.ultimoAcceso || s.ultimoAcceso > prev.ultimoAcceso)) {
      prev.ultimoAcceso = s.ultimoAcceso
      prev.ultimaCiudad = s.ciudad
      prev.ultimaIp = s.ip
    }
    porUsuario.set(s.usuarioId, prev)
  }

  for (const e of eventos) {
    const u = porUsuario.get(e.usuarioId)
    if (u) u.eventos.push(e)
  }

  const resumen = [...porUsuario.values()].sort((a, b) =>
    (b.ultimoAcceso ?? "").localeCompare(a.ultimoAcceso ?? "")
  )

  return {
    generadoEn: new Date().toISOString(),
    totalSesiones: sesiones.length,
    totalEventos: eventos.length,
    totalUsuarios: resumen.length,
    sesiones,
    eventos,
    resumen,
  }
}
