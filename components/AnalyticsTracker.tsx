"use client"

import { useEffect, useRef } from "react"
import { useSesion } from "@/components/SesionProvider"
import {
  actualizarTiempoSesion,
  cerrarSesionAnalytics,
  iniciarSesionAnalytics,
  obtenerGeoCliente,
  registrarEvento,
} from "@/lib/analytics"

type Props = {
  mobileTab: string
  semana: number
  diaLeccion: string
}

export default function AnalyticsTracker({ mobileTab, semana, diaLeccion }: Props) {
  const { usuarioId, nombre } = useSesion()
  const inicioRef = useRef<number>(Date.now())
  const tabPrevRef = useRef<string | null>(null)
  const semanaPrevRef = useRef<number | null>(null)
  const diaPrevRef = useRef<string | null>(null)
  const listoRef = useRef(false)

  useEffect(() => {
    if (!usuarioId || !nombre || listoRef.current) return
    listoRef.current = true
    inicioRef.current = Date.now()

    obtenerGeoCliente().then((geo) => iniciarSesionAnalytics(usuarioId, nombre, geo))

    const heartbeat = window.setInterval(() => {
      const seg = Math.floor((Date.now() - inicioRef.current) / 1000)
      actualizarTiempoSesion(seg)
    }, 30_000)

    const onHide = () => {
      registrarEvento(usuarioId, nombre, "salida", "Pestaña oculta o cerrada")
      cerrarSesionAnalytics()
    }
    window.addEventListener("pagehide", onHide)

    return () => {
      window.clearInterval(heartbeat)
      window.removeEventListener("pagehide", onHide)
      const seg = Math.floor((Date.now() - inicioRef.current) / 1000)
      actualizarTiempoSesion(seg)
      cerrarSesionAnalytics()
    }
  }, [usuarioId, nombre])

  useEffect(() => {
    if (!usuarioId || !nombre || !listoRef.current) return
    if (tabPrevRef.current === mobileTab) return
    tabPrevRef.current = mobileTab
    const etiquetas: Record<string, string> = {
      leccion: "Lección",
      estudio: "Estudio / notas / Biblia",
      chat: "Chat",
    }
    registrarEvento(usuarioId, nombre, "tab", etiquetas[mobileTab] ?? mobileTab)
  }, [mobileTab, usuarioId, nombre])

  useEffect(() => {
    if (!usuarioId || !nombre || !listoRef.current) return
    if (semanaPrevRef.current === semana) return
    semanaPrevRef.current = semana
    registrarEvento(usuarioId, nombre, "semana", `Semana ${semana}`)
  }, [semana, usuarioId, nombre])

  useEffect(() => {
    if (!usuarioId || !nombre || !listoRef.current) return
    if (diaPrevRef.current === diaLeccion) return
    diaPrevRef.current = diaLeccion
    registrarEvento(usuarioId, nombre, "dia_leccion", `Día ${diaLeccion}`)
  }, [diaLeccion, usuarioId, nombre])

  return null
}
