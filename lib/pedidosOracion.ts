import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore"
import { getDb, isFirebaseConfigured } from "./firebase"

export type PedidoOracion = {
  id: string
  usuarioId: string
  nombre: string
  texto: string
  compartir: boolean
  orandoPor: Record<string, string>
  createdAt: Date | null
}

const MAX_TEXTO = 500

function mapDoc(id: string, d: Record<string, unknown>): PedidoOracion {
  const ts = d.createdAt as Timestamp | undefined
  const orando = d.orandoPor
  return {
    id,
    usuarioId: String(d.usuarioId ?? ""),
    nombre: String(d.nombre ?? ""),
    texto: String(d.texto ?? ""),
    compartir: d.compartir === true,
    orandoPor:
      orando && typeof orando === "object" && !Array.isArray(orando)
        ? (orando as Record<string, string>)
        : {},
    createdAt: ts?.toDate?.() ?? null,
  }
}

export function subscribePedidosCompartidos(
  onData: (items: PedidoOracion[]) => void,
  onError: (error: Error) => void
) {
  if (!isFirebaseConfigured()) {
    onData([])
    onError(new Error("VERCEL_ENV_MISSING"))
    return () => {}
  }

  const q = query(
    collection(getDb(), "pedidosOracion"),
    where("compartir", "==", true),
    orderBy("createdAt", "desc")
  )

  return onSnapshot(
    q,
    (snap) => {
      const items: PedidoOracion[] = []
      snap.forEach((item) => items.push(mapDoc(item.id, item.data())))
      onData(items)
    },
    (err) => onError(err as Error)
  )
}

export function subscribeMisPedidos(
  usuarioId: string,
  onData: (items: PedidoOracion[]) => void,
  onError: (error: Error) => void
) {
  if (!usuarioId || !isFirebaseConfigured()) {
    onData([])
    if (!isFirebaseConfigured()) onError(new Error("VERCEL_ENV_MISSING"))
    return () => {}
  }

  const q = query(
    collection(getDb(), "pedidosOracion"),
    where("usuarioId", "==", usuarioId),
    orderBy("createdAt", "desc")
  )

  return onSnapshot(
    q,
    (snap) => {
      const items: PedidoOracion[] = []
      snap.forEach((item) => items.push(mapDoc(item.id, item.data())))
      onData(items)
    },
    (err) => onError(err as Error)
  )
}

export async function crearPedidoOracion(
  usuarioId: string,
  nombre: string,
  texto: string,
  compartir: boolean
) {
  if (!isFirebaseConfigured() || !usuarioId) return
  const limpio = texto.trim().slice(0, MAX_TEXTO)
  if (limpio.length < 3) throw new Error("Escribe al menos 3 caracteres.")

  await addDoc(collection(getDb(), "pedidosOracion"), {
    usuarioId,
    nombre: nombre.trim().slice(0, 32),
    texto: limpio,
    compartir,
    orandoPor: {},
    createdAt: serverTimestamp(),
  })
}

export async function marcarOrandoPor(
  pedidoId: string,
  usuarioId: string,
  nombre: string
) {
  if (!isFirebaseConfigured() || !usuarioId) return
  await updateDoc(doc(getDb(), "pedidosOracion", pedidoId), {
    [`orandoPor.${usuarioId}`]: nombre.trim().slice(0, 32),
    updatedAt: serverTimestamp(),
  })
}

export async function quitarOrandoPor(pedidoId: string, usuarioId: string) {
  if (!isFirebaseConfigured() || !usuarioId) return
  await updateDoc(doc(getDb(), "pedidosOracion", pedidoId), {
    [`orandoPor.${usuarioId}`]: deleteField(),
    updatedAt: serverTimestamp(),
  })
}

export async function eliminarPedidoOracion(pedidoId: string) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(getDb(), "pedidosOracion", pedidoId))
}

export function contarOrando(pedido: PedidoOracion): number {
  return Object.keys(pedido.orandoPor).length
}

export function yaEstoyOrando(pedido: PedidoOracion, usuarioId: string): boolean {
  return Boolean(usuarioId && pedido.orandoPor[usuarioId])
}

export function formatearHace(fecha: Date | null): string {
  if (!fecha) return ""
  const seg = Math.floor((Date.now() - fecha.getTime()) / 1000)
  if (seg < 60) return "ahora"
  const min = Math.floor(seg / 60)
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `hace ${d} d`
  return fecha.toLocaleDateString("es", { day: "numeric", month: "short" })
}
