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
  return `comentariosLecturaPorFecha:${usuarioId}`
}

export function idComentarioLecturaDoc(usuarioId: string, fecha: string) {
  return `${usuarioId}_${fecha}`
}

export function leerComentariosLecturaLocal(usuarioId: string): Record<string, string> {
  const saved = safeLocalGet(storageKey(usuarioId))
  if (!saved) return {}
  try {
    return JSON.parse(saved) as Record<string, string>
  } catch {
    return {}
  }
}

export function guardarComentariosLecturaLocal(
  usuarioId: string,
  data: Record<string, string>
) {
  safeLocalSet(storageKey(usuarioId), JSON.stringify(data))
}

export function subscribeComentariosLectura(
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
    const local = leerComentariosLecturaLocal(usuarioId)
    onData(local)
    onError(new Error("VERCEL_ENV_MISSING"))
    return () => {}
  }

  const q = query(
    collection(getDb(), "comentariosLectura"),
    where("usuarioId", "==", usuarioId)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const data: Record<string, string> = {}
      snapshot.forEach((item) => {
        const d = item.data()
        const fecha = String(d.fecha ?? "")
        if (fecha) data[fecha] = String(d.texto ?? "")
      })
      guardarComentariosLecturaLocal(usuarioId, data)
      onData(data)
    },
    (error) => onError(error as Error)
  )
}

export async function guardarComentarioLectura(
  usuarioId: string,
  fecha: string,
  texto: string
) {
  const limpio = texto.trim()
  const local = leerComentariosLecturaLocal(usuarioId)
  if (limpio) local[fecha] = limpio
  else delete local[fecha]
  guardarComentariosLecturaLocal(usuarioId, local)

  if (!isFirebaseConfigured() || !usuarioId) return

  const docId = idComentarioLecturaDoc(usuarioId, fecha)
  if (!limpio) {
    await deleteDoc(doc(getDb(), "comentariosLectura", docId)).catch(() => {})
    return
  }

  await setDoc(doc(getDb(), "comentariosLectura", docId), {
    usuarioId,
    fecha,
    texto: limpio,
    updatedAt: serverTimestamp(),
  })
}

export async function eliminarComentarioLectura(usuarioId: string, fecha: string) {
  const local = leerComentariosLecturaLocal(usuarioId)
  delete local[fecha]
  guardarComentariosLecturaLocal(usuarioId, local)

  if (!isFirebaseConfigured() || !usuarioId) return
  await deleteDoc(
    doc(getDb(), "comentariosLectura", idComentarioLecturaDoc(usuarioId, fecha))
  ).catch(() => {})
}
