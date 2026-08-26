"use client"

import { useEffect, useState } from "react"
import {
  esDispositivoInstalable,
  solicitarBannerInstalacion,
  yaInstaladaPwa,
} from "@/lib/pwa"

export default function PwaInstallButton({
  variant = "header",
}: {
  variant?: "header" | "menu" | "hub"
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!yaInstaladaPwa() && esDispositivoInstalable())
  }, [])

  if (!visible) {
    if (variant === "hub") {
      return (
        <div className="flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 px-2 py-3 text-center text-primary/45">
          <span className="text-sm font-semibold leading-tight">App instalada</span>
        </div>
      )
    }
    return null
  }

  if (variant === "hub") {
    return (
      <button
        type="button"
        onClick={solicitarBannerInstalacion}
        className="flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-center text-primary transition active:scale-[0.98] active:bg-primary/5"
        aria-label="Instalar aplicación en este dispositivo"
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
          <path d="M12 4v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path
            d="M8 11l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M5 19h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-semibold leading-tight">Instalar app</span>
      </button>
    )
  }

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={solicitarBannerInstalacion}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/5 active:bg-primary/10"
        aria-label="Instalar aplicación en este dispositivo"
      >
        <span aria-hidden>📲</span>
        Instalar app
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={solicitarBannerInstalacion}
      className="hidden h-8 shrink-0 items-center gap-1 rounded-lg border border-white/30 bg-white/15 px-2 text-[0.625rem] font-semibold text-white active:bg-white/25 lg:inline-flex xl:h-9 xl:px-2.5 xl:text-xs"
      aria-label="Instalar aplicación en este dispositivo"
    >
      <span aria-hidden className="text-sm">
        📲
      </span>
      Instalar
    </button>
  )
}
