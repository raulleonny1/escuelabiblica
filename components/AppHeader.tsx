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
    <header className="relative shrink-0 bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-md lg:shadow">
      <div
        className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,#fbbf24_0%,transparent_55%)]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute right-2 top-1/2 z-10 h-9 w-12 -translate-y-1/2 lg:right-4 lg:h-11 lg:w-16 xl:h-12 xl:w-20"
        aria-hidden
      >
        <Image
          src="/loges.jpg"
          alt=""
          fill
          sizes="80px"
          className="object-contain object-right"
          priority
        />
      </div>

      {/* Móvil: franja baja */}
      <div className="relative flex items-center gap-2 border-b-2 border-accent px-2 py-1.5 pr-14 lg:hidden">
        <h1 className="font-display min-w-0 flex-1 truncate text-base font-semibold leading-tight">
          Escuela Bíblica
        </h1>
        <FontSizeControls variant="compact" />
        <ChatEnLineaIndicador placement="mobile" />
      </div>

      {/* Escritorio: una fila compacta */}
      <div className="relative hidden items-center gap-3 border-b-4 border-accent px-4 py-2 pr-20 lg:flex xl:gap-4 xl:px-6 xl:pr-24">
        <div className="min-w-[9.5rem] shrink-0 xl:min-w-[11rem]">
          <h1 className="font-display text-lg font-semibold leading-tight xl:text-xl">
            Escuela Bíblica
          </h1>
          <p className="truncate text-[0.6875rem] text-amber-50/90 xl:text-xs">
            Trimestre {TRIMESTRE_TEMA} · 1 lección/semana
          </p>
        </div>

        {estudio && (
          <div
            className="flex min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5"
            aria-label={`Estamos estudiando: Lección ${estudio.numeroLeccion}, ${estudio.titulo}`}
          >
            <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded shadow ring-1 ring-white/25">
              <Image
                src={PORTADA_SRC}
                unoptimized
                alt=""
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-[0.5625rem] font-semibold uppercase tracking-wide text-amber-100/95">
                Estudiando
              </p>
              <p className="truncate text-sm font-semibold leading-tight">
                L{estudio.numeroLeccion}: {estudio.titulo}
              </p>
              <p className="truncate text-[0.6875rem] text-white/80">
                Sem. {estudio.semana}
                {estudio.diaLabel ? ` · ${estudio.diaLabel}` : ""}
                {estudio.temaDelDia ? ` · ${estudio.temaDelDia}` : ""}
              </p>
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <FontSizeControls variant="compact" />
          <ChatEnLineaIndicador placement="desktop" />
          <PwaInstallButton />
        </div>
      </div>
    </header>
  )
}
