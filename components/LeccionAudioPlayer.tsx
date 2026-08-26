"use client"

import type { BloqueLeccion } from "@/lib/lecciones"
import { sintesisVozDisponible, textoLeccionParaAudio } from "@/lib/leccionTts"

type LeccionAudioPlayerProps = {
  bloques: BloqueLeccion[]
  etiquetaDia: string
  onAbrirAudioEstudio?: () => void
}

/** Acceso compacto al módulo Audio del estudio (no detiene el miniplayer). */
export default function LeccionAudioPlayer({
  bloques,
  etiquetaDia,
  onAbrirAudioEstudio,
}: LeccionAudioPlayerProps) {
  const hayTexto = textoLeccionParaAudio(bloques).length > 0
  const soportado = typeof window !== "undefined" && sintesisVozDisponible()

  if (!soportado || !hayTexto || !onAbrirAudioEstudio) return null

  return (
    <div className="mt-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium text-primary">Audio del estudio</span>
          <span className="hidden text-[0.6875rem] text-muted sm:inline">
            {" "}
            · {etiquetaDia.split(" —")[0]}
          </span>
        </div>
        <button
          type="button"
          onClick={onAbrirAudioEstudio}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white active:opacity-90"
          aria-label="Abrir Audio del estudio"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path
              d="M3 12a5 5 0 0 1 5-5h1v10H8a5 5 0 0 1-5-5Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M21 12a5 5 0 0 0-5-5h-1v10h1a5 5 0 0 0 5-5Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M9 7V6a3 3 0 0 1 6 0v1"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <circle cx="7.5" cy="16.5" r="1.2" fill="currentColor" />
            <circle cx="16.5" cy="16.5" r="1.2" fill="currentColor" />
          </svg>
          Escuchar
        </button>
      </div>
    </div>
  )
}
