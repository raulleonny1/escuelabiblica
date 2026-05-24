import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { etiquetaSitio, type SitioAppId } from "@/lib/analyticsSitios"
import { getDb, isFirebaseConfigured } from "@/lib/firebase"
import { safeSessionGet, safeSessionSet } from "@/lib/storage"

const SESSION_KEY = "analyticsSessionId"

export type AnalyticsEventoTipo =
  | "inicio"
  | "sitio"
  | "tab"
  | "semana"
  | "dia_leccion"
  | "modal"
  | "pasaje_biblico"
  | "salida"

export type GeoInfo = {
  ip: string
  ciudad: string
  region: string
  pais: string
}

export async function obtenerGeoCliente(): Promise<GeoInfo> {
  try {
    const res = await fetch("/api/analytics/geo", { cache: "no-store" })
    if (!res.ok) throw new Error("geo")
    return (await res.json()) as GeoInfo
  } catch {
    return { ip: "—", ciudad: "Desconocida", region: "", pais: "" }
  }
}

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = safeSessionGet(SESSION_KEY)
  if (!id) {
    id = `as-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    safeSessionSet(SESSION_KEY, id)
  }
  return id
}

export async function iniciarSesionAnalytics(
  usuarioId: string,
  nombre: string,
  geo: GeoInfo
) {
  if (!isFirebaseConfigured() || !usuarioId) return
  const sessionId = getAnalyticsSessionId()
  const dispositivo =
    typeof navigator !== "undefined"
      ? `${navigator.platform} · ${navigator.userAgent.slice(0, 120)}`
      : ""

  await setDoc(
    doc(getDb(), "analyticsSesiones", sessionId),
    {
      sessionId,
      usuarioId,
      nombre: nombre.trim().slice(0, 32),
      ip: geo.ip,
      ciudad: geo.ciudad,
      region: geo.region,
      pais: geo.pais,
      dispositivo,
      inicioEn: serverTimestamp(),
      ultimoAcceso: serverTimestamp(),
      tiempoTotalSeg: 0,
      activo: true,
    },
    { merge: true }
  )

}

/** Registra qué sección de la app visitó el estudiante. */
export async function registrarVisitaSitio(
  usuarioId: string,
  nombre: string,
  sitioId: SitioAppId,
  duracionSeg = 0,
  detalle?: string
) {
  const destino = detalle
    ? `${etiquetaSitio(sitioId)} — ${detalle.slice(0, 120)}`
    : etiquetaSitio(sitioId)
  await registrarEvento(usuarioId, nombre, "sitio", destino, duracionSeg)
}

export async function registrarEvento(
  usuarioId: string,
  nombre: string,
  tipo: AnalyticsEventoTipo,
  destino: string,
  duracionSeg?: number
) {
  if (!isFirebaseConfigured() || !usuarioId) return
  const sessionId = getAnalyticsSessionId()

  await addDoc(collection(getDb(), "analyticsEventos"), {
    sessionId,
    usuarioId,
    nombre: nombre.trim().slice(0, 32),
    tipo,
    destino: destino.slice(0, 200),
    duracionSeg: duracionSeg ?? 0,
    createdAt: serverTimestamp(),
  })

  await updateDoc(doc(getDb(), "analyticsSesiones", sessionId), {
    ultimoAcceso: serverTimestamp(),
    ultimaRuta: destino.slice(0, 200),
  }).catch(() => {})
}

export async function actualizarTiempoSesion(segundos: number) {
  if (!isFirebaseConfigured() || segundos < 1) return
  const sessionId = getAnalyticsSessionId()
  await updateDoc(doc(getDb(), "analyticsSesiones", sessionId), {
    tiempoTotalSeg: segundos,
    ultimoAcceso: serverTimestamp(),
  }).catch(() => {})
}

export async function cerrarSesionAnalytics() {
  if (!isFirebaseConfigured()) return
  const sessionId = getAnalyticsSessionId()
  await updateDoc(doc(getDb(), "analyticsSesiones", sessionId), {
    activo: false,
    ultimoAcceso: serverTimestamp(),
  }).catch(() => {})
}
