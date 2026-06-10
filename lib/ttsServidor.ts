import { esDispositivoMovil } from "@/lib/sintesisVozIos"

/** En móvil usamos MP3 del servidor (sí suena con pantalla bloqueada). */
export function usarAudioServidorEnDispositivo(): boolean {
  return esDispositivoMovil()
}

export function urlAudioTts(texto: string): string {
  return `/api/tts?text=${encodeURIComponent(texto)}`
}

export function actualizarPosicionMedia(audio: HTMLAudioElement): void {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
  try {
    navigator.mediaSession.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate || 1,
      position: Math.min(audio.currentTime, audio.duration),
    })
  } catch {
    /* ignore */
  }
}
