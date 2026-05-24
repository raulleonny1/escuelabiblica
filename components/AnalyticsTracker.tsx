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

    obtenerGeoCliente().then((geo) => {
      iniciarSesionAnalytics(usuarioId, nombre, geo)
      irASitio(sitioDesdeTab(mobileTab))
    })

    const heartbeat = window.setInterval(() => {
      const seg = Math.floor((Date.now() - inicioRef.current) / 1000)
      actualizarTiempoSesion(seg)
    }, 30_000)

    const onHide = () => {
      cerrarSitioActual()
      cerrarSesionAnalytics()
    }
    window.addEventListener("pagehide", onHide)

    return () => {
      window.clearInterval(heartbeat)
      window.removeEventListener("pagehide", onHide)
      cerrarSitioActual()
      cerrarSesionAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, nombre])

  useEffect(() => {
    if (!listoRef.current) return
    irASitio(sitioDesdeTab(mobileTab))
  }, [mobileTab, usuarioId, nombre])

  return null
}
