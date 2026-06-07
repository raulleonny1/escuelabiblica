import type { BloqueLeccion } from "@/lib/lecciones"

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

export function cargarVocesSintesis(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!sintesisVozDisponible()) {
      resolve([])
      return
    }

    const actuales = window.speechSynthesis.getVoices()
    if (actuales.length > 0) {
      resolve(actuales)
      return
    }

    const fin = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", fin)
      resolve(window.speechSynthesis.getVoices())
    }

    window.speechSynthesis.addEventListener("voiceschanged", fin)
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", fin)
      resolve(window.speechSynthesis.getVoices())
    }, 800)
  })
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

  setCallbacks(callbacks: CallbacksLector) {
    this.callbacks = callbacks
  }

  async iniciar(bloques: BloqueLeccion[]) {
    getLectorPasajeVoz().detener()
    const texto = textoLeccionParaAudio(bloques)
    await this.iniciarTexto(texto)
  }

  async iniciarTexto(texto: string) {
    if (!sintesisVozDisponible()) return

    this.detener()
    this.fragmentos = partirEnFragmentos(texto)
    if (this.fragmentos.length === 0) return

    const voces = await cargarVocesSintesis()
    this.voz = elegirVozEspanol(voces)
    this.indice = 0
    this.cambiarEstado("playing")
    this.hablarSiguiente()
  }

  pausar() {
    if (!sintesisVozDisponible() || this.estado !== "playing") return
    // cancel() es más fiable que speechSynthesis.pause() (Chrome/Android suele ignorarlo).
    this.generacion += 1
    window.speechSynthesis.cancel()
    this.cambiarEstado("paused")
  }

  reanudar() {
    if (!sintesisVozDisponible() || this.estado !== "paused") return
    if (this.fragmentos.length === 0 || this.indice >= this.fragmentos.length) return
    this.cambiarEstado("playing")
    this.hablarSiguiente()
  }

  /** Salta fragmentos (≈ frases) hacia adelante y sigue leyendo. */
  adelantar(saltos = 2) {
    if (!sintesisVozDisponible()) return
    if (this.estado === "idle" || this.fragmentos.length === 0) return

    this.generacion += 1
    window.speechSynthesis.cancel()

    this.indice = Math.min(this.indice + Math.max(1, saltos), this.fragmentos.length)
    this.notificarProgreso()

    if (this.indice >= this.fragmentos.length) {
      this.fragmentos = []
      this.indice = 0
      this.cambiarEstado("idle")
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
    if (this.estado !== "idle") this.cambiarEstado("idle")
  }

  getEstado(): EstadoLector {
    return this.estado
  }

  private cambiarEstado(estado: EstadoLector) {
    this.estado = estado
    this.callbacks.onEstado?.(estado)
  }

  private notificarProgreso() {
    if (this.fragmentos.length === 0) return
    this.callbacks.onProgreso?.(this.indice + 1, this.fragmentos.length)
  }

  private hablarSiguiente() {
    if (!sintesisVozDisponible() || this.estado !== "playing") return

    if (this.indice >= this.fragmentos.length) {
      this.detener()
      this.callbacks.onFin?.()
      return
    }

    const gen = (this.generacion += 1)
    this.notificarProgreso()

    const utterance = new SpeechSynthesisUtterance(this.fragmentos[this.indice])
    utterance.lang = this.voz?.lang ?? "es-ES"
    if (this.voz) utterance.voice = this.voz
    utterance.rate = 1
    utterance.pitch = 1

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

    window.speechSynthesis.speak(utterance)
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

/** Pausa el estudio si estaba sonando al abrir un pasaje bíblico flotante. */
export function alAbrirPasajeBiblico() {
  const lector = getLectorLeccionVoz()
  if (lector.getEstado() === "playing") {
    lector.pausar()
    reanudarLeccionTrasPasaje = true
  }
}

/** Detiene el audio del pasaje y reanuda el estudio si se había pausado al abrir. */
export function alCerrarPasajeBiblico() {
  getLectorPasajeVoz().detener()
  if (reanudarLeccionTrasPasaje) {
    reanudarLeccionTrasPasaje = false
    getLectorLeccionVoz().reanudar()
  }
}
