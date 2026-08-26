"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import Image from "next/image"
import type { BloqueLeccion, DiaLeccionId } from "@/lib/lecciones"
import { getBloquesDia, getLeccionPorSemana } from "@/lib/lecciones"
import {
  resolverAudioLeccion,
  type AudioLeccionSesion,
} from "@/lib/audiosLeccion"
import {
  getLectorLeccionVoz,
  getLectorPasajeVoz,
  prepararSintesisEnGesto,
  sintesisVozDisponible,
  textoLeccionParaAudio,
  VELOCIDADES_AUDIO,
  type VelocidadAudio,
} from "@/lib/leccionTts"
import { useMenuNavegacion } from "@/components/MenuNavegacion"

export type EstadoAudioUi =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "error"
  | "unavailable"

type AudioEstudioContextValue = {
  sesion: AudioLeccionSesion | null
  estado: EstadoAudioUi
  progreso: { actual: number; total: number }
  tiempo: { actual: number; total: number }
  velocidad: VelocidadAudio
  volumen: number
  panelAbierto: boolean
  cargarSesion: (semana: number, dia: DiaLeccionId) => void
  reproducir: () => void
  alternarPausa: () => void
  detener: () => void
  saltarSegundos: (delta: number) => void
  buscarFraccion: (fraccion: number) => void
  setVelocidad: (v: VelocidadAudio) => void
  setVolumen: (v: number) => void
  abrirPanelAudio: () => void
  cerrarPanelAudio: () => void
}

const AudioEstudioContext = createContext<AudioEstudioContextValue | null>(null)

function formatTiempo(seg: number): string {
  if (!Number.isFinite(seg) || seg < 0) return "0:00"
  const s = Math.floor(seg)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, "0")}`
}

export function AudioEstudioProvider({ children }: { children: ReactNode }) {
  const { panel, abrirPanel } = useMenuNavegacion()
  const [sesion, setSesion] = useState<AudioLeccionSesion | null>(null)
  const [estado, setEstado] = useState<EstadoAudioUi>("idle")
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 })
  const [tiempo, setTiempo] = useState({ actual: 0, total: 0 })
  const [velocidad, setVelocidadState] = useState<VelocidadAudio>(1)
  const [volumen, setVolumenState] = useState(1)
  const [cargando, setCargando] = useState(false)
  const archivoAudioRef = useRef<HTMLAudioElement | null>(null)
  const bloquesRef = useRef<BloqueLeccion[]>([])
  const sesionRef = useRef<AudioLeccionSesion | null>(null)

  const panelAbierto = panel === "audio"

  useEffect(() => {
    const lector = getLectorLeccionVoz()
    lector.setCallbacks({
      onEstado: (e) => {
        if (sesionRef.current?.modo === "archivo") return
        setEstado(e === "idle" ? "ready" : e)
        if (e === "idle") setCargando(false)
      },
      onFin: () => {
        if (sesionRef.current?.modo === "archivo") return
        setEstado("ready")
        setProgreso({ actual: 0, total: 0 })
        setTiempo({ actual: 0, total: 0 })
        setCargando(false)
      },
      onProgreso: (actual, total) => {
        if (sesionRef.current?.modo === "archivo") return
        setProgreso({ actual, total })
      },
      onTiempo: (actual, total) => {
        if (sesionRef.current?.modo === "archivo") return
        setTiempo({ actual, total })
      },
      onCargando: setCargando,
      onError: () => {
        setEstado("error")
        setCargando(false)
      },
    })
    return () => {
      // No detener audio al desmontar el provider (solo al cerrar la app)
      lector.setCallbacks({})
    }
  }, [])

  const detenerArchivo = useCallback(() => {
    const a = archivoAudioRef.current
    if (!a) return
    a.pause()
    a.removeAttribute("src")
    a.load()
    archivoAudioRef.current = null
  }, [])

  const cargarSesion = useCallback((semana: number, dia: DiaLeccionId) => {
    const meta = resolverAudioLeccion(semana, dia)
    const leccion = getLeccionPorSemana(semana)
    const bl = leccion ? getBloquesDia(leccion, dia) : []
    const hayTexto = textoLeccionParaAudio(bl).length > 0

    sesionRef.current = meta
    bloquesRef.current = bl
    setSesion(meta)
    setProgreso({ actual: 0, total: 0 })
    setTiempo({ actual: 0, total: 0 })

    if (!meta.disponible || (!hayTexto && meta.modo === "tts" && !meta.urlAudio)) {
      setEstado("unavailable")
      return
    }
    if (!sintesisVozDisponible() && meta.modo === "tts") {
      setEstado("unavailable")
      return
    }
    setEstado("ready")
  }, [])

  const reproducirArchivo = useCallback(() => {
    const meta = sesionRef.current
    if (!meta?.urlAudio) return
    getLectorLeccionVoz().detener()
    detenerArchivo()

    const audio = new Audio(meta.urlAudio)
    audio.preload = "auto"
    audio.playbackRate = velocidad
    audio.volume = volumen
    archivoAudioRef.current = audio
    setCargando(true)
    setEstado("loading")

    audio.onloadedmetadata = () => {
      setTiempo({ actual: 0, total: audio.duration || meta.duracionSeg || 0 })
      setCargando(false)
      setEstado("playing")
    }
    audio.ontimeupdate = () => {
      setTiempo({
        actual: audio.currentTime,
        total: audio.duration || meta.duracionSeg || 0,
      })
    }
    audio.onended = () => {
      setEstado("ready")
      setTiempo((t) => ({ actual: 0, total: t.total }))
    }
    audio.onerror = () => {
      setEstado("error")
      setCargando(false)
    }

    void audio.play().catch(() => {
      setEstado("error")
      setCargando(false)
    })
  }, [detenerArchivo, velocidad, volumen])

  const reproducir = useCallback(() => {
    const meta = sesionRef.current
    if (!meta || meta.disponible === false) {
      setEstado("unavailable")
      return
    }
    prepararSintesisEnGesto()
    getLectorPasajeVoz().detener()

    if (meta.modo === "archivo" && meta.urlAudio) {
      const a = archivoAudioRef.current
      if (a && a.paused && a.src) {
        void a.play()
        setEstado("playing")
        return
      }
      reproducirArchivo()
      return
    }

    const bl = bloquesRef.current
    if (textoLeccionParaAudio(bl).length === 0) {
      setEstado("unavailable")
      return
    }
    detenerArchivo()
    const lector = getLectorLeccionVoz()
    lector.setVelocidad(velocidad)
    lector.setVolumen(volumen)
    setEstado("loading")
    lector.iniciar(bl)
  }, [detenerArchivo, reproducirArchivo, velocidad, volumen])

  const alternarPausa = useCallback(() => {
    const meta = sesionRef.current
    if (meta?.modo === "archivo") {
      const a = archivoAudioRef.current
      if (!a) {
        reproducir()
        return
      }
      if (a.paused) {
        void a.play()
        setEstado("playing")
      } else {
        a.pause()
        setEstado("paused")
      }
      return
    }

    const lector = getLectorLeccionVoz()
    const actual = lector.getEstado()
    if (actual === "playing") lector.pausar()
    else if (actual === "paused") {
      prepararSintesisEnGesto()
      lector.reanudar()
    } else reproducir()
  }, [reproducir])

  const detener = useCallback(() => {
    detenerArchivo()
    getLectorLeccionVoz().detener()
    setEstado(sesionRef.current?.disponible ? "ready" : "unavailable")
    setProgreso({ actual: 0, total: 0 })
    setTiempo({ actual: 0, total: 0 })
    setCargando(false)
  }, [detenerArchivo])

  const saltarSegundos = useCallback(
    (delta: number) => {
      const meta = sesionRef.current
      if (meta?.modo === "archivo") {
        const a = archivoAudioRef.current
        if (!a || !Number.isFinite(a.duration)) return
        a.currentTime = Math.min(Math.max(0, a.currentTime + delta), a.duration)
        return
      }
      getLectorLeccionVoz().saltarSegundos(delta)
    },
    []
  )

  const buscarFraccion = useCallback((fraccion: number) => {
    const meta = sesionRef.current
    if (meta?.modo === "archivo") {
      const a = archivoAudioRef.current
      if (!a || !Number.isFinite(a.duration) || a.duration <= 0) return
      a.currentTime = fraccion * a.duration
      return
    }
    getLectorLeccionVoz().buscarFraccion(fraccion)
  }, [])

  const setVelocidad = useCallback((v: VelocidadAudio) => {
    setVelocidadState(v)
    getLectorLeccionVoz().setVelocidad(v)
    if (archivoAudioRef.current) archivoAudioRef.current.playbackRate = v
  }, [])

  const setVolumen = useCallback((v: number) => {
    const n = Math.min(1, Math.max(0, v))
    setVolumenState(n)
    getLectorLeccionVoz().setVolumen(n)
    if (archivoAudioRef.current) archivoAudioRef.current.volume = n
  }, [])

  const abrirPanelAudio = useCallback(() => {
    abrirPanel("audio")
  }, [abrirPanel])

  const cerrarPanelAudio = useCallback(() => {
    // El cierre lo hace MenuNavegacion.cerrarPanel desde la UI
  }, [])

  const value = useMemo(
    () => ({
      sesion,
      estado: cargando && estado !== "playing" && estado !== "paused" ? "loading" : estado,
      progreso,
      tiempo,
      velocidad,
      volumen,
      panelAbierto,
      cargarSesion,
      reproducir,
      alternarPausa,
      detener,
      saltarSegundos,
      buscarFraccion,
      setVelocidad,
      setVolumen,
      abrirPanelAudio,
      cerrarPanelAudio,
    }),
    [
      sesion,
      estado,
      cargando,
      progreso,
      tiempo,
      velocidad,
      volumen,
      panelAbierto,
      cargarSesion,
      reproducir,
      alternarPausa,
      detener,
      saltarSegundos,
      buscarFraccion,
      setVelocidad,
      setVolumen,
      abrirPanelAudio,
      cerrarPanelAudio,
    ]
  )

  const mostrarMini =
    !panelAbierto &&
    (estado === "playing" || estado === "paused") &&
    sesion != null

  useEffect(() => {
    document.body.dataset.audioMini = mostrarMini ? "1" : "0"
    return () => {
      delete document.body.dataset.audioMini
    }
  }, [mostrarMini])

  return (
    <AudioEstudioContext.Provider value={value}>
      {children}
      {mostrarMini && (
        <MiniPlayerAudio
          titulo={sesion.titulo}
          descripcion={sesion.descripcion}
          imagen={sesion.imagen}
          estado={estado}
          tiempo={tiempo}
          onToggle={alternarPausa}
          onAbrir={abrirPanelAudio}
        />
      )}
    </AudioEstudioContext.Provider>
  )
}

function MiniPlayerAudio({
  titulo,
  descripcion,
  imagen,
  estado,
  tiempo,
  onToggle,
  onAbrir,
}: {
  titulo: string
  descripcion: string
  imagen: string
  estado: EstadoAudioUi
  tiempo: { actual: number; total: number }
  onToggle: () => void
  onAbrir: () => void
}) {
  const pct =
    tiempo.total > 0 ? Math.min(100, (tiempo.actual / tiempo.total) * 100) : 0

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-primary/20 bg-[#f7f4ec]/95 shadow-[0_-4px_24px_rgba(15,118,110,0.12)] backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto h-0.5 w-full max-w-[1800px] bg-primary/15">
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-3 py-2.5 sm:px-4">
        <button
          type="button"
          onClick={onAbrir}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-label="Abrir Audio del estudio"
        >
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-primary/20 bg-primary/10">
            <Image src={imagen} alt="" fill sizes="44px" className="object-cover" unoptimized />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-primary">{titulo}</span>
            <span className="block truncate text-xs text-muted">
              {formatTiempo(tiempo.actual)} / {formatTiempo(tiempo.total)} · {descripcion}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md active:opacity-90"
          aria-label={estado === "playing" ? "Pausar" : "Reproducir"}
        >
          <span className="text-lg" aria-hidden>
            {estado === "playing" ? "⏸" : "▶"}
          </span>
        </button>
      </div>
    </div>
  )
}

export function useAudioEstudio() {
  const ctx = useContext(AudioEstudioContext)
  if (!ctx) {
    throw new Error("useAudioEstudio debe usarse dentro de AudioEstudioProvider")
  }
  return ctx
}

export { formatTiempo, VELOCIDADES_AUDIO }
