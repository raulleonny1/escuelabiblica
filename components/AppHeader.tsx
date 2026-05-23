"use client"

import Image from "next/image"
import ChatEnLineaIndicador from "@/components/ChatEnLineaIndicador"
import { useEstudio } from "@/components/EstudioContext"
import FontSizeControls from "@/components/FontSizeControls"
import PwaInstallButton from "@/components/PwaInstallButton"
import { TRIMESTRE_TEMA } from "@/lib/lecciones"
import { PORTADA_SRC } from "@/lib/portada"

export default function AppHeader() {
  const { estudio } = useEstudio()

  return (
    <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white shadow-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_50%,#fbbf24_0%,transparent_55%)]"
        aria-hidden
      />

      <div className="relative border-b-4 border-accent px-3 py-3 sm:px-4 md:px-8 md:py-4">
        {/* Fila 1: título + logo (escritorio) */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
              Escuela Bíblica
            </h1>
            <p className="mt-0.5 text-xs leading-snug text-amber-50/90 sm:text-sm">
              Trimestre sobre la {TRIMESTRE_TEMA} · Una lección por semana
            </p>
          </div>

          <div className="relative hidden h-14 w-24 shrink-0 sm:block md:h-16 md:w-32 lg:h-20 lg:w-40">
            <Image
              src="/loges.jpg"
              alt=""
              fill
              sizes="160px"
              className="object-contain object-right"
            />
          </div>
        </div>

        {/* Fila 2: lección actual (ancho completo en móvil) */}
        {estudio && (
          <div
            className="mt-3 flex w-full items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-2.5 shadow-inner backdrop-blur-sm sm:mt-3.5 md:max-w-xl"
            aria-label={`Estamos estudiando: Lección ${estudio.numeroLeccion}, ${estudio.titulo}`}
          >
            <div className="relative h-[4.5rem] w-12 shrink-0 overflow-hidden rounded-lg shadow-md ring-1 ring-white/30 sm:h-20 sm:w-14">
              <Image
                src={PORTADA_SRC}
                unoptimized
                alt=""
                fill
                sizes="56px"
                className="object-cover object-center"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-amber-100">
                Estamos estudiando
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
                Lección {estudio.numeroLeccion}: {estudio.titulo}
              </p>
              <p className="mt-0.5 text-xs text-white/85">
                Semana {estudio.semana}
                {estudio.diaLabel ? ` · ${estudio.diaLabel}` : ""}
              </p>
              {estudio.temaDelDia && (
                <p className="mt-0.5 line-clamp-1 text-[0.6875rem] text-amber-50/90 sm:line-clamp-2">
                  {estudio.temaDelDia}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Fila 3: herramientas */}
        <div className="mt-3 space-y-2 border-t border-white/15 pt-3 md:flex md:items-center md:gap-4 md:space-y-0">
          <FontSizeControls variant="header" />
          <ChatEnLineaIndicador placement="desktop" />
          <div className="flex items-stretch gap-2 md:shrink-0">
            <ChatEnLineaIndicador placement="mobile" />
            <PwaInstallButton />
          </div>
        </div>
      </div>
    </header>
  )
}
