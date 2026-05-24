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
import { getDb, isFirebaseConfigured } from "./firebase"
import { safeLocalGet, safeLocalSet } from "./storage"

function storageKey(usuarioId: string) {
  return `comentariosPorFecha:${usuarioId}`
}

export function idComentarioDoc(usuarioId: string, fecha: string) {
  return `${usuarioId}_${fecha}`
}

export function leerComentariosLocal(usuarioId: string): Record<string, string> {
  const saved = safeLocalGet(storageKey(usuarioId))
  if (!saved) return {}
  try {
    return JSON.parse(saved) as Record<string, string>
  } catch {
    return {}
  }
}

export function guardarComentariosLocal(usuarioId: string, data: Record<string, string>) {
  safeLocalSet(storageKey(usuarioId), JSON.stringify(data))
}

export function subscribeComentarios(
  usuarioId: string,
  onData: (data: Record<string, string>) => void,
  onError: (error: Error) => void
) {
  if (!usuarioId) {
    onData({})
    onError(new Error("SIN_SESION"))
    return () => {}
  }

  if (!isFirebaseConfigured()) {
    const local = leerComentariosLocal(usuarioId)
    onData(local)
    onError(new Error("VERCEL_ENV_MISSING"))
    return () => {}
  }

  const q = query(collection(getDb(), "comentarios"), where("usuarioId", "==", usuarioId))

  return onSnapshot(
    q,
    (snapshot) => {
      const data: Record<string, string> = {}
      snapshot.forEach((item) => {
        const d = item.data()
        const fecha = String(d.fecha ?? "")
        if (fecha) data[fecha] = String(d.texto ?? "")
      })
      guardarComentariosLocal(usuarioId, data)
      onData(data)
    },
    (error) => onError(error as Error)
  )
}

export async function migrarComentariosLocales(usuarioId: string, data: Record<string, string>) {
  await Promise.all(
    Object.entries(data).map(([fecha, texto]) => guardarComentario(usuarioId, fecha, texto))
  )
}

export async function guardarComentario(
  usuarioId: string,
  fecha: string,
  texto: string,
  semana?: number
) {
  if (!isFirebaseConfigured() || !usuarioId) return
  const docId = idComentarioDoc(usuarioId, fecha)
  await setDoc(doc(getDb(), "comentarios", docId), {
    usuarioId,
    fecha,
    texto,
    ...(semana != null ? { semana } : {}),
    updatedAt: serverTimestamp(),
  })
}

export async function eliminarComentario(usuarioId: string, fecha: string) {
  if (!isFirebaseConfigured() || !usuarioId) return
  await deleteDoc(doc(getDb(), "comentarios", idComentarioDoc(usuarioId, fecha)))
}
