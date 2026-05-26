"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import {
  PWA_MOSTRAR_EVENT,
  bannerInstalacionRechazadoEnSesion,
  debeAutoMostrarBannerAlEntrar,
  esTablet,
  etiquetaDispositivo,
  getPlataformaPwa,
  limpiarRechazoInstalacionAntiguo,
  marcarBannerInstalacionRechazado,
  yaInstaladaPwa,
} from "@/lib/pwa"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type ModoBanner = "nativo" | "ios"

const DELAY_IOS_MS = 800
/** Android/Chrome a veces tarda en disparar beforeinstallprompt */
const ESPERA_PROMPT_NATIVO_MS = 3500

function esperarPromptNativo(
  ms: number,
  tienePrompt: () => boolean
): Promise<boolean> {
  return new Promise((resolve) => {
    if (tienePrompt()) {
      resolve(true)
      return
    }
    const inicio = Date.now()
    const id = window.setInterval(() => {
      if (tienePrompt()) {
        window.clearInterval(id)
        resolve(true)
      } else if (Date.now() - inicio >= ms) {
        window.clearInterval(id)
        resolve(false)
      }
    }, 150)
  })
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [modo, setModo] = useState<ModoBanner>("ios")
  const [instalando, setInstalando] = useState(false)
  const [montado, setMontado] = useState(false)

  const puedeMostrar = useCallback(() => {
    return !yaInstaladaPwa() && !bannerInstalacionRechazadoEnSesion()
  }, [])

  const cerrarBanner = useCallback(() => {
    marcarBannerInstalacionRechazado()
    setVisible(false)
  }, [])

  useEffect(() => {
    limpiarRechazoInstalacionAntiguo()
    setMontado(true)
  }, [])

  useEffect(() => {
    deferredPromptRef.current = deferredPrompt
  }, [deferredPrompt])

  useEffect(() => {
    if (!montado || !puedeMostrar()) return

    const onBip = (e: Event) => {
      e.preventDefault()
      const ev = e as BeforeInstallPromptEvent
      deferredPromptRef.current = ev
      setDeferredPrompt(ev)
      if (!puedeMostrar()) return
      setModo("nativo")
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", onBip)

    let timerIos: number | undefined
    if (debeAutoMostrarBannerAlEntrar()) {
      timerIos = window.setTimeout(() => {
        if (!puedeMostrar() || deferredPromptRef.current) return
        setModo("ios")
        setVisible(true)
      }, DELAY_IOS_MS)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip)
      if (timerIos !== undefined) window.clearTimeout(timerIos)
    }
  }, [montado, puedeMostrar])

  useEffect(() => {
    if (!montado) return

    const onMostrar = async () => {
      if (!puedeMostrar()) return

      if (deferredPromptRef.current) {
        setModo("nativo")
        setVisible(true)
        return
      }

      const plataforma = getPlataformaPwa()

      if (plataforma === "ios") {
        setModo("ios")
        setVisible(true)
        return
      }

      const listo = await esperarPromptNativo(ESPERA_PROMPT_NATIVO_MS, () =>
        Boolean(deferredPromptRef.current)
      )
      if (!puedeMostrar()) return

      if (listo && deferredPromptRef.current) {
        setModo("nativo")
        setVisible(true)
      }
    }

    window.addEventListener(PWA_MOSTRAR_EVENT, onMostrar)
    return () => window.removeEventListener(PWA_MOSTRAR_EVENT, onMostrar)
  }, [montado, puedeMostrar])

  async function instalar() {
    const prompt = deferredPromptRef.current
    if (!prompt) return
    setInstalando(true)
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      setDeferredPrompt(null)
      deferredPromptRef.current = null
      if (outcome === "accepted" || yaInstaladaPwa()) {
        setVisible(false)
      }
    } catch {
      cerrarBanner()
    } finally {
      setInstalando(false)
    }
  }

  function textoInstrucciones(): ReactNode {
    const esTab = esTablet()
    if (modo === "nativo") {
      return <>Accede más rápido desde tu pantalla de inicio, como una aplicación.</>
    }
    if (modo === "ios") {
      if (esTab) {
        return (
          <>
            En <strong>Safari</strong> o <strong>Chrome</strong> en tu iPad: toca el icono{" "}
            <strong>Compartir</strong> (cuadrado con flecha) y elige{" "}
            <strong>Añadir a pantalla de inicio</strong>.
          </>
        )
      }
      return (
        <>
          En <strong>Safari</strong> o <strong>Chrome</strong> en tu iPhone: toca{" "}
          <strong>Compartir</strong> y luego <strong>Añadir a pantalla de inicio</strong>.
        </>
      )
    }
    return null
  }

  if (!montado || !visible || yaInstaladaPwa()) return null

  const promptNativo = deferredPrompt ?? deferredPromptRef.current
  const puedeInstalarNativo = modo === "nativo" && Boolean(promptNativo)

  return (
    <div
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[55] mx-auto max-w-md lg:bottom-4 lg:left-auto lg:right-4"
      role="dialog"
      aria-labelledby="pwa-install-title"
    >
      <div className="rounded-xl border border-primary/20 bg-card p-4 shadow-2xl shadow-slate-900/15">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/loges.jpg"
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p id="pwa-install-title" className="font-display text-base font-semibold text-primary">
              Instalar Escuela Bíblica
            </p>
            <p className="mt-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-muted">
              {etiquetaDispositivo()}
            </p>
            <p className="mt-1 text-sm leading-snug text-slate-600">{textoInstrucciones()}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {puedeInstalarNativo && (
            <button
              type="button"
              onClick={instalar}
              disabled={instalando}
              className="min-h-11 flex-1 rounded-lg bg-primary px-4 text-sm font-medium text-white active:opacity-90 disabled:opacity-60"
            >
              {instalando ? "Instalando…" : "Instalar"}
            </button>
          )}
          {modo === "ios" && (
            <button
              type="button"
              onClick={cerrarBanner}
              className="min-h-11 flex-1 rounded-lg bg-primary px-4 text-sm font-medium text-white active:opacity-90"
            >
              Entendido
            </button>
          )}
          <button
            type="button"
            onClick={cerrarBanner}
            className="min-h-11 rounded-lg border border-border px-4 text-sm font-medium text-slate-600 active:bg-slate-50"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
