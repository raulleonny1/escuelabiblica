"use client"

import { useEffect, useState } from "react"
import { useSesion } from "@/components/SesionProvider"
import {
  guardarComentarioLectura,
  leerComentariosLecturaLocal,
  subscribeComentariosLectura,
} from "@/lib/comentariosLectura"
import {
  etiquetaFechaLectura,
  fechaHoyLocal,
  getLecturaDelDia,
  PLAN_LECTURA_FIN,
  PLAN_LECTURA_INICIO,
} from "@/lib/lecturaDia"

type Props = {
  abierto: boolean
  onCerrar: () => void
}

export default function LecturaDiaModal({ abierto, onCerrar }: Props) {
  const { usuarioId } = useSesion()
  const fecha = fechaHoyLocal()
  const lectura = getLecturaDelDia(fecha)
  const [comentario, setComentario] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState("")

  useEffect(() => {
    if (!abierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [abierto, onCerrar])

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
      () => {
        /* offline: ya cargamos local */
      }
    )
  }, [abierto, usuarioId, fecha])

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

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lectura-dia-titulo"
      onClick={onCerrar}
    >
      <div
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-primary px-4 py-3 text-white sm:px-5">
          <div>
            <h2 id="lectura-dia-titulo" className="font-display text-base font-semibold sm:text-lg">
              Lectura del día
            </h2>
            <p className="text-[0.6875rem] capitalize text-white/75 sm:text-xs">
              {etiquetaFechaLectura(fecha)}
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg leading-none text-white transition hover:bg-white/30"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="custom-scroll min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {lectura ? (
            <>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary/70">
                Dios nos habla cada día
              </p>
              <ul className="space-y-2.5 rounded-xl border border-primary/15 bg-primary/5 p-4">
                <li className="text-base font-semibold text-slate-800">{lectura.at.etiqueta}</li>
                <li className="text-base font-semibold text-slate-800">{lectura.salmo.etiqueta}</li>
                <li className="text-base font-semibold text-slate-800">
                  {lectura.apocalipsis.etiqueta}
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted">
                Plan {PLAN_LECTURA_INICIO.slice(8)}/{PLAN_LECTURA_INICIO.slice(5, 7)} –{" "}
                {PLAN_LECTURA_FIN.slice(8)}/{PLAN_LECTURA_FIN.slice(5, 7)}/2026 · lunes a sábado
              </p>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Tu comentario de hoy
                </span>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Escribe una reflexión, oración o nota sobre la lectura…"
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
            </>
          ) : (
            <div className="rounded-xl border border-border bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="font-semibold text-slate-800">Hoy no hay lectura programada.</p>
              <p className="mt-2">
                El plan va de lunes a sábado, del 26 de octubre al 25 de noviembre de 2026. Los
                domingos no hay lectura asignada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
