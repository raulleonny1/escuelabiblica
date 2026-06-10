import { esDispositivoIOS } from "@/lib/sintesisVozIos"

/** Sesión de audio para reproducción en segundo plano (Safari 17+). */
export function configurarSesionAudioIos(): void {
  if (!esDispositivoIOS()) return
  const nav = navigator as Navigator & { audioSession?: { type: string } }
  try {
    if (nav.audioSession) nav.audioSession.type = "playback"
  } catch {
    /* ignore */
  }
}

let intervaloMantenimientoIos: ReturnType<typeof setInterval> | null = null
let callbackMantenimientoIos: (() => void) | null = null
let usuariosMantenimientoIos = 0

export function iniciarMantenimientoAudioIos(callback: () => void): void {
  if (!esDispositivoIOS()) return
  usuariosMantenimientoIos++
  callbackMantenimientoIos = callback
  if (intervaloMantenimientoIos) return

  intervaloMantenimientoIos = setInterval(() => {
    if (!document.hidden) return
    callbackMantenimientoIos?.()
  }, 1500)
}

export function detenerMantenimientoAudioIos(): void {
  if (!esDispositivoIOS()) return
  usuariosMantenimientoIos = Math.max(0, usuariosMantenimientoIos - 1)
  if (usuariosMantenimientoIos > 0) return
  if (intervaloMantenimientoIos) {
    clearInterval(intervaloMantenimientoIos)
    intervaloMantenimientoIos = null
  }
  callbackMantenimientoIos = null
}

const REPRODUCTOR_IOS_ID = "tts-reproduccion-ios"

export function obtenerReproductorAudioIos(): HTMLAudioElement {
  const existente = document.getElementById(REPRODUCTOR_IOS_ID)
  if (existente instanceof HTMLAudioElement) return existente

  const el = document.createElement("audio")
  el.id = REPRODUCTOR_IOS_ID
  el.preload = "auto"
  el.setAttribute("playsinline", "true")
  el.setAttribute("webkit-playsinline", "true")
  document.body.appendChild(el)
  return el
}

export function crearAudioPrecargadoIos(url: string): HTMLAudioElement {
  const el = document.createElement("audio")
  el.preload = "auto"
  el.setAttribute("playsinline", "true")
  el.setAttribute("webkit-playsinline", "true")
  el.src = url
  el.load()
  return el
}

export function limpiarHandlersAudio(el: HTMLAudioElement): void {
  el.onended = null
  el.onerror = null
  el.ontimeupdate = null
  el.onloadedmetadata = null
}

export function pausarReproductorIos(el: HTMLAudioElement | null): void {
  if (!el) return
  limpiarHandlersAudio(el)
  el.pause()
}
