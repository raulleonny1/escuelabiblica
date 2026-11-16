"use client"

import { useEffect, useRef } from "react"
import { useSesion } from "@/components/SesionProvider"
import {
  actualizarTiempoSesion,
  cerrarSesionAnalytics,
  iniciarSesionAnalytics,
  obtenerGeoCliente,
  registrarVisitaSitio,
} from "@/lib/analytics"
import type { SitioAppId } from "@/lib/analyticsSitios"
import { ensureUsuarioAuth, getFirebaseAuthUid } from "@/lib/auth"

type Props = {
  mobileTab: string
}

function sitioDesdeTab(tab: string): SitioAppId {
  if (tab === "leccion") return "leccion"
  if (tab === "chat") return "chat"
  return "estudio"
}

export default function AnalyticsTracker({ mobileTab }: Props) {
  const { usuarioId, nombre } = useSesion()
  const inicioRef = useRef<number>(Date.now())
  const sitioRef = useRef<SitioAppId | null>(null)
  const sitioInicioRef = useRef<number>(Date.now())
  const listoRef = useRef(false)

  const cerrarSitioActual = () => {
    if (!usuarioId || !nombre || !sitioRef.current) return
    const seg = Math.max(1, Math.floor((Date.now() - sitioInicioRef.current) / 1000))
    registrarVisitaSitio(usuarioId, nombre, sitioRef.current, seg)
  }

  const irASitio = (nuevo: SitioAppId) => {
    if (!usuarioId || !nombre) return
    if (sitioRef.current === nuevo) return
    cerrarSitioActual()
    sitioRef.current = nuevo
    sitioInicioRef.current = Date.now()
    registrarVisitaSitio(usuarioId, nombre, nuevo, 0)
  }

  useEffect(() => {
    if (!usuarioId || !nombre || listoRef.current) return
    listoRef.current = true
    inicioRef.current = Date.now()
    sitioInicioRef.current = Date.now()

    // Asegura Auth real antes de escribir (sin auth Firestore rechaza y el calendario queda vacío).
    void ensureUsuarioAuth()
      .then(async (uid) => {
        if (!getFirebaseAuthUid()) {
          console.warn("[analytics] Auth no listo tras ensureUsuarioAuth")
        }
        await iniciarSesionAnalytics(uid, nombre, {
          ip: "—",
          ciudad: "Desconocida",
          region: "",
          pais: "",
        })
        irASitio(sitioDesdeTab(mobileTab))
      })
      .catch((err) => console.warn("[analytics] inicio sesión", err))

    void obtenerGeoCliente()
      .then(async (geo) => {
        const uid = getFirebaseAuthUid() || (await ensureUsuarioAuth())
        await iniciarSesionAnalytics(uid, nombre, geo)
      })
      .catch((err) => console.warn("[analytics] geo", err))

    const heartbeat = window.setInterval(() => {
      const seg = Math.floor((Date.now() - inicioRef.current) / 1000)
      void actualizarTiempoSesion(seg)
    }, 30_000)

    const onHide = () => {
      cerrarSitioActual()
      void cerrarSesionAnalytics()
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide()
    }
    window.addEventListener("pagehide", onHide)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.clearInterval(heartbeat)
      window.removeEventListener("pagehide", onHide)
      document.removeEventListener("visibilitychange", onVisibility)
      cerrarSitioActual()
      void cerrarSesionAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, nombre])

  useEffect(() => {
    if (!listoRef.current) return
    irASitio(sitioDesdeTab(mobileTab))
  }, [mobileTab, usuarioId, nombre])

  return null
}
