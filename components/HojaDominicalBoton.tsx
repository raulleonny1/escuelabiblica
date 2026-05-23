"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { getHojaDominicalUrl } from "@/lib/hojaDominical"

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[240px] items-center justify-center">
      <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
})

type HojaDominicalBotonProps = {
  semana: number
  fecha?: string
  className?: string
}

export default function HojaDominicalBoton({
  semana,
  fecha,
  className = "",
}: HojaDominicalBotonProps) {
  const [abierto, setAbierto] = useState(false)
  const pdfUrl = getHojaDominicalUrl(semana)

  useEffect(() => {
    if (!abierto) return
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
  }, [abierto])

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`inline-flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center transition hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98] ${className}`}
        aria-haspopup="dialog"
      >
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
      </button>

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
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-primary px-4 py-3 text-white sm:px-5">
              <div>
                <h2 id="hoja-dominical-titulo" className="font-display text-base font-semibold sm:text-lg">
                  Hoja dominical
                </h2>
                <p className="text-[0.6875rem] text-white/75 sm:text-xs">Semana {semana}</p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg leading-none text-white transition hover:bg-white/30"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 bg-slate-100">
              <PdfViewer
                url={pdfUrl}
                irAlDiaLectura
                semana={semana}
                fechaLectura={fecha}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
