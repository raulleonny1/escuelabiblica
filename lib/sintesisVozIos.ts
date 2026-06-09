/** Compatibilidad iOS/Safari: precarga, audio en segundo plano y sesión multimedia. */

export function esDispositivoIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

let vocesCache: SpeechSynthesisVoice[] = []
let vocesEscuchaRegistrada = false

export function precargarVocesSintesis(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.getVoices()
  vocesCache = window.speechSynthesis.getVoices()
  if (!vocesEscuchaRegistrada) {
    vocesEscuchaRegistrada = true
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      vocesCache = window.speechSynthesis.getVoices()
    })
  }
}

export function obtenerVocesCacheadas(): SpeechSynthesisVoice[] {
  precargarVocesSintesis()
  return vocesCache
}

/** Llamar en el mismo gesto del usuario (click/touch) antes de speak(). */
export function prepararSintesisEnGesto(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  precargarVocesSintesis()
  const syn = window.speechSynthesis
  syn.cancel()
  syn.resume()
  void activarAudioSilencioso()
}

/** MP3 mínimo en bucle: mantiene la app activa con pantalla bloqueada (iOS). */
const SILENT_MP3 =
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAEluZm8AAAAPAAAABAAABLABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAABMYXZjNTguMzUAAAAAAAAAAAAAAAAkAAAAAAAAAAAABLABA/////8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABRgJAWCQQAB9AAAaqYcEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

let audioSilencioso: HTMLAudioElement | null = null
let usuariosAudioSilencioso = 0
let intervaloIos: ReturnType<typeof setInterval> | null = null

export async function activarAudioSilencioso(): Promise<void> {
  if (typeof window === "undefined") return
  usuariosAudioSilencioso++
  if (!audioSilencioso) {
    audioSilencioso = new Audio(SILENT_MP3)
    audioSilencioso.loop = true
    audioSilencioso.volume = 0.01
    audioSilencioso.setAttribute("playsinline", "true")
    audioSilencioso.preload = "auto"
  }
  try {
    if (audioSilencioso.paused) await audioSilencioso.play()
  } catch {
    /* requiere gesto del usuario */
  }
}

export function desactivarAudioSilencioso(): void {
  usuariosAudioSilencioso = Math.max(0, usuariosAudioSilencioso - 1)
  if (usuariosAudioSilencioso > 0) return
  audioSilencioso?.pause()
  if (audioSilencioso) audioSilencioso.currentTime = 0
  detenerMantenimientoIos()
}

export function hablarUtterance(utterance: SpeechSynthesisUtterance): void {
  const syn = window.speechSynthesis
  if (esDispositivoIOS()) {
    syn.cancel()
    syn.resume()
  }
  syn.speak(utterance)
}

/** iOS deja de hablar tras un rato; pause+resume lo mantiene vivo. */
export function iniciarMantenimientoIos(): void {
  if (!esDispositivoIOS()) return
  detenerMantenimientoIos()
  intervaloIos = setInterval(() => {
    const syn = window.speechSynthesis
    if (syn.speaking && !syn.paused) {
      syn.pause()
      syn.resume()
    }
  }, 8000)
}

export function detenerMantenimientoIos(): void {
  if (intervaloIos) {
    clearInterval(intervaloIos)
    intervaloIos = null
  }
}

type AccionesMedia = {
  onPausa: () => void
  onPlay: () => void
  onStop: () => void
}

export function configurarSesionMedia(titulo: string, acciones: AccionesMedia): void {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: titulo.slice(0, 80),
      artist: "Escuela Bíblica",
      album: "Estudio bíblico",
    })
    navigator.mediaSession.playbackState = "playing"
    navigator.mediaSession.setActionHandler("pause", acciones.onPausa)
    navigator.mediaSession.setActionHandler("play", acciones.onPlay)
    navigator.mediaSession.setActionHandler("stop", acciones.onStop)
  } catch {
    /* Safari parcial */
  }
}

export function actualizarSesionMedia(estado: "playing" | "paused" | "none"): void {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
  try {
    navigator.mediaSession.playbackState = estado
  } catch {
    /* ignore */
  }
}

export function limpiarSesionMedia(): void {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
  try {
    navigator.mediaSession.playbackState = "none"
    navigator.mediaSession.setActionHandler("pause", null)
    navigator.mediaSession.setActionHandler("play", null)
    navigator.mediaSession.setActionHandler("stop", null)
  } catch {
    /* ignore */
  }
}

export function registrarPrecargaVocesEnApp(): () => void {
  if (typeof window === "undefined") return () => {}
  const fn = () => precargarVocesSintesis()
  document.addEventListener("touchstart", fn, { passive: true })
  document.addEventListener("click", fn, { passive: true })
  return () => {
    document.removeEventListener("touchstart", fn)
    document.removeEventListener("click", fn)
  }
}
