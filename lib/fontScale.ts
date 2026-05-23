import { safeLocalGet, safeLocalSet } from "@/lib/storage"

export const FONT_SCALE_KEY = "fontScale"

/** 0 = normal · 1–3 = más grande */
export type FontScaleLevel = 0 | 1 | 2 | 3

const LEVELS: FontScaleLevel[] = [0, 1, 2, 3]

export function readFontScale(): FontScaleLevel {
  const raw = safeLocalGet(FONT_SCALE_KEY)
  const n = raw !== null ? Number.parseInt(raw, 10) : 0
  return LEVELS.includes(n as FontScaleLevel) ? (n as FontScaleLevel) : 0
}

export function applyFontScale(level: FontScaleLevel) {
  if (typeof document === "undefined") return
  document.documentElement.dataset.fontScale = String(level)
}

export function persistFontScale(level: FontScaleLevel) {
  safeLocalSet(FONT_SCALE_KEY, String(level))
  applyFontScale(level)
}

export function increaseFontScale(current: FontScaleLevel): FontScaleLevel {
  const next = Math.min(3, current + 1) as FontScaleLevel
  persistFontScale(next)
  return next
}

export function decreaseFontScale(current: FontScaleLevel): FontScaleLevel {
  const next = Math.max(0, current - 1) as FontScaleLevel
  persistFontScale(next)
  return next
}

export function resetFontScale(): FontScaleLevel {
  persistFontScale(0)
  return 0
}

export function fontScaleLabel(level: FontScaleLevel): string {
  if (level === 0) return "Normal"
  if (level === 1) return "Grande"
  if (level === 2) return "Muy grande"
  return "Extra grande"
}
