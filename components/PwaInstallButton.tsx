"use client"

import { useEffect, useState } from "react"
import {
  esDispositivoInstalable,
  solicitarBannerInstalacion,
  yaInstaladaPwa,
} from "@/lib/pwa"

export default function PwaInstallButton({ variant = "header" }: { variant?: "header" | "menu" }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!yaInstaladaPwa() && esDispositivoInstalable())
  }, [])

  if (!visible) return null

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
