import type { BloqueLeccion } from "@/lib/lecciones"
import {
  activarAudioSilencioso,
  actualizarSesionMedia,
  configurarSesionMedia,
  desactivarAudioSilencioso,
  esDispositivoIOS,
  hablarUtterance,
  limpiarSesionMedia,
  obtenerVocesCacheadas,
  prepararSintesisEnGesto,
} from "@/lib/sintesisVozIos"

export { prepararSintesisEnGesto, precargarVocesSintesis } from "@/lib/sintesisVozIos"

export function sintesisVozDisponible(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
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

/** @deprecated Usar obtenerVocesCacheadas() dentro del gesto del usuario. */
export function cargarVocesSintesis(): Promise<SpeechSynthesisVoice[]> {
  return Promise.resolve(obtenerVocesCacheadas())
}

type EstadoLector = "idle" | "playing" | "paused"

type CallbacksLector = {
  onEstado?: (estado: EstadoLector) => void
  onFin?: () => void
  onProgreso?: (actual: number, total: number) => void
}

/** Lector secuencial con la voz del navegador. */
export class LectorLeccionVoz {
  private fragmentos: string[] = []
  private indice = 0
  private voz: SpeechSynthesisVoice | null = null
  private estado: EstadoLector = "idle"
  private callbacks: CallbacksLector = {}
  private generacion = 0
  private tituloMedia = "Estudio bíblico"
  private audioFondoActivo = false

  setCallbacks(callbacks: CallbacksLector) {
    this.callbacks = callbacks
  }

  iniciar(bloques: BloqueLeccion[]) {
    getLectorPasajeVoz().detener()
    this.iniciarTexto(textoLeccionParaAudio(bloques), bloques[0]?.titulo ?? "Estudio bíblico")
  }

  /** Debe llamarse en el mismo click/touch que prepararSintesisEnGesto(). */
  iniciarTexto(texto: string, tituloMedia = "Estudio bíblico") {
    if (!sintesisVozDisponible()) return

    this.detener()
    this.tituloMedia = tituloMedia
    this.fragmentos = partirEnFragmentos(texto)
    if (this.fragmentos.length === 0) return

    this.voz = elegirVozEspanol(obtenerVocesCacheadas())
    this.indice = 0
    this.activarReproduccionFondo()
    this.cambiarEstado("playing")
    this.hablarSiguiente()
  }

  pausar() {
    if (!sintesisVozDisponible() || this.estado !== "playing") return
    this.generacion += 1
    window.speechSynthesis.cancel()
    this.cambiarEstado("paused")
    actualizarSesionMedia("paused")
  }

  reanudar() {
    if (!sintesisVozDisponible() || this.estado !== "paused") return
    if (this.fragmentos.length === 0 || this.indice >= this.fragmentos.length) return
    prepararSintesisEnGesto()
    this.activarReproduccionFondo()
    this.cambiarEstado("playing")
    actualizarSesionMedia("playing")
    this.hablarSiguiente()
  }

  adelantar(saltos = 2) {
    if (!sintesisVozDisponible()) return
    if (this.estado === "idle" || this.fragmentos.length === 0) return

    this.generacion += 1
    window.speechSynthesis.cancel()

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
    if (!sintesisVozDisponible()) return
    this.generacion += 1
    window.speechSynthesis.cancel()
    this.fragmentos = []
    this.indice = 0
    this.desactivarReproduccionFondo()
    if (this.estado !== "idle") this.cambiarEstado("idle")
  }

  getEstado(): EstadoLector {
    return this.estado
  }

  private activarReproduccionFondo() {
    if (this.audioFondoActivo) return
    this.audioFondoActivo = true
    activarAudioSilencioso()
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
    desactivarAudioSilencioso()
    limpiarSesionMedia()
  }

  private finalizarReproduccion() {
    this.fragmentos = []
    this.indice = 0
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

  private crearUtterance(texto: string): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = this.voz?.lang ?? "es-ES"
    if (this.voz) utterance.voice = this.voz
    utterance.rate = 1
    utterance.pitch = 1
    return utterance
  }

  private hablarSiguiente(reintento = 0) {
    if (!sintesisVozDisponible() || this.estado !== "playing") return

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
        this.hablarSiguiente(1)
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
