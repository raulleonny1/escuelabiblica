"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import {
  PWA_MOSTRAR_EVENT,
  esTablet,
  etiquetaDispositivo,
  getPlataformaPwa,
  limpiarRechazoInstalacionAntiguo,
  modoBannerParaPlataforma,
  yaInstaladaPwa,
} from "@/lib/pwa"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type ModoBanner = "nativo" | "ios"

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [modo, setModo] = useState<ModoBanner>("ios")
  const [instalando, setInstalando] = useState(false)
  const bipRecibido = useRef(false)
  const timerRef = useRef<number | null>(null)
  const [montado, setMontado] = useState(false)

  const limpiarTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const mostrarBanner = useCallback((nuevoModo: ModoBanner) => {
    if (yaInstaladaPwa()) return
    setModo(nuevoModo)
    setVisible(true)
  }, [])

  const programarBanner = useCallback(() => {
    if (yaInstaladaPwa()) return

    limpiarTimer()

    if (bipRecibido.current && deferredPrompt) {
      mostrarBanner("nativo")
      return
    }

    const plataforma = getPlataformaPwa()
    // Android/Desktop: solo mostrar cuando exista prompt nativo.
    if (plataforma !== "ios") return
    const delay = 800

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      if (yaInstaladaPwa()) return
      if (bipRecibido.current && deferredPrompt) {
        mostrarBanner("nativo")
        return
      }
      if (plataforma === "ios") mostrarBanner("ios")
    }, delay)
  }, [deferredPrompt, limpiarTimer, mostrarBanner])

  const cerrarTemporal = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    limpiarRechazoInstalacionAntiguo()
    setMontado(true)
  }, [])

  useEffect(() => {
    if (!montado) return

    const onMostrar = () => {
      if (yaInstaladaPwa()) return
      const modoDetectado = modoBannerParaPlataforma(Boolean(deferredPrompt))
      if (modoDetectado === "nativo" || modoDetectado === "ios") {
        mostrarBanner(modoDetectado)
      }
    }

    window.addEventListener(PWA_MOSTRAR_EVENT, onMostrar)
    return () => window.removeEventListener(PWA_MOSTRAR_EVENT, onMostrar)
  }, [montado, deferredPrompt, mostrarBanner])

  useEffect(() => {
    if (!montado || yaInstaladaPwa()) return

    const onBip = (e: Event) => {
      e.preventDefault()
      bipRecibido.current = true
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      limpiarTimer()
      mostrarBanner("nativo")
    }

    window.addEventListener("beforeinstallprompt", onBip)
    programarBanner()

    const onPageShow = () => {
      if (yaInstaladaPwa()) return
      programarBanner()
    }

    window.addEventListener("pageshow", onPageShow)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip)
      window.removeEventListener("pageshow", onPageShow)
      limpiarTimer()
    }
  }, [montado, programarBanner, mostrarBanner, limpiarTimer])

  async function instalar() {
    if (!deferredPrompt) return
    setInstalando(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (outcome === "accepted" || yaInstaladaPwa()) {
        setVisible(false)
      }
    } catch {
      cerrarTemporal()
    } finally {
      setInstalando(false)
    }
  }

  function textoInstrucciones(): ReactNode {
    const esTab = esTablet()
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
    return <>Accede más rápido desde tu pantalla de inicio, como una aplicación.</>
  }

  if (!montado || !visible || yaInstaladaPwa()) return null

  const puedeInstalarNativo = modo === "nativo" && deferredPrompt

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
          {!puedeInstalarNativo && (
            <button
              type="button"
              onClick={cerrarTemporal}
              className="min-h-11 flex-1 rounded-lg bg-primary px-4 text-sm font-medium text-white active:opacity-90"
            >
              Entendido
            </button>
          )}
          <button
            type="button"
            onClick={cerrarTemporal}
            className="min-h-11 rounded-lg border border-border px-4 text-sm font-medium text-slate-600 active:bg-slate-50"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
