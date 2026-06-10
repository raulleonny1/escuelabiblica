/** Compatibilidad móvil: precarga TTS, audio en segundo plano y sesión multimedia. */

const SILENCE_URL = "/audio/silence.wav"
const AUDIO_KEEPALIVE_ID = "tts-keepalive-audio"

export function esDispositivoIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

export function esDispositivoMovil(): boolean {
  if (typeof navigator === "undefined") return false
  return esDispositivoIOS() || /Android/i.test(navigator.userAgent)
}

let vocesCache: SpeechSynthesisVoice[] = []
let vocesEscuchaRegistrada = false

let audioSilencioso: HTMLAudioElement | null = null
let audioCtx: AudioContext | null = null
let osciladorSilencioso: OscillatorNode | null = null
let gananciaSilenciosa: GainNode | null = null

let usuariosAudioSilencioso = 0
let intervaloMantenimiento: ReturnType<typeof setInterval> | null = null
let listenersRegistrados = false

function actualizarEstadoReproduccionTts(): void {
  reproduccionTtsActiva = usuariosAudioSilencioso > 0
}

let reproduccionTtsActiva = false

/** @deprecated El estado se deriva del audio en segundo plano. */
export function marcarReproduccionTts(_activa: boolean): void {
  /* noop: usar activarAudioSilencioso / desactivarAudioSilencioso */
}

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

function obtenerAudioSilencioso(): HTMLAudioElement {
  if (audioSilencioso) return audioSilencioso

  const existente = document.getElementById(AUDIO_KEEPALIVE_ID)
  if (existente instanceof HTMLAudioElement) {
    audioSilencioso = existente
    return audioSilencioso
  }

  audioSilencioso = document.createElement("audio")
  audioSilencioso.id = AUDIO_KEEPALIVE_ID
  audioSilencioso.src = SILENCE_URL
  audioSilencioso.loop = true
  audioSilencioso.volume = 0.04
  audioSilencioso.preload = "auto"
  audioSilencioso.setAttribute("playsinline", "true")
  audioSilencioso.setAttribute("webkit-playsinline", "true")
  audioSilencioso.setAttribute("x-webkit-airplay", "allow")
  document.body.appendChild(audioSilencioso)
  return audioSilencioso
}

function iniciarAudioContextSilencioso(): void {
  if (typeof window === "undefined") return
  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return

  if (!audioCtx) audioCtx = new Ctx()
  if (audioCtx.state === "suspended") void audioCtx.resume()

  if (osciladorSilencioso) return

  osciladorSilencioso = audioCtx.createOscillator()
  gananciaSilenciosa = audioCtx.createGain()
  gananciaSilenciosa.gain.value = 0.0001
  osciladorSilencioso.frequency.value = 440
  osciladorSilencioso.connect(gananciaSilenciosa)
  gananciaSilenciosa.connect(audioCtx.destination)
  osciladorSilencioso.start()
}

function iniciarElementoAudioSilencioso(): void {
  const el = obtenerAudioSilencioso()
  if (!el.paused) return
  const promesa = el.play()
  if (promesa) promesa.catch(() => {})
}

function reforzarAudioEnSegundoPlano(): void {
  if (!reproduccionTtsActiva) return

  iniciarAudioContextSilencioso()
  if (audioCtx?.state === "suspended") void audioCtx.resume()
  iniciarElementoAudioSilencioso()

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const syn = window.speechSynthesis
    if (syn.speaking && !syn.paused) {
      syn.pause()
      syn.resume()
    }
  }
}

/** Llamar en el mismo gesto del usuario (click/touch) antes de speak(). */
export function prepararSintesisEnGesto(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  precargarVocesSintesis()
  const syn = window.speechSynthesis
  syn.cancel()
  syn.resume()
  iniciarAudioContextSilencioso()
  iniciarElementoAudioSilencioso()
}

export function activarAudioSilencioso(): void {
  if (typeof window === "undefined") return
  usuariosAudioSilencioso++
  actualizarEstadoReproduccionTts()
  iniciarAudioContextSilencioso()
  iniciarElementoAudioSilencioso()
  iniciarMantenimientoTts()
}

export function desactivarAudioSilencioso(): void {
  usuariosAudioSilencioso = Math.max(0, usuariosAudioSilencioso - 1)
  if (usuariosAudioSilencioso > 0) return

  actualizarEstadoReproduccionTts()

  audioSilencioso?.pause()
  if (audioSilencioso) audioSilencioso.currentTime = 0

  if (osciladorSilencioso) {
    try {
      osciladorSilencioso.stop()
    } catch {
      /* ya detenido */
    }
    osciladorSilencioso.disconnect()
    osciladorSilencioso = null
  }
  gananciaSilenciosa = null

  if (audioCtx?.state === "running") void audioCtx.suspend()

  detenerMantenimientoTts()
}

export function hablarUtterance(utterance: SpeechSynthesisUtterance): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  reforzarAudioEnSegundoPlano()
  const syn = window.speechSynthesis
  if (esDispositivoMovil()) {
    syn.cancel()
    syn.resume()
  }
  syn.speak(utterance)
}

/** Evita que iOS/Android congelen la voz al bloquear pantalla o cambiar de app. */
export function iniciarMantenimientoTts(): void {
  if (!esDispositivoMovil()) return
  detenerMantenimientoTts()
  intervaloMantenimiento = setInterval(reforzarAudioEnSegundoPlano, 2000)
}

export function detenerMantenimientoTts(): void {
  if (intervaloMantenimiento) {
    clearInterval(intervaloMantenimiento)
    intervaloMantenimiento = null
  }
}

/** @deprecated Usar iniciarMantenimientoTts */
export function iniciarMantenimientoIos(): void {
  iniciarMantenimientoTts()
}

/** @deprecated Usar detenerMantenimientoTts */
export function detenerMantenimientoIos(): void {
  detenerMantenimientoTts()
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

function registrarListenersGlobales(): void {
  if (listenersRegistrados || typeof document === "undefined") return
  listenersRegistrados = true

  document.addEventListener("visibilitychange", () => {
    if (reproduccionTtsActiva) reforzarAudioEnSegundoPlano()
  })

  window.addEventListener("pagehide", () => {
    if (reproduccionTtsActiva) reforzarAudioEnSegundoPlano()
  })

  window.addEventListener("pageshow", () => {
    if (reproduccionTtsActiva) reforzarAudioEnSegundoPlano()
  })

  window.addEventListener("focus", () => {
    if (reproduccionTtsActiva) reforzarAudioEnSegundoPlano()
  })
}

export function registrarPrecargaVocesEnApp(): () => void {
  if (typeof window === "undefined") return () => {}
  registrarListenersGlobales()

  const fn = () => precargarVocesSintesis()
  document.addEventListener("touchstart", fn, { passive: true })
  document.addEventListener("click", fn, { passive: true })

  return () => {
    document.removeEventListener("touchstart", fn)
    document.removeEventListener("click", fn)
  }
}
