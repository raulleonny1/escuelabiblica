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

      <div
        className="pointer-events-none absolute right-2 top-[calc(50%+env(safe-area-inset-top)/2)] z-10 h-9 w-12 -translate-y-1/2 sm:right-3 sm:h-10 sm:w-14 lg:right-4 lg:h-11 lg:w-16"
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

      <div className="relative flex min-h-12 items-center gap-2 border-b-2 border-accent px-1.5 py-1.5 pr-14 sm:min-h-14 sm:gap-3 sm:px-3 sm:pr-20 lg:border-b-4 lg:px-4 lg:pr-24">
        <BotonMenuHamburguesa />
        <h1 className="font-display min-w-0 flex-1 truncate text-base font-semibold leading-tight sm:text-lg lg:text-xl">
          Estudio diario
        </h1>
      </div>
    </header>
  )
}
