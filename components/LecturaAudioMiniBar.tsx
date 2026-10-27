"use client"

import { useEffect, useState } from "react"
import {
  alternarPausaLecturaAudio,
  detenerLecturaAudio,
  getLecturaAudioSnapshot,
  pedirAbrirLecturaDia,
  subscribeLecturaAudio,
  type LecturaAudioSnapshot,
} from "@/lib/lecturaAudio"

/** Barra fija como «Audio del estudio»: sigue sonando al cerrar la ventana o cambiar de app. */
export default function LecturaAudioMiniBar() {
  const [snap, setSnap] = useState<LecturaAudioSnapshot>(() => getLecturaAudioSnapshot())

  useEffect(() => subscribeLecturaAudio(() => setSnap(getLecturaAudioSnapshot())), [])

  const visible = snap.estado === "playing" || snap.estado === "paused"
  if (!visible) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[56] border-t border-primary/20 bg-[#f7f4ec]/95 shadow-[0_-4px_24px_rgba(15,118,110,0.12)] backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[1800px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={pedirAbrirLecturaDia}
          className="min-w-0 flex-1 text-left"
          aria-label="Abrir Lectura del día"
        >
          <span className="block truncate text-sm font-semibold text-primary">
            Lectura del día
          </span>
          <span className="block truncate text-xs text-muted">
            {snap.titulo}
            {snap.estado === "paused" ? " · Pausado" : " · Reproduciendo"}
          </span>
        </button>

        <button
          type="button"
          onClick={alternarPausaLecturaAudio}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md active:opacity-90"
          aria-label={snap.estado === "playing" ? "Pausar" : "Reproducir"}
        >
          <span className="text-lg" aria-hidden>
            {snap.estado === "playing" ? "⏸" : "▶"}
          </span>
        </button>

        <button
          type="button"
          onClick={detenerLecturaAudio}
          className="flex h-11 shrink-0 items-center justify-center rounded-full border border-border bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm active:bg-slate-50"
          aria-label="Cerrar lectura (detener audio)"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
