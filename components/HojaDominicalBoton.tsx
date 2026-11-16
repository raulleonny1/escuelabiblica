"use client"

import { useEffect, useState } from "react"
import { useSesion } from "@/components/SesionProvider"
import { registrarVisitaSitio } from "@/lib/analytics"
import { HOJA_DOMINICAL_PDF_URL } from "@/lib/hojaDominical"

type HojaDominicalBotonProps = {
  semana: number
  fecha?: string
  className?: string
  variant?: "card" | "menu"
  /** Control externo del modal (p. ej. desde el menú). */
  abierto?: boolean
  onAbiertoChange?: (abierto: boolean) => void
  /** Solo muestra el modal, sin botón visible. */
  ocultarBoton?: boolean
}

function urlAbsolutaPdf(): string {
  if (typeof window === "undefined") return HOJA_DOMINICAL_PDF_URL
  return new URL(HOJA_DOMINICAL_PDF_URL, window.location.origin).toString()
}

export default function HojaDominicalBoton({
  semana,
  className = "",
  variant = "card",
  abierto: abiertoExterno,
  onAbiertoChange,
  ocultarBoton = false,
}: HojaDominicalBotonProps) {
  const [abiertoInterno, setAbiertoInterno] = useState(false)
  const [iframeFallido, setIframeFallido] = useState(false)
  const controlado = abiertoExterno !== undefined
  const abierto = controlado ? abiertoExterno : abiertoInterno
  const { usuarioId, nombre } = useSesion()

  function setAbierto(v: boolean) {
    if (!controlado) setAbiertoInterno(v)
    onAbiertoChange?.(v)
  }

  useEffect(() => {
    if (!abierto) {
      setIframeFallido(false)
      return
    }
    if (usuarioId && nombre) registrarVisitaSitio(usuarioId, nombre, "hoja_dominical", 0)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir/cerrar
  }, [abierto])

  function abrir() {
    setAbierto(true)
  }

  function abrirEnPestana() {
    window.open(urlAbsolutaPdf(), "_blank", "noopener,noreferrer")
  }

  const botonClase =
    variant === "menu"
      ? `flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-800 transition hover:bg-primary/8 active:bg-primary/12 ${className}`
      : `inline-flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center transition hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98] ${className}`

  return (
    <>
      {!ocultarBoton && (
        <button
          type="button"
          onClick={abrir}
          className={botonClase}
          aria-haspopup="dialog"
        >
          {variant === "menu" ? (
            <>
              <span className="text-xl" aria-hidden>
                📄
              </span>
              Hoja dominical
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-5 w-5 text-primary"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4" />
              </svg>
              <span className="text-[0.6875rem] font-semibold leading-tight text-primary md:text-xs">
                Hoja
                <br />
                dominical
              </span>
            </>
          )}
        </button>
      )}

      {abierto && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-2 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hoja-dominical-titulo"
          onClick={() => setAbierto(false)}
        >
          <div
            className="relative flex h-[min(92vh,880px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-white sm:px-5">
              <div className="min-w-0">
                <h2
                  id="hoja-dominical-titulo"
                  className="font-display text-base font-semibold sm:text-lg"
                >
                  Hoja dominical
                </h2>
                <p className="text-[0.6875rem] text-white/75 sm:text-xs">Semana {semana}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30"
                  onClick={abrirEnPestana}
                >
                  Abrir PDF
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg leading-none text-white transition hover:bg-white/30"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 bg-slate-100">
              {!iframeFallido ? (
                <iframe
                  title="Hoja dominical PDF"
                  src={HOJA_DOMINICAL_PDF_URL}
                  className="h-full w-full border-0"
                  onError={() => setIframeFallido(true)}
                />
              ) : (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="font-semibold text-slate-800">
                    No se pudo mostrar el PDF aquí
                  </p>
                  <p className="max-w-sm text-sm text-slate-600">
                    En algunos móviles el visor integrado no abre PDFs. Ábrelo en una
                    pestaña nueva.
                  </p>
                  <button
                    type="button"
                    onClick={abrirEnPestana}
                    className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md active:opacity-90"
                  >
                    Abrir hoja dominical
                  </button>
                </div>
              )}
              {/* Atajo siempre visible en móvil (iframe a menudo queda en blanco) */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-slate-900/50 to-transparent p-4 sm:hidden">
                <button
                  type="button"
                  onClick={abrirEnPestana}
                  className="pointer-events-auto rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg active:opacity-90"
                >
                  Abrir / descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
