"use client"

import { useEffect, useState } from "react"
import {
  esDispositivoInstalable,
  solicitarBannerInstalacion,
  yaInstaladaPwa,
} from "@/lib/pwa"

export default function PwaInstallButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!yaInstaladaPwa() && esDispositivoInstalable())
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={solicitarBannerInstalacion}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-3 text-[0.6875rem] font-semibold text-white backdrop-blur-sm active:bg-white/25 sm:text-xs"
      aria-label="Instalar aplicación en este dispositivo"
    >
      <span aria-hidden className="text-sm">
        📲
      </span>
      Instalar
    </button>
  )
}
