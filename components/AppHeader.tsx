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
    <header className="relative shrink-0 bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-md lg:shadow-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,#fbbf24_0%,transparent_55%)] lg:opacity-15"
        aria-hidden
      />

      {/* ——— Móvil: una sola franja baja (~44px) ——— */}
      <div className="relative flex items-center gap-2 border-b-2 border-accent px-2 py-1.5 lg:hidden">
        <h1 className="font-display min-w-0 flex-1 truncate text-base font-semibold leading-tight">
          Escuela Bíblica
        </h1>
        <FontSizeControls variant="compact" />
        <ChatEnLineaIndicador placement="mobile" />
      </div>

      {/* ——— Escritorio: banner completo ——— */}
      <div className="relative hidden border-b-4 border-accent px-4 py-3 md:px-8 md:py-4 lg:block">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Escuela Bíblica
            </h1>
            <p className="mt-0.5 text-sm text-amber-50/90">
              Trimestre sobre la {TRIMESTRE_TEMA} · Una lección por semana
            </p>
          </div>
          <div className="relative h-16 w-32 shrink-0 md:h-20 md:w-40">
            <Image
              src="/loges.jpg"
              alt=""
              fill
              sizes="160px"
              className="object-contain object-right"
            />
          </div>
        </div>

        {estudio && (
          <div
            className="mt-3 flex max-w-xl items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-sm"
            aria-label={`Estamos estudiando: Lección ${estudio.numeroLeccion}, ${estudio.titulo}`}
          >
            <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg shadow-md ring-1 ring-white/30">
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
              <p className="mt-0.5 text-base font-semibold leading-snug">
                Lección {estudio.numeroLeccion}: {estudio.titulo}
              </p>
              <p className="mt-0.5 text-xs text-white/85">
                Semana {estudio.semana}
                {estudio.diaLabel ? ` · ${estudio.diaLabel}` : ""}
              </p>
              {estudio.temaDelDia && (
                <p className="mt-0.5 line-clamp-2 text-xs text-amber-50/90">{estudio.temaDelDia}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-4 border-t border-white/15 pt-3">
          <FontSizeControls variant="header" />
          <ChatEnLineaIndicador placement="desktop" />
          <PwaInstallButton />
        </div>
      </div>
    </header>
  )
}
