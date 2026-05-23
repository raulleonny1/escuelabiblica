"use client"

import { FONDO_SRC } from "@/lib/portada"
import { getVersiculoDelDia } from "@/lib/versiculosDia"
import type { DiaLeccionId } from "@/lib/lecciones"

type VersiculoDelDiaCardProps = {
  semana: number
  dia: DiaLeccionId
  compact?: boolean
  className?: string
}

export default function VersiculoDelDiaCard({
  semana,
  dia,
  compact = false,
  className = "",
}: VersiculoDelDiaCardProps) {
  const versiculo = getVersiculoDelDia(semana, dia)
  if (!versiculo) return null

  return (
    <aside
      className={`relative overflow-hidden rounded-lg border border-primary/25 shadow-md ${
        compact
          ? "min-h-[4.5rem] w-full"
          : "hidden h-24 w-[11.5rem] shrink-0 md:block md:h-28 md:w-[13.5rem] lg:w-[15rem]"
      } ${className}`}
      aria-label={`Versículo del día: ${versiculo.cita}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${FONDO_SRC})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/75 via-primary/70 to-primary-dark/85"
        aria-hidden
      />
      <div
        className={`relative flex h-full flex-col justify-center text-white ${
          compact ? "px-3 py-2.5" : "px-3 py-2 md:px-3.5"
        }`}
      >
        <p
          className={`font-semibold uppercase tracking-wider text-white/80 ${
            compact ? "text-[0.625rem]" : "text-[0.65rem]"
          }`}
        >
          Versículo del día
        </p>
        <blockquote
          className={`font-display mt-0.5 leading-snug ${
            compact ? "line-clamp-2 text-[0.8125rem]" : "line-clamp-3 text-[0.8125rem] md:text-sm"
          }`}
        >
          «{versiculo.texto}»
        </blockquote>
        <p
          className={`mt-1 font-semibold text-accent-soft ${
            compact ? "text-[0.6875rem]" : "text-xs"
          }`}
        >
          — {versiculo.cita}
        </p>
      </div>
    </aside>
  )
}
