import type { BloqueLeccion } from "@/lib/lecciones"
import { normalizarTextoParaTts } from "@/lib/ttsNormalizar"
import {
  activarAudioSilencioso,
  actualizarSesionMedia,
  configurarSesionMedia,
  desactivarAudioSilencioso,
  esDispositivoIOS,
  esDispositivoMovil,
  hablarUtterance,
  limpiarSesionMedia,
  obtenerVocesCacheadas,
  prepararSintesisEnGesto,
  registrarReanudarVoz,
} from "@/lib/sintesisVozIos"
import { actualizarPosicionMedia, urlAudioTts, usarAudioServidorEnDispositivo } from "@/lib/ttsServidor"
import {
  configurarSesionAudioIos,
  crearAudioPrecargadoIos,
  detenerMantenimientoAudioIos,
  iniciarMantenimientoAudioIos,
  limpiarHandlersAudio,
  obtenerReproductorAudioIos,
  pausarReproductorIos,
} from "@/lib/ttsIos"

export { prepararSintesisEnGesto, precargarVocesSintesis } from "@/lib/sintesisVozIos"

export function sintesisVozDisponible(): boolean {
  if (typeof window === "undefined") return false
  if (esDispositivoMovil()) return true
  return "speechSynthesis" in window
}

/** Texto continuo para leer el estudio del día. */
export function textoLeccionParaAudio(bloques: BloqueLeccion[]): string {
  if (bloques.length === 0) return ""
  return bloques
    .map((b) => {
      const cuerpo = b.texto.replace(/\n+/g, " ").replace(/\s+/g, " ").trim()
      return `${b.titulo}. ${cuerpo}`
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}

function partirEnFragmentos(texto: string, maxLen = 260): string[] {
  if (!texto) return []
  const frases = texto.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [texto]
  const partes: string[] = []

  for (const frase of frases) {
    const trozo = frase.trim()
    if (!trozo) continue
    if (trozo.length <= maxLen) {
      partes.push(trozo)
      continue
    }
    let resto = trozo
    while (resto.length > maxLen) {
      let corte = resto.lastIndexOf(" ", maxLen)
      if (corte < maxLen * 0.4) corte = maxLen
      partes.push(resto.slice(0, corte).trim())
      resto = resto.slice(corte).trim()
    }
    if (resto) partes.push(resto)
  }

  return partes
}

export function elegirVozEspanol(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const es = voices.filter((v) => /^es(-|$)/i.test(v.lang))
  if (es.length === 0) return null

  const preferidas = ["es-MX", "es-ES", "es-US", "es-419"]
  for (const lang of preferidas) {
    const local = es.find((v) => v.lang.replace("_", "-").toLowerCase() === lang.toLowerCase())
    if (local) return local
    const parcial = es.find((v) =>
      v.lang.replace("_", "-").toLowerCase().startsWith(lang.toLowerCase())
    )
    if (parcial) return parcial
  }

  return es.find((v) => v.localService) ?? es[0] ?? null
}

export function cargarVocesSintesis(): Promise<SpeechSynthesisVoice[]> {
  return Promise.resolve(obtenerVocesCacheadas())
}

type EstadoLector = "idle" | "playing" | "paused"

type CallbacksLector = {
  onEstado?: (estado: EstadoLector) => void
  onFin?: () => void
  onProgreso?: (actual: number, total: number) => void
}

/** Lector secuencial: voz del navegador en PC; audio MP3 en móvil (segundo plano). */
export class LectorLeccionVoz {
  private fragmentos: string[] = []
  private indice = 0
  private voz: SpeechSynthesisVoice | null = null
  private estado: EstadoLector = "idle"
  private callbacks: CallbacksLector = {}
  private generacion = 0
  private tituloMedia = "Estudio bíblico"
  private audioFondoActivo = false
  private usaAudioServidor = false
  private audioActual: HTMLAudioElement | null = null
  private prefetchIos: { indice: number; audio: HTMLAudioElement } | null = null

  setCallbacks(callbacks: CallbacksLector) {
    this.callbacks = callbacks
  }

  iniciar(bloques: BloqueLeccion[]) {
    getLectorPasajeVoz().detener()
    this.iniciarTexto(textoLeccionParaAudio(bloques), bloques[0]?.titulo ?? "Estudio bíblico")
  }

  iniciarTexto(texto: string, tituloMedia = "Estudio bíblico") {
    if (!sintesisVozDisponible()) return

    this.detener()
    this.tituloMedia = tituloMedia
    this.usaAudioServidor = usarAudioServidorEnDispositivo()
    this.fragmentos = partirEnFragmentos(texto, this.usaAudioServidor ? 200 : 260)
    if (this.fragmentos.length === 0) return

    this.voz = elegirVozEspanol(obtenerVocesCacheadas())
    this.indice = 0
    this.activarReproduccionFondo()
    this.cambiarEstado("playing")
    this.hablarSiguiente()
  }

  pausar() {
    if (this.estado !== "playing") return
    if (this.usaAudioServidor && this.audioActual) {
      this.audioActual.pause()
      this.cambiarEstado("paused")
      actualizarSesionMedia("paused")
      return
    }
    this.generacion += 1
    this.pararAudioActual()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    this.cambiarEstado("paused")
    actualizarSesionMedia("paused")
  }

  reanudar() {
    if (this.estado !== "paused") return
    if (this.fragmentos.length === 0 || this.indice >= this.fragmentos.length) return
    if (this.usaAudioServidor && this.audioActual) {
      this.cambiarEstado("playing")
      actualizarSesionMedia("playing")
      void this.audioActual.play().catch(() => this.hablarSiguiente())
      return
    }
    prepararSintesisEnGesto()
    this.activarReproduccionFondo()
    this.cambiarEstado("playing")
    actualizarSesionMedia("playing")
    this.hablarSiguiente()
  }

  adelantar(saltos = 2) {
    if (this.estado === "idle" || this.fragmentos.length === 0) return

    this.generacion += 1
    this.pararAudioActual()
    if (!this.usaAudioServidor) window.speechSynthesis.cancel()

    this.indice = Math.min(this.indice + Math.max(1, saltos), this.fragmentos.length)
    this.notificarProgreso()

    if (this.indice >= this.fragmentos.length) {
      this.finalizarReproduccion()
      this.callbacks.onFin?.()
      return
    }

    this.cambiarEstado("playing")
    this.hablarSiguiente()
  }

  getProgreso(): { actual: number; total: number } {
    return {
      actual: Math.min(this.indice + 1, this.fragmentos.length || 1),
      total: this.fragmentos.length,
    }
  }

  detener() {
    this.generacion += 1
    this.prefetchIos = null
    this.pararAudioActual()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    this.fragmentos = []
    this.indice = 0
    this.desactivarReproduccionFondo()
    if (this.estado !== "idle") this.cambiarEstado("idle")
  }

  getEstado(): EstadoLector {
    return this.estado
  }

  reanudarSiCallo() {
    if (this.estado !== "playing") return
    if (this.fragmentos.length === 0 || this.indice >= this.fragmentos.length) return

    if (this.usaAudioServidor) {
      if (this.audioActual) {
        if (this.audioActual.ended) {
          this.indice += 1
          if (esDispositivoIOS()) void this.hablarSiguienteAudioIos()
          else this.hablarSiguiente()
          return
        }
        if (this.audioActual.paused) {
          void this.audioActual.play().catch(() => {
            if (esDispositivoIOS()) void this.hablarSiguienteAudioIos()
            else this.hablarSiguiente()
          })
          return
        }
        return
      }
      if (esDispositivoIOS()) void this.hablarSiguienteAudioIos()
      else this.hablarSiguiente()
      return
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    if (window.speechSynthesis.speaking) return
    this.hablarSiguiente()
  }

  private activarReproduccionFondo() {
    if (this.audioFondoActivo) return
    this.audioFondoActivo = true
    if (!this.usaAudioServidor) {
      activarAudioSilencioso()
    } else if (esDispositivoIOS()) {
      configurarSesionAudioIos()
      iniciarMantenimientoAudioIos(() => this.reanudarSiCallo())
    }
    configurarSesionMedia(this.tituloMedia, {
      onPausa: () => {
        if (this.estado === "playing") this.pausar()
      },
      onPlay: () => {
        if (this.estado === "paused") this.reanudar()
      },
      onStop: () => this.detener(),
    })
  }

  private desactivarReproduccionFondo() {
    if (!this.audioFondoActivo) return
    this.audioFondoActivo = false
    if (!this.usaAudioServidor) desactivarAudioSilencioso()
    if (esDispositivoIOS()) {
      detenerMantenimientoAudioIos()
      this.prefetchIos = null
    }
    limpiarSesionMedia()
  }

  private finalizarReproduccion() {
    this.fragmentos = []
    this.indice = 0
    this.pararAudioActual()
    this.desactivarReproduccionFondo()
    this.cambiarEstado("idle")
  }

  private cambiarEstado(estado: EstadoLector) {
    this.estado = estado
    this.callbacks.onEstado?.(estado)
  }

  private notificarProgreso() {
    if (this.fragmentos.length === 0) return
    this.callbacks.onProgreso?.(this.indice + 1, this.fragmentos.length)
  }

  private pararAudioActual() {
    if (!this.audioActual) return

    if (esDispositivoIOS() && this.usaAudioServidor) {
      pausarReproductorIos(this.audioActual)
      this.audioActual = null
      return
    }

    this.audioActual.onended = null
    this.audioActual.onerror = null
    this.audioActual.ontimeupdate = null
    this.audioActual.onloadedmetadata = null
    this.audioActual.pause()
    this.audioActual.removeAttribute("src")
    this.audioActual.load()
    this.audioActual = null
  }

  private enlazarEventosAudio(
    audio: HTMLAudioElement,
    gen: number,
    alTerminar: () => void
  ) {
    limpiarHandlersAudio(audio)

    audio.onloadedmetadata = () => {
      if (gen !== this.generacion) return
      actualizarPosicionMedia(audio)
    }

    audio.ontimeupdate = () => {
      if (gen !== this.generacion) return
      actualizarPosicionMedia(audio)
    }

    audio.onended = () => {
      if (gen !== this.generacion || this.estado !== "playing") return
      alTerminar()
    }

    audio.onerror = () => {
      if (gen !== this.generacion || this.estado !== "playing") return
      this.pararAudioActual()
      this.usaAudioServidor = false
      this.hablarSiguienteVoz(0)
    }
  }

  private prefetchProximoFragmentoIos(desdeIndice: number) {
    if (!esDispositivoIOS()) return
    const nextIdx = desdeIndice + 1
    if (nextIdx >= this.fragmentos.length) {
      this.prefetchIos = null
      return
    }
    const url = urlAudioTts(this.fragmentos[nextIdx]!)
    this.prefetchIos = { indice: nextIdx, audio: crearAudioPrecargadoIos(url) }
  }

  private crearUtterance(texto: string): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(normalizarTextoParaTts(texto))
    utterance.lang = this.voz?.lang ?? "es-ES"
    if (this.voz) utterance.voice = this.voz
    utterance.rate = 1
    utterance.pitch = 1
    return utterance
  }

  private hablarSiguiente(reintento = 0) {
    if (this.estado !== "playing") return

    if (this.indice >= this.fragmentos.length) {
      this.finalizarReproduccion()
      this.callbacks.onFin?.()
      return
    }

    if (this.usaAudioServidor) {
      if (esDispositivoIOS()) {
        void this.hablarSiguienteAudioIos()
      } else {
        void this.hablarSiguienteAudioAndroid()
      }
      return
    }

    this.hablarSiguienteVoz(reintento)
  }

  /** iPhone/iPad: reproductor persistente + precarga del siguiente fragmento. */
  private async hablarSiguienteAudioIos() {
    if (this.estado !== "playing") return
    if (this.indice >= this.fragmentos.length) return

    const gen = (this.generacion += 1)
    const indiceActual = this.indice
    this.notificarProgreso()

    this.pararAudioActual()

    let audio: HTMLAudioElement
    if (this.prefetchIos?.indice === indiceActual) {
      audio = this.prefetchIos.audio
      this.prefetchIos = null
    } else {
      audio = obtenerReproductorAudioIos()
      audio.src = urlAudioTts(this.fragmentos[indiceActual]!)
      audio.load()
    }

    this.audioActual = audio
    this.enlazarEventosAudio(audio, gen, () => {
      this.pararAudioActual()
      this.indice += 1
      void this.hablarSiguienteAudioIos()
    })

    this.prefetchProximoFragmentoIos(indiceActual)

    try {
      await audio.play()
      actualizarSesionMedia("playing")
    } catch {
      if (gen !== this.generacion) return
      this.pararAudioActual()
      this.usaAudioServidor = false
      this.hablarSiguienteVoz(0)
    }
  }

  /** Android: sin cambios respecto al flujo que ya funciona. */
  private async hablarSiguienteAudioAndroid() {
    if (this.estado !== "playing") return
    if (this.indice >= this.fragmentos.length) return

    const gen = (this.generacion += 1)
    const texto = this.fragmentos[this.indice]!
    this.notificarProgreso()

    this.pararAudioActual()

    const audio = new Audio(urlAudioTts(texto))
    audio.setAttribute("playsinline", "true")
    audio.preload = "auto"
    this.audioActual = audio

    this.enlazarEventosAudio(audio, gen, () => {
      this.pararAudioActual()
      this.indice += 1
      this.hablarSiguiente()
    })

    try {
      await audio.play()
      actualizarSesionMedia("playing")
    } catch {
      if (gen !== this.generacion) return
      this.pararAudioActual()
      this.usaAudioServidor = false
      this.hablarSiguienteVoz(0)
    }
  }

  private hablarSiguienteVoz(reintento = 0) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    if (this.estado !== "playing") return

    if (this.indice >= this.fragmentos.length) {
      this.finalizarReproduccion()
      this.callbacks.onFin?.()
      return
    }

    const gen = (this.generacion += 1)
    const texto = this.fragmentos[this.indice]!
    this.notificarProgreso()

    const utterance = this.crearUtterance(texto)
    const inicio = { ok: false }

    utterance.onstart = () => {
      if (gen !== this.generacion) return
      inicio.ok = true
    }

    utterance.onend = () => {
      if (gen !== this.generacion || this.estado !== "playing") return
      this.indice += 1
      this.hablarSiguiente()
    }

    utterance.onerror = () => {
      if (gen !== this.generacion || this.estado !== "playing") return
      this.indice += 1
      this.hablarSiguiente()
    }

    hablarUtterance(utterance)

    if (esDispositivoIOS() && reintento === 0) {
      window.setTimeout(() => {
        if (inicio.ok || gen !== this.generacion || this.estado !== "playing") return
        this.generacion += 1
        window.speechSynthesis.cancel()
        this.hablarSiguienteVoz(1)
      }, 450)
    }
  }
}

let lectorSingleton: LectorLeccionVoz | null = null
let lectorPasajeSingleton: LectorLeccionVoz | null = null
let reanudarLeccionTrasPasaje = false

export function getLectorLeccionVoz(): LectorLeccionVoz {
  if (!lectorSingleton) lectorSingleton = new LectorLeccionVoz()
  return lectorSingleton
}

export function getLectorPasajeVoz(): LectorLeccionVoz {
  if (!lectorPasajeSingleton) lectorPasajeSingleton = new LectorLeccionVoz()
  return lectorPasajeSingleton
}

export function alAbrirPasajeBiblico() {
  const lector = getLectorLeccionVoz()
  if (lector.getEstado() === "playing") {
    lector.pausar()
    reanudarLeccionTrasPasaje = true
  }
}

export function alCerrarPasajeBiblico() {
  getLectorPasajeVoz().detener()
  if (reanudarLeccionTrasPasaje) {
    reanudarLeccionTrasPasaje = false
    prepararSintesisEnGesto()
    getLectorLeccionVoz().reanudar()
  }
}

export function registrarReanudarLectoresEnSegundoPlano(): void {
  registrarReanudarVoz(() => {
    getLectorLeccionVoz().reanudarSiCallo()
    getLectorPasajeVoz().reanudarSiCallo()
  })
}
