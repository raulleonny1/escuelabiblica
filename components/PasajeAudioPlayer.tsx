"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getLectorLeccionVoz,
  getLectorPasajeVoz,
  sintesisVozDisponible,
} from "@/lib/leccionTts"

type PasajeAudioPlayerProps = {
  texto: string
}

export default function PasajeAudioPlayer({ texto }: PasajeAudioPlayerProps) {
  const [soportado, setSoportado] = useState(false)
  const [estado, setEstado] = useState<"idle" | "playing" | "paused">("idle")

  const hayTexto = texto.length > 0

  useEffect(() => {
    setSoportado(sintesisVozDisponible())
  }, [])

  const detener = useCallback(() => {
    getLectorPasajeVoz().detener()
  }, [])

  useEffect(() => {
    const lector = getLectorPasajeVoz()
    lector.setCallbacks({
      onEstado: setEstado,
      onFin: () => setEstado("idle"),
    })
    return () => {
      detener()
      lector.setCallbacks({})
    }
  }, [detener])

  useEffect(() => {
    detener()
  }, [texto, detener])

  if (!soportado || !hayTexto) return null

  async function reproducir() {
    const leccion = getLectorLeccionVoz()
    if (leccion.getEstado() === "playing") leccion.pausar()
    await getLectorPasajeVoz().iniciarTexto(texto)
  }

  function alternarPausa() {
    const lector = getLectorPasajeVoz()
    const actual = lector.getEstado()
    if (actual === "playing") lector.pausar()
    else if (actual === "paused") lector.reanudar()
  }

  const enReproduccion = estado === "playing" || estado === "paused"

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-primary/5 px-4 py-2.5">
      <span className="text-xs font-medium text-primary">Escuchar pasaje</span>
      <div className="ml-auto flex flex-wrap gap-1.5">
        {estado === "idle" && (
          <button
            type="button"
            onClick={() => void reproducir()}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white active:opacity-90"
            aria-label="Reproducir pasaje bíblico"
          >
            <span aria-hidden>▶</span>
            Play
          </button>
        )}
        {enReproduccion && (
          <>
            <button
              type="button"
              onClick={alternarPausa}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold active:opacity-90 ${
                estado === "playing"
                  ? "bg-primary text-white"
                  : "border border-primary bg-white text-primary"
              }`}
              aria-label={estado === "playing" ? "Pausar pasaje" : "Reanudar pasaje"}
            >
              <span aria-hidden>{estado === "playing" ? "⏸" : "▶"}</span>
              {estado === "playing" ? "Pausa" : "Seguir"}
            </button>
            <button
              type="button"
              onClick={detener}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-slate-600 active:bg-slate-50"
              aria-label="Detener audio del pasaje"
            >
              <span aria-hidden>⏹</span>
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  )
}
