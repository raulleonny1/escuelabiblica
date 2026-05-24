"use client"

import { useEffect, useState } from "react"
import { cargarBiblia } from "@/lib/bibliaLoader"
import {
  extraerTextoPasaje,
  parseReferenciaPasaje,
  type TextoPasajeResultado,
} from "@/lib/pasajeBiblico"

type PasajeBiblicoModalProps = {
  referencia: string
  onCerrar: () => void
}

export default function PasajeBiblicoModal({ referencia, onCerrar }: PasajeBiblicoModalProps) {
  const [cargando, setCargando] = useState(true)
  const [resultado, setResultado] = useState<TextoPasajeResultado | null>(null)

  useEffect(() => {
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
  }, [onCerrar])

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setResultado(null)

    const ref = parseReferenciaPasaje(referencia)
    if (!ref) {
      setResultado({
        titulo: referencia,
        versos: [],
        error: "No se pudo interpretar la referencia bíblica.",
      })
      setCargando(false)
      return
    }

    cargarBiblia()
      .then((biblia) => {
        if (cancelado) return
        setResultado(extraerTextoPasaje(biblia, ref))
      })
      .catch(() => {
        if (cancelado) return
        setResultado({
          titulo: referencia,
          versos: [],
          error: "No se pudo cargar la Santa Biblia (RVR 1909).",
        })
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [referencia])

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center bg-slate-900/55 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pasaje-biblico-titulo"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[min(88vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-amber-100/90">
              Reina-Valera 1909
            </p>
            <h2 id="pasaje-biblico-titulo" className="font-display truncate text-lg font-semibold">
              {resultado?.titulo ?? referencia}
            </h2>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg leading-none hover:bg-white/30"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="custom-scroll min-h-0 flex-1 overflow-y-auto p-4">
          {cargando && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Cargando pasaje…
            </div>
          )}

          {!cargando && resultado?.error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {resultado.error}
            </p>
          )}

          {!cargando && resultado?.aviso && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {resultado.aviso}
            </p>
          )}

          {!cargando &&
            resultado?.versos.map((v, i) => {
              const capAnterior = i > 0 ? resultado.versos[i - 1]!.capitulo : null
              const muestraCap = v.capitulo !== capAnterior
              return (
                <p key={`${v.capitulo}-${v.numero}-${i}`} className="mb-2 text-base leading-relaxed text-slate-800">
                  {muestraCap && (
                    <span className="mr-1 text-xs font-bold uppercase text-primary">
                      Cap. {v.capitulo}{" "}
                    </span>
                  )}
                  <sup className="mr-1 font-bold text-primary">{v.numero}</sup>
                  {v.texto}
                </p>
              )
            })}
        </div>
      </div>
    </div>
  )
}
