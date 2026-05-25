import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore"
import { esErrorIndiceFirestore, getDb, isFirebaseConfigured } from "./firebase"
import { safeLocalGet, safeLocalSet } from "./storage"

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

function ordenarPorFecha(items: PedidoOracion[]): PedidoOracion[] {
  return [...items].sort((a, b) => {
    const ta = a.createdAt?.getTime() ?? 0
    const tb = b.createdAt?.getTime() ?? 0
    return tb - ta
  })
}

/** Pedidos con compartir=true: visibles para todos los que usan la app. */
export function subscribePedidosCompartidos(
  onData: (items: PedidoOracion[]) => void,
  onError: (error: Error) => void
) {
  if (!isFirebaseConfigured()) {
    onData([])
    onError(new Error("VERCEL_ENV_MISSING"))
    return () => {}
  }

  const col = collection(getDb(), "pedidosOracion")
  const qOrdenado = query(col, where("compartir", "==", true), orderBy("createdAt", "desc"))

  let unsubFallback: (() => void) | null = null

  const unsub = onSnapshot(
    qOrdenado,
    (snap) => {
      const items: PedidoOracion[] = []
      snap.forEach((item) => items.push(mapDoc(item.id, item.data())))
      onData(items)
    },
    (err) => {
      if (!esErrorIndiceFirestore(err as Error)) {
        onError(err as Error)
        return
      }
      const qSimple = query(col, where("compartir", "==", true))
      unsubFallback = onSnapshot(
        qSimple,
        (snap) => {
          const items: PedidoOracion[] = []
          snap.forEach((item) => items.push(mapDoc(item.id, item.data())))
          onData(ordenarPorFecha(items))
        },
        (err2) => onError(err2 as Error)
      )
    }
  )

  return () => {
    unsub()
    unsubFallback?.()
  }
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

  const col = collection(getDb(), "pedidosOracion")
  const qOrdenado = query(col, where("usuarioId", "==", usuarioId), orderBy("createdAt", "desc"))

  let unsubFallback: (() => void) | null = null

  const unsub = onSnapshot(
    qOrdenado,
    (snap) => {
      const items: PedidoOracion[] = []
      snap.forEach((item) => items.push(mapDoc(item.id, item.data())))
      onData(items)
    },
    (err) => {
      if (!esErrorIndiceFirestore(err as Error)) {
        onError(err as Error)
        return
      }
      const qSimple = query(col, where("usuarioId", "==", usuarioId))
      unsubFallback = onSnapshot(
        qSimple,
        (snap) => {
          const items: PedidoOracion[] = []
          snap.forEach((item) => items.push(mapDoc(item.id, item.data())))
          onData(ordenarPorFecha(items))
        },
        (err2) => onError(err2 as Error)
      )
    }
  )

  return () => {
    unsub()
    unsubFallback?.()
  }
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

export type AvisoOracion = {
  id: string
  pedidoId: string
  autorUsuarioId: string
  oradorUsuarioId: string
  oradorNombre: string
  mensaje: string
  pedidoResumen: string
  leido: boolean
  createdAt: Date | null
}

function idAvisoOracion(pedidoId: string, oradorUsuarioId: string) {
  return `${pedidoId}_${oradorUsuarioId}`
}

function mapAviso(id: string, d: Record<string, unknown>): AvisoOracion {
  const ts = d.createdAt as Timestamp | undefined
  return {
    id,
    pedidoId: String(d.pedidoId ?? ""),
    autorUsuarioId: String(d.autorUsuarioId ?? ""),
    oradorUsuarioId: String(d.oradorUsuarioId ?? ""),
    oradorNombre: String(d.oradorNombre ?? ""),
    mensaje: String(d.mensaje ?? ""),
    pedidoResumen: String(d.pedidoResumen ?? ""),
    leido: d.leido === true,
    createdAt: ts?.toDate?.() ?? null,
  }
}

/** Avisa al autor que alguien orará por su pedido compartido. */
async function enviarAvisoOracion(pedido: PedidoOracion, oradorId: string, oradorNombre: string) {
  if (!isFirebaseConfigured() || pedido.usuarioId === oradorId) return
  const nombre = oradorNombre.trim().slice(0, 32)
  await setDoc(
    doc(getDb(), "avisosOracion", idAvisoOracion(pedido.id, oradorId)),
    {
      pedidoId: pedido.id,
      autorUsuarioId: pedido.usuarioId,
      oradorUsuarioId: oradorId,
      oradorNombre: nombre,
      mensaje: `${nombre} orará por tu pedido de oración.`,
      pedidoResumen: pedido.texto.trim().slice(0, 100),
      leido: false,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export function subscribeAvisosOracion(
  autorUsuarioId: string,
  onData: (items: AvisoOracion[]) => void,
  onError: (error: Error) => void
) {
  if (!autorUsuarioId || !isFirebaseConfigured()) {
    onData([])
    return () => {}
  }

  const col = collection(getDb(), "avisosOracion")
  const q = query(col, where("autorUsuarioId", "==", autorUsuarioId), orderBy("createdAt", "desc"))

  let unsubFallback: (() => void) | null = null

  const unsub = onSnapshot(
    q,
    (snap) => {
      const items: AvisoOracion[] = []
      snap.forEach((item) => items.push(mapAviso(item.id, item.data())))
      onData(items)
    },
    (err) => {
      if (!esErrorIndiceFirestore(err as Error)) {
        onError(err as Error)
        return
      }
      const qSimple = query(col, where("autorUsuarioId", "==", autorUsuarioId))
      unsubFallback = onSnapshot(
        qSimple,
        (snap) => {
          const items: AvisoOracion[] = []
          snap.forEach((item) => items.push(mapAviso(item.id, item.data())))
          items.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
          onData(items)
        },
        (err2) => onError(err2 as Error)
      )
    }
  )

  return () => {
    unsub()
    unsubFallback?.()
  }
}

export async function marcarAvisoLeido(avisoId: string) {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getDb(), "avisosOracion", avisoId), { leido: true })
}

export async function marcarTodosAvisosLeidos(autorUsuarioId: string) {
  if (!isFirebaseConfigured() || !autorUsuarioId) return
  const q = query(
    collection(getDb(), "avisosOracion"),
    where("autorUsuarioId", "==", autorUsuarioId)
  )
  const snap = await getDocs(q)
  await Promise.all(
    snap.docs
      .filter((item) => item.data().leido !== true)
      .map((item) => updateDoc(item.ref, { leido: true }))
  )
}

export async function marcarOrandoPor(pedido: PedidoOracion, oradorId: string, oradorNombre: string) {
  if (!isFirebaseConfigured() || !oradorId) return
  await updateDoc(doc(getDb(), "pedidosOracion", pedido.id), {
    [`orandoPor.${oradorId}`]: oradorNombre.trim().slice(0, 32),
    updatedAt: serverTimestamp(),
  })
  await enviarAvisoOracion(pedido, oradorId, oradorNombre)
}

export async function quitarOrandoPor(pedido: PedidoOracion, oradorId: string) {
  if (!isFirebaseConfigured() || !oradorId) return
  await updateDoc(doc(getDb(), "pedidosOracion", pedido.id), {
    [`orandoPor.${oradorId}`]: deleteField(),
    updatedAt: serverTimestamp(),
  })
  await deleteDoc(doc(getDb(), "avisosOracion", idAvisoOracion(pedido.id, oradorId))).catch(
    () => {}
  )
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

function storageVistosKey(usuarioId: string) {
  return `pedidosOracionVistos:${usuarioId}`
}

export function leerPedidosOracionVistos(usuarioId: string): Set<string> {
  if (!usuarioId) return new Set()
  const raw = safeLocalGet(storageVistosKey(usuarioId))
  if (!raw) return new Set()
  try {
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

export function marcarPedidosOracionVistos(usuarioId: string, pedidoIds: string[]) {
  if (!usuarioId || pedidoIds.length === 0) return
  const vistos = leerPedidosOracionVistos(usuarioId)
  for (const id of pedidoIds) vistos.add(id)
  safeLocalSet(storageVistosKey(usuarioId), JSON.stringify([...vistos]))
}

export function contarPedidosOracionSinLeer(usuarioId: string, pedidoIdsDeOtros: string[]): number {
  if (!usuarioId || pedidoIdsDeOtros.length === 0) return 0
  const vistos = leerPedidosOracionVistos(usuarioId)
  return pedidoIdsDeOtros.filter((id) => !vistos.has(id)).length
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
