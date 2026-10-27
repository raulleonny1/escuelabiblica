import {
  alAbrirPasajeBiblico,
  alCerrarPasajeBiblico,
  getLectorPasajeVoz,
  prepararSintesisEnGesto,
} from "@/lib/leccionTts"

export const LECTURA_DIA_ABRIR_EVENT = "lectura-dia-abrir"

export type LecturaAudioEstado = "idle" | "playing" | "paused"

export type LecturaAudioSnapshot = {
  estado: LecturaAudioEstado
  titulo: string
  referencia: string
}

let snap: LecturaAudioSnapshot = {
  estado: "idle",
  titulo: "",
  referencia: "",
}

const listeners = new Set<() => void>()

function emitir() {
  for (const fn of listeners) fn()
}

export function subscribeLecturaAudio(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getLecturaAudioSnapshot(): LecturaAudioSnapshot {
  return snap
}

function enlazarCallbacks() {
  const lector = getLectorPasajeVoz()
  lector.patchCallbacks({
    onEstado: (e) => {
      if (snap.estado === "idle" && e === "idle") return
      if (e === "idle") {
        // Fin natural o detener externo
        if (snap.estado !== "idle") {
          snap = { estado: "idle", titulo: "", referencia: "" }
          emitir()
        }
        return
      }
      snap = { ...snap, estado: e }
      emitir()
    },
    onFin: () => {
      snap = { estado: "idle", titulo: "", referencia: "" }
      alCerrarPasajeBiblico()
      emitir()
    },
  })
}

/** Reproduce la lectura y sigue en segundo plano aunque se cierre la ventana. */
export function reproducirLecturaAudio(
  texto: string,
  titulo: string,
  referencia: string
) {
  const limpio = texto.trim()
  if (!limpio) return

  prepararSintesisEnGesto()
  alAbrirPasajeBiblico()
  enlazarCallbacks()

  const lector = getLectorPasajeVoz()
  lector.iniciarTexto(limpio, `Lectura del día · ${titulo}`)
  snap = { estado: "playing", titulo, referencia }
  emitir()
}

export function alternarPausaLecturaAudio() {
  const lector = getLectorPasajeVoz()
  const actual = lector.getEstado()
  if (actual === "playing") {
    lector.pausar()
    snap = { ...snap, estado: "paused" }
    emitir()
  } else if (actual === "paused") {
    prepararSintesisEnGesto()
    lector.reanudar()
    snap = { ...snap, estado: "playing" }
    emitir()
  }
}

/** Cierra / detiene la lectura (también desde la barra del sistema). */
export function detenerLecturaAudio() {
  getLectorPasajeVoz().detener()
  alCerrarPasajeBiblico()
  snap = { estado: "idle", titulo: "", referencia: "" }
  emitir()
}

export function pedirAbrirLecturaDia() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(LECTURA_DIA_ABRIR_EVENT))
}
