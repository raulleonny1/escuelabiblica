"use client"

import { useLayoutEffect } from "react"
import { applyFontScale, readFontScale } from "@/lib/fontScale"

/** Aplica el tamaño guardado antes del primer pintado visible */
export default function FontScaleInit() {
  useLayoutEffect(() => {
    applyFontScale(readFontScale())
  }, [])
  return null
}
