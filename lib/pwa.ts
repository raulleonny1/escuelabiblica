/** Utilidades PWA: detección de plataforma e instalación */

import { safeSessionGet, safeSessionSet } from "@/lib/storage"

export type PlataformaPwa = "ios" | "android" | "desktop"

export const PWA_MOSTRAR_EVENT = "pwa-mostrar-instalacion"

const PWA_DISMISS_SESSION_KEY = "pwa-install-dismiss-session"

/** Claves antiguas (solo migración, no el rechazo de sesión actual) */
const LEGACY_DISMISS_KEY = "pwa-install-dismissed"
const LEGACY_INSTALADO_FLAG_KEY = "pwa-installed-flag"

/** iPhone, iPad (incl. iPadOS que reporta "Macintosh") */
export function esAppleDispositivo(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  if (/iPhone|iPod|iPad/i.test(ua)) return true
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
}

export function esAndroid(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android/i.test(navigator.userAgent)
}

export function esTablet(): boolean {
  if (typeof navigator === "undefined") return false
  if (/iPad/i.test(navigator.userAgent)) return true
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true
  if (esAndroid() && !/Mobile/i.test(navigator.userAgent)) return true
  return false
}

export function getPlataformaPwa(): PlataformaPwa {
  if (esAppleDispositivo()) return "ios"
  if (esAndroid()) return "android"
  return "desktop"
}

/** Móvil o tablet donde conviene ofrecer instalación */
export function esDispositivoInstalable(): boolean {
  if (typeof window === "undefined") return false
  if (esAppleDispositivo() || esAndroid()) return true
  return window.matchMedia("(pointer: coarse)").matches
}

export function yaInstaladaPwa(): boolean {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

export function bannerInstalacionRechazadoEnSesion(): boolean {
  return safeSessionGet(PWA_DISMISS_SESSION_KEY) === "1"
}

export function marcarBannerInstalacionRechazado(): void {
  safeSessionSet(PWA_DISMISS_SESSION_KEY, "1")
}

/** Quita flags viejos que bloqueaban o confundían la instalación */
export function limpiarRechazoInstalacionAntiguo(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(LEGACY_DISMISS_KEY)
    window.localStorage.removeItem(LEGACY_INSTALADO_FLAG_KEY)
  } catch {
    // ignorar
  }
}

export function solicitarBannerInstalacion(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(PWA_MOSTRAR_EVENT))
}

export function etiquetaDispositivo(): string {
  if (esTablet()) {
    return esAppleDispositivo() ? "iPad" : "tablet Android"
  }
  if (esAppleDispositivo()) return "iPhone"
  if (esAndroid()) return "Android"
  return "dispositivo"
}

/** Solo iPhone/iPad muestran instrucciones al entrar sin prompt del navegador */
export function debeAutoMostrarBannerAlEntrar(): boolean {
  if (yaInstaladaPwa() || bannerInstalacionRechazadoEnSesion()) return false
  return getPlataformaPwa() === "ios"
}
