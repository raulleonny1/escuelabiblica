import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { etiquetaSitio, type SitioAppId } from "@/lib/analyticsSitios"
import { getFirebaseAuthUid } from "@/lib/auth"
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
    const res = await fetch("/api/analytics/geo", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
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
  // Las reglas exigen request.auth.uid === usuarioId
  const uidAuth = getFirebaseAuthUid()
  if (!uidAuth) {
    console.warn("[analytics] sin Firebase Auth; no se registra la sesión")
    return
  }
  const uid = uidAuth
  const sessionId = getAnalyticsSessionId()
  const dispositivo =
    typeof navigator !== "undefined"
      ? `${navigator.platform} · ${navigator.userAgent.slice(0, 120)}`
      : ""

  try {
    await setDoc(
      doc(getDb(), "analyticsSesiones", sessionId),
      {
        sessionId,
        usuarioId: uid,
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
  } catch (err) {
    console.warn("[analytics] setDoc sesión falló", err)
    throw err
  }
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
  const uidAuth = getFirebaseAuthUid()
  if (!uidAuth) return
  const sessionId = getAnalyticsSessionId()

  try {
    await addDoc(collection(getDb(), "analyticsEventos"), {
      sessionId,
      usuarioId: uidAuth,
      nombre: nombre.trim().slice(0, 32),
      tipo,
      destino: destino.slice(0, 200),
      duracionSeg: duracionSeg ?? 0,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn("[analytics] addDoc evento falló", err)
  }

  await updateDoc(doc(getDb(), "analyticsSesiones", sessionId), {
    ultimoAcceso: serverTimestamp(),
    ultimaRuta: destino.slice(0, 200),
    usuarioId: uidAuth,
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
