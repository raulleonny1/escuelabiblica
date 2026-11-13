"use client"

import { useLayoutEffect } from "react"
import { applyTemaVisual, getPaletaTema } from "@/lib/temaVisual"

/** Aplica el color del trimestre según la fecha local (amor desde 15/11/2026). */
export default function TemaVisualInit() {
  useLayoutEffect(() => {
    applyTemaVisual(getPaletaTema())
  }, [])
  return null
}
