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
