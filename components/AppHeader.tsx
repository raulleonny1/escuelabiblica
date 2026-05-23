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
    <header className="relative shrink-0 overflow-hidden bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-lg">
      <div
        className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_50%,#fbbf24_0%,transparent_55%)]"
        aria-hidden
      />
      <div className="relative border-b-4 border-accent px-3 py-2.5 sm:px-4 md:px-8 md:py-3">
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
              Escuela Bíblica
            </h1>
            <p className="mt-0.5 text-xs text-amber-50/90 sm:text-sm">
              Trimestre sobre la {TRIMESTRE_TEMA} · Una lección por semana
            </p>
            <FontSizeControls />
            <ChatEnLineaIndicador placement="mobile" />
            <PwaInstallButton />
          </div>

          {estudio && (
            <div
              className="flex min-w-0 max-w-[52%] items-center gap-2 rounded-lg border border-white/25 bg-white/10 p-1.5 shadow-inner backdrop-blur-sm sm:max-w-xs sm:gap-2.5 sm:p-2 md:max-w-sm"
              aria-label={`Estamos estudiando: Lección ${estudio.numeroLeccion}, ${estudio.titulo}`}
            >
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md shadow-md ring-1 ring-white/30 sm:h-16 sm:w-12">
                <Image
                  src={PORTADA_SRC}
                  unoptimized
                  alt="Portada del trimestre"
                  fill
                  sizes="(max-width: 640px) 40px, 48px"
                  className="object-cover object-center"
                  priority
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.5625rem] font-semibold uppercase tracking-wider text-amber-100/95 sm:text-[0.625rem]">
                  Estamos estudiando
                </p>
                <p className="truncate text-xs font-semibold leading-tight sm:text-sm">
                  Lección {estudio.numeroLeccion}: {estudio.titulo}
                </p>
                <p className="mt-0.5 truncate text-[0.625rem] text-white/80 sm:text-xs">
                  Semana {estudio.semana}
                  {estudio.diaLabel ? ` · ${estudio.diaLabel}` : ""}
                </p>
                {estudio.temaDelDia && (
                  <p className="mt-0.5 line-clamp-2 text-[0.625rem] leading-snug text-amber-50/90 sm:text-xs">
                    {estudio.temaDelDia}
                  </p>
                )}
              </div>
            </div>
          )}

          <ChatEnLineaIndicador placement="desktop" />

          <div className="relative ml-auto hidden h-12 w-20 shrink-0 sm:block md:h-16 md:w-28 lg:h-20 lg:w-36">
            <Image
              src="/loges.jpg"
              alt="Escuela Bíblica"
              fill
              sizes="(max-width: 768px) 80px, 144px"
              className="object-contain object-right"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
