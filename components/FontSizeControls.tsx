"use client"

import { useCallback, useLayoutEffect, useState } from "react"
import {
  decreaseFontScale,
  fontScaleLabel,
  increaseFontScale,
  readFontScale,
  resetFontScale,
  type FontScaleLevel,
} from "@/lib/fontScale"

const btn =
  "flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/35 bg-white/15 text-sm font-semibold text-white backdrop-blur-sm transition active:bg-white/30 disabled:opacity-40 disabled:pointer-events-none"

export default function FontSizeControls() {
  const [level, setLevel] = useState<FontScaleLevel>(0)

  const sync = useCallback((next: FontScaleLevel) => setLevel(next), [])

  useLayoutEffect(() => {
    setLevel(readFontScale())
  }, [])

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Tamaño del texto"
    >
      <span className="mr-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-white/85 sm:text-xs">
        Texto
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => sync(decreaseFontScale(level))}
        disabled={level === 0}
        aria-label="Reducir tamaño del texto"
        title="Más pequeño"
      >
        A−
      </button>
      <button
        type="button"
        className={`${btn} min-w-[4.5rem] px-2 text-xs font-medium`}
        onClick={() => sync(resetFontScale())}
        aria-label="Tamaño de texto normal"
        title="Restablecer tamaño normal"
      >
        Normal
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => sync(increaseFontScale(level))}
        disabled={level === 3}
        aria-label="Aumentar tamaño del texto"
        title="Más grande"
      >
        A+
      </button>
      <span className="w-full text-[0.6875rem] text-white/75 sm:w-auto sm:text-xs" aria-live="polite">
        {fontScaleLabel(level)}
      </span>
    </div>
  )
}
