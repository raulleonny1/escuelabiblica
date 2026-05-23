"use client"

import Image from "next/image"
import { useMemo } from "react"
import { getFondoVersiculoUrl } from "@/lib/fondosVersiculo"
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
  const fondoUrl = useMemo(() => getFondoVersiculoUrl(semana, dia), [semana, dia])

  if (!versiculo) return null

  return (
    <aside
      className={`relative isolate overflow-hidden rounded-lg border border-primary/25 bg-primary-dark shadow-md ${
        compact
          ? "min-h-[4.5rem] w-full"
          : "hidden h-24 w-[11.5rem] shrink-0 md:block md:h-28 md:w-[13.5rem] lg:w-[15rem]"
      } ${className}`}
      aria-label={`Versículo del día: ${versiculo.cita}`}
    >
      <Image
        src={fondoUrl}
        alt=""
        fill
        unoptimized
        sizes={compact ? "100vw" : "240px"}
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/35 via-primary/40 to-primary-dark/50"
        aria-hidden
      />
      <div
        className={`relative z-10 flex h-full flex-col justify-center text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)] ${
          compact ? "px-3 py-2.5" : "px-3 py-2 md:px-3.5"
        }`}
      >
        <p
          className={`font-semibold uppercase tracking-wider text-white/95 ${
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
