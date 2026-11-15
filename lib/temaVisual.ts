/** Temas visuales de la app según el calendario del trimestre. */

import { fechaHoyMadrid } from "@/lib/fechaMadrid"

export type TemaVisualId = "default" | "amor"

export type PaletaTema = {
  id: TemaVisualId
  primary: string
  primaryDark: string
  primaryLight: string
  accent: string
  accentSoft: string
  surface: string
  muted: string
  border: string
  ink: string
  hubCard: string
  hubInner: string
}

/** Verde azulado actual (hasta el sábado 14 nov 2026). */
export const PALETA_DEFAULT: PaletaTema = {
  id: "default",
  primary: "#0f766e",
  primaryDark: "#0b5a54",
  primaryLight: "#14b8a6",
  accent: "#f59e0b",
  accentSoft: "#fef3c7",
  surface: "#f0fdfa",
  muted: "#5b6b68",
  border: "#cce8e4",
  ink: "#134e4a",
  hubCard: "#d8ebe7",
  hubInner: "#f7f4ec",
}

/**
 * Desde el domingo 15 nov 2026 (I Domingo de Adviento).
 * Morado litúrgico de la hoja dominical (~#5b1a6b).
 */
export const PALETA_AMOR: PaletaTema = {
  id: "amor",
  primary: "#5b1a6b",
  primaryDark: "#3f114c",
  primaryLight: "#8b3a9e",
  accent: "#d4a017",
  accentSoft: "#fef6e0",
  surface: "#f8f4fa",
  muted: "#5c4d63",
  border: "#e0d0e8",
  ink: "#2e1538",
  hubCard: "#e6d4ef",
  hubInner: "#faf6fc",
}

/** Fecha civil YYYY-MM-DD en Europe/Madrid */
export function fechaLocalISO(d = new Date()): string {
  return fechaHoyMadrid(d)
}

/**
 * El cambio de color del trimestre «amor» empieza el domingo 15/11/2026
 * y dura hasta el 31/12/2026.
 */
export function getTemaVisualId(fecha?: string): TemaVisualId {
  const f = fecha ?? fechaLocalISO()
  if (f >= "2026-11-15" && f <= "2026-12-31") return "amor"
  return "default"
}

export function getPaletaTema(fecha?: string): PaletaTema {
  return getTemaVisualId(fecha) === "amor" ? PALETA_AMOR : PALETA_DEFAULT
}

/** Aplica variables CSS y data-tema en el documento. */
export function applyTemaVisual(paleta: PaletaTema) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.dataset.tema = paleta.id
  // --tema-* alimenta las clases Tailwind (bg-primary, text-primary, …)
  root.style.setProperty("--tema-primary", paleta.primary)
  root.style.setProperty("--tema-primary-dark", paleta.primaryDark)
  root.style.setProperty("--tema-primary-light", paleta.primaryLight)
  root.style.setProperty("--tema-accent", paleta.accent)
  root.style.setProperty("--tema-accent-soft", paleta.accentSoft)
  root.style.setProperty("--tema-surface", paleta.surface)
  root.style.setProperty("--tema-muted", paleta.muted)
  root.style.setProperty("--tema-border", paleta.border)
  root.style.setProperty("--tema-ink", paleta.ink)
  root.style.setProperty("--tema-hub-card", paleta.hubCard)
  root.style.setProperty("--tema-hub-inner", paleta.hubInner)
  root.style.setProperty("--color-primary", paleta.primary)
  root.style.setProperty("--color-primary-dark", paleta.primaryDark)
  root.style.setProperty("--color-primary-light", paleta.primaryLight)
  root.style.setProperty("--color-accent", paleta.accent)
  root.style.setProperty("--color-accent-soft", paleta.accentSoft)
  root.style.setProperty("--color-surface", paleta.surface)
  root.style.setProperty("--color-muted", paleta.muted)
  root.style.setProperty("--color-border", paleta.border)
  root.style.setProperty("--color-ink", paleta.ink)
  root.style.setProperty("--color-hub-card", paleta.hubCard)
  root.style.setProperty("--color-hub-inner", paleta.hubInner)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute("content", paleta.primary)
}
