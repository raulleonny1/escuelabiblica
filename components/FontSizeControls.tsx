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
  "flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-lg border border-white/35 bg-white/15 text-sm font-semibold text-white backdrop-blur-sm transition active:bg-white/30 disabled:opacity-40 disabled:pointer-events-none"

type Props = {
  variant?: "header" | "default"
}

export default function FontSizeControls({ variant = "default" }: Props) {
  const [level, setLevel] = useState<FontScaleLevel>(0)
  const isHeader = variant === "header"

  const sync = useCallback((next: FontScaleLevel) => setLevel(next), [])

  useLayoutEffect(() => {
    setLevel(readFontScale())
  }, [])

  const statusLabel = level === 0 ? null : fontScaleLabel(level)

  return (
    <div
      className={
        isHeader
          ? "flex w-full items-center gap-2 sm:w-auto"
          : "mt-2 flex flex-wrap items-center gap-1.5"
      }
      role="group"
      aria-label="Tamaño del texto"
    >
      <span
        className={
          isHeader
            ? "shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wide text-white/85"
            : "mr-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-white/85 sm:text-xs"
        }
      >
        Texto
      </span>

      <div className="flex flex-1 items-center justify-end gap-1 sm:flex-initial sm:justify-start">
        <button
          type="button"
          className={btn}
          onClick={() => sync(decreaseFontScale(level))}
          disabled={level === 0}
          aria-label="Reducir tamaño del texto"
        >
          A−
        </button>
        <button
          type="button"
          className={`${btn} min-w-[4.25rem] px-2 text-xs font-medium`}
          onClick={() => sync(resetFontScale())}
          aria-label="Tamaño de texto normal"
        >
          Normal
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => sync(increaseFontScale(level))}
          disabled={level === 3}
          aria-label="Aumentar tamaño del texto"
        >
          A+
        </button>
      </div>

      {statusLabel && (
        <span
          className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[0.6875rem] text-amber-100"
          aria-live="polite"
        >
          {statusLabel}
        </span>
      )}
    </div>
  )
}
