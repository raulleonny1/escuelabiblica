"use client"

import { useEffect, useRef, useState } from "react"
import PasajeAudioPlayer from "@/components/PasajeAudioPlayer"
import { useSesion } from "@/components/SesionProvider"
import { cargarBiblia } from "@/lib/bibliaLoader"
import {
  guardarComentarioLectura,
  leerComentariosLecturaLocal,
  subscribeComentariosLectura,
} from "@/lib/comentariosLectura"
import {
  etiquetaFechaLectura,
  fechaHoyLocal,
  getLecturaDelDia,
  type CapituloLectura,
} from "@/lib/lecturaDia"
import {
  extraerTextoPasaje,
  parseReferenciaPasaje,
  textoPasajeParaAudio,
  type TextoPasajeResultado,
} from "@/lib/pasajeBiblico"

type Props = {
  abierto: boolean
  onCerrar: () => void
}

const LIMITE_COMPLETO = Number.POSITIVE_INFINITY

export default function LecturaDiaModal({ abierto, onCerrar }: Props) {
  const { usuarioId } = useSesion()
  const fecha = fechaHoyLocal()
  const lectura = getLecturaDelDia(fecha)
  const capitulos = lectura?.capitulos ?? []

  const [indice, setIndice] = useState(0)
  const [comentario, setComentario] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState("")
  const [cargandoTexto, setCargandoTexto] = useState(false)
  const [resultado, setResultado] = useState<TextoPasajeResultado | null>(null)
  const [errorTexto, setErrorTexto] = useState("")
  const [vistaComentario, setVistaComentario] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const total = capitulos.length
  const actual: CapituloLectura | null = capitulos[indice] ?? null
  const esPrimero = indice <= 0
  const esUltimo = total > 0 && indice >= total - 1

  useEffect(() => {
    if (!abierto) return
    setIndice(0)
    setVistaComentario(false)
    setAviso("")
  }, [abierto, fecha])

  useEffect(() => {
    if (!abierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar()
      if (vistaComentario) return
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault()
        setIndice((i) => Math.min(i + 1, Math.max(total - 1, 0)))
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        setIndice((i) => Math.max(i - 1, 0))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [abierto, onCerrar, vistaComentario, total])

  useEffect(() => {
    if (!abierto || !usuarioId) {
      if (abierto && !usuarioId) setComentario("")
      return
    }
    const local = leerComentariosLecturaLocal(usuarioId)
    setComentario(local[fecha] ?? "")
    return subscribeComentariosLectura(
      usuarioId,
      (data) => setComentario(data[fecha] ?? ""),
      () => {}
    )
  }, [abierto, usuarioId, fecha])

  useEffect(() => {
    if (!abierto || !actual || vistaComentario) {
      if (vistaComentario) setResultado(null)
      return
    }

    let cancelado = false
    setCargandoTexto(true)
    setErrorTexto("")
    setResultado(null)
    scrollRef.current?.scrollTo({ top: 0 })

    const ref = parseReferenciaPasaje(actual.referencia)
    if (!ref) {
      setErrorTexto("No se pudo interpretar la referencia.")
      setCargandoTexto(false)
      return
    }

    cargarBiblia()
      .then((biblia) => {
        if (cancelado) return
        setResultado(extraerTextoPasaje(biblia, ref, { limiteVersos: LIMITE_COMPLETO }))
      })
      .catch(() => {
        if (!cancelado) setErrorTexto("No se pudo cargar la Santa Biblia (RVR 1909).")
      })
      .finally(() => {
        if (!cancelado) setCargandoTexto(false)
      })

    return () => {
      cancelado = true
    }
  }, [abierto, actual, vistaComentario])

  async function guardar() {
    if (!usuarioId) {
      setAviso("Necesitas un nombre de sesión para guardar el comentario.")
      return
    }
    setGuardando(true)
    setAviso("")
    try {
      await guardarComentarioLectura(usuarioId, fecha, comentario)
      setAviso("Comentario guardado.")
    } catch {
      setAviso("No se pudo guardar. Revisa la conexión e inténtalo de nuevo.")
    } finally {
      setGuardando(false)
    }
  }

  function irAnterior() {
    if (vistaComentario) {
      setVistaComentario(false)
      return
    }
    setIndice((i) => Math.max(i - 1, 0))
  }

  function irSiguiente() {
    if (vistaComentario) return
    if (esUltimo) {
      setVistaComentario(true)
      scrollRef.current?.scrollTo({ top: 0 })
      return
    }
    setIndice((i) => Math.min(i + 1, total - 1))
  }

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lectura-dia-titulo"
      onClick={onCerrar}
    >
      <div
        className="relative flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden bg-card shadow-2xl sm:h-[min(94dvh,900px)] sm:rounded-2xl sm:border sm:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-amber-100/90">
              Lectura del día · RVR 1909
            </p>
            <h2 id="lectura-dia-titulo" className="font-display truncate text-lg font-semibold">
              {vistaComentario
                ? "Tu comentario"
                : (resultado?.titulo ?? actual?.etiqueta ?? "Lectura del día")}
            </h2>
            <p className="text-[0.6875rem] capitalize text-white/75">
              {etiquetaFechaLectura(fecha)}
              {lectura && !vistaComentario
                ? ` · ${indice + 1} de ${total}`
                : lectura
                  ? ` · ${lectura.resumen}`
                  : ""}
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl leading-none hover:bg-white/30"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        {lectura && total > 0 && (
          <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-border bg-slate-50 px-3 py-2">
            {capitulos.map((cap, i) => (
              <button
                key={cap.referencia}
                type="button"
                onClick={() => {
                  setVistaComentario(false)
                  setIndice(i)
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  i === indice && !vistaComentario
                    ? "bg-primary text-white"
                    : "bg-white text-slate-700 ring-1 ring-border hover:bg-primary/10"
                }`}
              >
                {cap.etiqueta}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setVistaComentario(true)
                scrollRef.current?.scrollTo({ top: 0 })
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                vistaComentario
                  ? "bg-primary text-white"
                  : "bg-white text-slate-700 ring-1 ring-border hover:bg-primary/10"
              }`}
            >
              Comentario
            </button>
          </div>
        )}

        <div ref={scrollRef} className="custom-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {!lectura ? (
            <div className="rounded-xl border border-border bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="font-semibold text-slate-800">Hoy no hay lectura programada.</p>
              <p className="mt-2">
                El plan va de lunes a sábado, del 26 de octubre al 25 de noviembre de 2026. Los
                domingos no hay lectura asignada.
              </p>
            </div>
          ) : vistaComentario ? (
            <div>
              <p className="mb-3 text-sm text-slate-600">
                Has leído: <span className="font-medium text-slate-800">{lectura.resumen}</span>
              </p>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Escribe tu comentario de hoy
                </span>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={8}
                  maxLength={2000}
                  placeholder="Reflexión, oración o nota sobre la lectura…"
                  className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none ring-primary/30 placeholder:text-slate-400 focus:ring-2"
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void guardar()}
                  disabled={guardando}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                >
                  {guardando ? "Guardando…" : "Guardar comentario"}
                </button>
                {aviso ? <span className="text-xs text-muted">{aviso}</span> : null}
              </div>
            </div>
          ) : (
            <>
              {cargandoTexto && (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Cargando capítulo…
                </div>
              )}

              {errorTexto && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {errorTexto}
                </p>
              )}

              {!cargandoTexto && resultado?.error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {resultado.error}
                </p>
              )}

              {!cargandoTexto && resultado && resultado.versos.length > 0 && (
                <>
                  <div className="mb-3">
                    <PasajeAudioPlayer texto={textoPasajeParaAudio(resultado)} />
                  </div>
                  {resultado.versos.map((v, i) => (
                    <p
                      key={`${actual?.referencia}-${v.capitulo}-${v.numero}-${i}`}
                      className="mb-2.5 text-[1.05rem] leading-relaxed text-slate-800"
                    >
                      <sup className="mr-1.5 font-bold text-primary">{v.numero}</sup>
                      {v.texto}
                    </p>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {lectura && total > 0 && (
          <footer className="flex shrink-0 items-center gap-2 border-t border-border bg-card px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={irAnterior}
              disabled={!vistaComentario && esPrimero}
              className="min-h-11 flex-1 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-primary/8 disabled:opacity-35"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={irSiguiente}
              disabled={vistaComentario}
              className="min-h-11 flex-[1.4] rounded-xl bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-35"
            >
              {vistaComentario
                ? "Listo"
                : esUltimo
                  ? "Comentario →"
                  : "Siguiente capítulo →"}
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
