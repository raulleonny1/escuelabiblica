"use client"

import { useCallback, useEffect, useState } from "react"
import type { BloqueLeccion } from "@/lib/lecciones"
import {
  getLectorLeccionVoz,
  getLectorPasajeVoz,
  sintesisVozDisponible,
  textoLeccionParaAudio,
} from "@/lib/leccionTts"

type LeccionAudioPlayerProps = {
  bloques: BloqueLeccion[]
  etiquetaDia: string
}

export default function LeccionAudioPlayer({ bloques, etiquetaDia }: LeccionAudioPlayerProps) {
  const [soportado, setSoportado] = useState(false)
  const [estado, setEstado] = useState<"idle" | "playing" | "paused">("idle")
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 })

  const hayTexto = textoLeccionParaAudio(bloques).length > 0

  useEffect(() => {
    setSoportado(sintesisVozDisponible())
  }, [])

  const detener = useCallback(() => {
    getLectorLeccionVoz().detener()
  }, [])

  useEffect(() => {
    const lector = getLectorLeccionVoz()
    lector.setCallbacks({
      onEstado: setEstado,
      onFin: () => {
        setEstado("idle")
        setProgreso({ actual: 0, total: 0 })
      },
      onProgreso: (actual, total) => setProgreso({ actual, total }),
    })
    return () => {
      lector.detener()
      lector.setCallbacks({})
    }
  }, [])

  useEffect(() => {
    detener()
  }, [bloques, detener])

  if (!soportado || !hayTexto) return null

  async function reproducir() {
    getLectorPasajeVoz().detener()
    await getLectorLeccionVoz().iniciar(bloques)
  }

  function alternarPausa() {
    const lector = getLectorLeccionVoz()
    const actual = lector.getEstado()
    if (actual === "playing") lector.pausar()
    else if (actual === "paused") lector.reanudar()
  }

  function adelantar() {
    getLectorLeccionVoz().adelantar(2)
  }

  const enReproduccion = estado === "playing" || estado === "paused"
  const puedeAdelantar = enReproduccion && progreso.total > 0 && progreso.actual < progreso.total

  return (
    <div className="mt-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium text-primary">Escuchar estudio</span>
          <span className="hidden text-[0.6875rem] text-muted sm:inline">
            {" "}
            · {etiquetaDia.split(" —")[0]}
          </span>
          {enReproduccion && (
            <p className="mt-0.5 text-[0.6875rem] font-medium text-slate-700">
              {estado === "playing" ? "Reproduciendo…" : "En pausa"}
              {progreso.total > 0 && (
                <span className="font-normal text-muted">
                  {" "}
                  · Parte {progreso.actual} de {progreso.total}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {estado === "idle" && (
            <button
              type="button"
              onClick={() => void reproducir()}
              className="inline-flex min-h-10 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white active:opacity-90"
              aria-label="Reproducir estudio del día"
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
                className={`inline-flex min-h-10 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold active:opacity-90 ${
                  estado === "playing"
                    ? "bg-primary text-white"
                    : "border-2 border-primary bg-white text-primary"
                }`}
                aria-label={estado === "playing" ? "Pausar audio" : "Reanudar audio"}
              >
                <span aria-hidden>{estado === "playing" ? "⏸" : "▶"}</span>
                {estado === "playing" ? "Pausa" : "Seguir"}
              </button>
              <button
                type="button"
                onClick={adelantar}
                disabled={!puedeAdelantar}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-primary/40 bg-white px-3 text-xs font-semibold text-primary active:bg-primary/5 disabled:opacity-40"
                aria-label="Adelantar lectura"
                title="Saltar unos segundos hacia adelante"
              >
                <span aria-hidden>⏭</span>
                Adelantar
              </button>
              <button
                type="button"
                onClick={detener}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-slate-600 active:bg-slate-50"
                aria-label="Detener audio"
              >
                <span aria-hidden>⏹</span>
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      <p className="mt-1.5 text-[0.625rem] leading-snug text-muted">
        Voz del navegador (puede sonar distinta en cada dispositivo).
        {estado === "paused" && " Al reanudar, repite el tramo actual desde el inicio."}
      </p>
    </div>
  )
}
