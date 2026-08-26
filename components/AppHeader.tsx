"use client"

import Image from "next/image"
import { BotonMenuHamburguesa } from "@/components/MenuNavegacion"

export default function AppHeader() {
  return (
    <header
      className="relative z-30 shrink-0 bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-md lg:shadow"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,#fbbf24_0%,transparent_55%)]"
        aria-hidden
      />

      {/* Escritorio: logo a la derecha (como antes) */}
      <div
        className="pointer-events-none absolute right-2 top-[calc(50%+env(safe-area-inset-top)/2)] z-10 hidden h-9 w-12 -translate-y-1/2 sm:right-3 sm:h-10 sm:w-14 lg:right-4 lg:block lg:h-11 lg:w-16"
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

      {/* Móvil / tablet: título + subtítulo a la izquierda, menú (Admin) a la derecha */}
      <div className="relative flex min-h-14 items-center gap-2 border-b-2 border-accent px-3 py-2 lg:hidden">
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-lg font-semibold leading-tight">
            Estudio diario
          </h1>
          <p className="truncate text-[0.6875rem] font-medium text-white/85">
            Iglesia El Buen Pastor · IERE
          </p>
        </div>
        <BotonMenuHamburguesa />
      </div>

      {/* Escritorio: menú a la izquierda + título (sin cambios de flujo) */}
      <div className="relative hidden min-h-12 items-center gap-2 border-b-4 border-accent px-4 py-1.5 pr-24 lg:flex">
        <BotonMenuHamburguesa />
        <h1 className="font-display min-w-0 flex-1 truncate text-xl font-semibold leading-tight">
          Estudio diario
        </h1>
      </div>
    </header>
  )
}
