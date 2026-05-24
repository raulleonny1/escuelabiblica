import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore"
import type { DiaLeccionId } from "@/lib/lecciones"
import { getDb, isFirebaseConfigured } from "./firebase"
import { safeLocalGet, safeLocalSet } from "./storage"

export type MarcaFormato = "resaltado" | "negrita" | "subrayado"

export type AnotacionLeccion = {
  id: string
  usuarioId: string
  semana: number
  fecha: string
  diaLeccion: DiaLeccionId
  bloqueTitulo: string
  cita: string
  comentario: string
  marcas: MarcaFormato[]
}

function storageKey(usuarioId: string) {
  return `anotacionesLeccion:${usuarioId}`
}

export function nuevaIdAnotacion(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `an-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function leerAnotacionesLocal(usuarioId: string): AnotacionLeccion[] {
  const raw = safeLocalGet(storageKey(usuarioId))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as AnotacionLeccion[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((a) => !a.usuarioId || a.usuarioId === usuarioId)
  } catch {
    return []
  }
}

export function guardarAnotacionesLocal(usuarioId: string, items: AnotacionLeccion[]) {
  safeLocalSet(storageKey(usuarioId), JSON.stringify(items))
}

export function subscribeAnotaciones(
  usuarioId: string,
  onData: (items: AnotacionLeccion[]) => void,
  onError: (error: Error) => void
) {
  if (!usuarioId) {
    onData([])
    return () => {}
  }

  if (!isFirebaseConfigured()) {
    onData(leerAnotacionesLocal(usuarioId))
    onError(new Error("VERCEL_ENV_MISSING"))
    return () => {}
  }

  const q = query(collection(getDb(), "anotaciones"), where("usuarioId", "==", usuarioId))

  return onSnapshot(
    q,
    (snapshot) => {
      const items: AnotacionLeccion[] = []
      snapshot.forEach((item) => {
        const d = item.data()
        items.push({
          id: item.id,
          usuarioId: String(d.usuarioId ?? usuarioId),
          semana: Number(d.semana) || 1,
          fecha: String(d.fecha ?? ""),
          diaLeccion: (d.diaLeccion as DiaLeccionId) ?? "dom",
          bloqueTitulo: String(d.bloqueTitulo ?? ""),
          cita: String(d.cita ?? ""),
          comentario: String(d.comentario ?? ""),
          marcas: Array.isArray(d.marcas) ? (d.marcas as MarcaFormato[]) : [],
        })
      })
      guardarAnotacionesLocal(usuarioId, items)
      onData(items)
    },
    (error) => onError(error as Error)
  )
}

export async function guardarAnotacion(anotacion: AnotacionLeccion) {
  if (!isFirebaseConfigured() || !anotacion.usuarioId) return
  await setDoc(doc(getDb(), "anotaciones", anotacion.id), {
    ...anotacion,
    updatedAt: serverTimestamp(),
  })
}

export async function eliminarAnotacion(id: string) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(getDb(), "anotaciones", id))
}

export function anotacionesPorFecha(items: AnotacionLeccion[], fecha: string) {
  return items.filter((a) => a.fecha === fecha)
}

export function anotacionEstaVacia(a: Pick<AnotacionLeccion, "marcas" | "comentario">) {
  return a.marcas.length === 0 && !a.comentario.trim()
}

export function marcasDelDia(items: AnotacionLeccion[], fecha: string) {
  return anotacionesPorFecha(items, fecha).filter((a) => a.marcas.length > 0)
}

export function comentariosCitaDelDia(items: AnotacionLeccion[], fecha: string) {
  return anotacionesPorFecha(items, fecha).filter((a) => a.comentario.trim())
}

export const ETIQUETA_MARCA: Record<MarcaFormato, string> = {
  resaltado: "Resaltado",
  negrita: "Negrita",
  subrayado: "Subrayado",
}

export function anotacionesPorBloque(
  items: AnotacionLeccion[],
  fecha: string,
  bloqueTitulo: string
) {
  return items.filter((a) => a.fecha === fecha && a.bloqueTitulo === bloqueTitulo)
}
