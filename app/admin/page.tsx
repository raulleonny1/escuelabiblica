"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { estaAdminDesbloqueado, marcarAdminDesbloqueado } from "@/components/AdminAcceso"
import { ADMIN_PIN_DEFAULT } from "@/lib/adminPin"
import { ensureUsuarioAuth } from "@/lib/auth"
import type { DashboardData } from "@/lib/adminAnalyticsSummary"
import { cargarAnalyticsDesdeCliente } from "@/lib/analyticsAdminClient"
import { resumirSitiosVisitados, sitioDesdeEvento } from "@/lib/analyticsSitios"

function formatearDuracion(seg: number): string {
  if (seg < 60) return `${seg} s`
  const m = Math.floor(seg / 60)
  const s = seg % 60
  if (m < 60) return `${m} min ${s} s`
  const h = Math.floor(m / 60)
  return `${h} h ${m % 60} min`
}

function formatearFecha(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("es", {
      dateStyle: "short",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

function formatearDiaCorto(fechaIso: string): string {
  try {
    return new Date(`${fechaIso}T12:00:00`).toLocaleDateString("es", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return fechaIso
  }
}

/** YYYY-MM-DD local */
function fechaLocalISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const

/** Celdas del mes: null = vacío; lunes = inicio de semana */
function celdasDelMes(anio: number, mes: number): (number | null)[] {
  const primero = new Date(anio, mes, 1)
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  // getDay(): 0=dom … 6=sáb → lunes primero
  const offset = (primero.getDay() + 6) % 7
  const celdas: (number | null)[] = Array.from({ length: offset }, () => null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)
  while (celdas.length % 7 !== 0) celdas.push(null)
  return celdas
}

export default function AdminPage() {
  const [pin, setPin] = useState("")
  const [autorizado, setAutorizado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [usuarioAbierto, setUsuarioAbierto] = useState<string | null>(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>("general")
  const [mesCalendario, setMesCalendario] = useState(() => {
    const hoy = new Date()
    return { anio: hoy.getFullYear(), mes: hoy.getMonth() }
  })

  useEffect(() => {
    if (estaAdminDesbloqueado()) setAutorizado(true)
  }, [])

  const cargar = useCallback(async (codigo: string) => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: codigo }),
      })
      const json = await res.json()
      if (res.ok) {
        setData(json as DashboardData)
        setDiaSeleccionado("general")
        return
      }
      if (res.status === 503 && json.usarCliente) {
        await ensureUsuarioAuth()
        const local = await cargarAnalyticsDesdeCliente()
        setData(local as DashboardData)
        setDiaSeleccionado("general")
        setError(
          "Modo respaldo (sin cuenta de servicio en el servidor). Los datos pueden estar incompletos si faltan permisos en Firestore."
        )
        return
      }
      throw new Error(json.error ?? "No se pudieron cargar los datos")
    } catch (e) {
      try {
        await ensureUsuarioAuth()
        const local = await cargarAnalyticsDesdeCliente()
        setData(local as DashboardData)
        setDiaSeleccionado("general")
        setError(
          e instanceof Error
            ? `${e.message} — mostrando datos vía cliente.`
            : "Error al cargar"
        )
      } catch (e2) {
        setError(e2 instanceof Error ? e2.message : "Error al cargar analíticas")
      }
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (!autorizado) return
    const codigo = sessionStorage.getItem("adminPinUsado") ?? ADMIN_PIN_DEFAULT
    cargar(codigo)
  }, [autorizado, cargar])

  function verificarPin(e: React.FormEvent) {
    e.preventDefault()
    if (pin === ADMIN_PIN_DEFAULT) {
      sessionStorage.setItem("adminPinUsado", pin)
      marcarAdminDesbloqueado()
      setAutorizado(true)
      setPin("")
      return
    }
    setError("Código incorrecto")
  }

  if (!autorizado) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
        <form onSubmit={verificarPin} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h1 className="font-display text-xl font-semibold text-primary">Panel administrador</h1>
          <p className="mt-1 text-sm text-muted">Introduce el código de acceso</p>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-4 w-full rounded-lg border border-border px-3 py-3 text-center text-2xl tracking-widest"
            placeholder="••••"
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="mt-4 min-h-11 w-full rounded-lg bg-primary font-medium text-white"
          >
            Entrar
          </button>
          <Link href="/" className="mt-3 block text-center text-sm text-primary hover:underline">
            Volver a la app
          </Link>
        </form>
      </div>
    )
  }

  const resumenDia = data?.porDia.find((d) => d.fecha === diaSeleccionado)
  const vistaActiva =
    diaSeleccionado === "general" || !resumenDia
      ? {
          etiqueta: "General",
          totalUsuarios: data?.totalUsuarios ?? 0,
          totalSesiones: data?.totalSesiones ?? 0,
          totalEventos: data?.totalEventos ?? 0,
          tiempoTotalSeg: data?.resumen.reduce((acc, u) => acc + (u.tiempoTotalSeg || 0), 0) ?? 0,
          ingresosConNombre: data?.sesiones.filter((s) => Boolean(s.nombre.trim())).length ?? 0,
          ipsUnicas: new Set(data?.sesiones.map((s) => s.ip).filter(Boolean) ?? []).size,
          ciudadesUnicas: new Set(data?.sesiones.map((s) => s.ciudad).filter(Boolean) ?? []).size,
          resumen: data?.resumen ?? [],
        }
      : {
          etiqueta: resumenDia.fecha,
          totalUsuarios: resumenDia.totalUsuarios,
          totalSesiones: resumenDia.totalSesiones,
          totalEventos: resumenDia.totalEventos,
          tiempoTotalSeg: resumenDia.tiempoTotalSeg,
          ingresosConNombre: resumenDia.ingresosConNombre,
          ipsUnicas: resumenDia.ipsUnicas,
          ciudadesUnicas: resumenDia.ciudadesUnicas,
          resumen: resumenDia.resumen,
        }
  const usuarioDetalleVista = vistaActiva.resumen.find((u) => u.usuarioId === usuarioAbierto) ?? null

  return (
    <div className="custom-scroll h-full min-h-0 w-full flex-1 overflow-y-auto bg-slate-50 p-3 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-primary">Sitios visitados</h1>
            <p className="text-sm text-muted">
              Estadísticas generales y por día: ingresos, IP/ciudad, navegación y tiempo en app
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={cargando}
              onClick={() => cargar(sessionStorage.getItem("adminPinUsado") ?? ADMIN_PIN_DEFAULT)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              {cargando ? "Actualizando…" : "Actualizar"}
            </button>
            <Link
              href="/"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white"
            >
              Volver
            </Link>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {error}
          </p>
        )}

        {cargando && !data && (
          <div className="mt-8 flex justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {data && (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted">Usuarios</p>
                <p className="font-display text-3xl font-semibold text-primary">{vistaActiva.totalUsuarios}</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted">Sesiones</p>
                <p className="font-display text-3xl font-semibold text-primary">{vistaActiva.totalSesiones}</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted">Eventos de navegación</p>
                <p className="font-display text-3xl font-semibold text-primary">{vistaActiva.totalEventos}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted">Tiempo total</p>
                <p className="font-display text-xl font-semibold text-primary">
                  {formatearDuracion(vistaActiva.tiempoTotalSeg)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted">Ingresos con nombre</p>
                <p className="font-display text-xl font-semibold text-primary">{vistaActiva.ingresosConNombre}</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted">IPs únicas</p>
                <p className="font-display text-xl font-semibold text-primary">{vistaActiva.ipsUnicas}</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted">Ciudades únicas</p>
                <p className="font-display text-xl font-semibold text-primary">{vistaActiva.ciudadesUnicas}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">
              Generado: {formatearFecha(data.generadoEn)}
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-label="Mes anterior"
                    onClick={() =>
                      setMesCalendario((m) => {
                        const d = new Date(m.anio, m.mes - 1, 1)
                        return { anio: d.getFullYear(), mes: d.getMonth() }
                      })
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-slate-600 hover:bg-slate-50"
                  >
                    ‹
                  </button>
                  <p className="font-display text-sm font-semibold capitalize text-primary">
                    {new Date(mesCalendario.anio, mesCalendario.mes, 1).toLocaleDateString("es", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <button
                    type="button"
                    aria-label="Mes siguiente"
                    onClick={() =>
                      setMesCalendario((m) => {
                        const d = new Date(m.anio, m.mes + 1, 1)
                        return { anio: d.getFullYear(), mes: d.getMonth() }
                      })
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-slate-600 hover:bg-slate-50"
                  >
                    ›
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.65rem] font-semibold uppercase text-muted">
                  {DIAS_SEMANA.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const diasConDatos = new Set(data.porDia.map((d) => d.fecha))
                    const hoyIso = fechaLocalISO(new Date())
                    return celdasDelMes(mesCalendario.anio, mesCalendario.mes).map((dia, i) => {
                      if (dia == null) {
                        return <div key={`e-${i}`} className="aspect-square" />
                      }
                      const fecha = `${mesCalendario.anio}-${String(mesCalendario.mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
                      const tieneDatos = diasConDatos.has(fecha)
                      const seleccionado = diaSeleccionado === fecha
                      const esHoy = fecha === hoyIso
                      return (
                        <button
                          key={fecha}
                          type="button"
                          disabled={!tieneDatos}
                          title={
                            tieneDatos
                              ? `Ver ingresos del ${fecha}`
                              : "Sin ingresos este día"
                          }
                          onClick={() => {
                            if (!tieneDatos) return
                            setUsuarioAbierto(null)
                            setDiaSeleccionado(fecha)
                          }}
                          className={`relative flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition ${
                            seleccionado
                              ? "bg-primary text-white shadow-sm"
                              : tieneDatos
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "text-slate-300"
                          } ${esHoy && !seleccionado ? "ring-1 ring-primary/40" : ""} disabled:cursor-default`}
                        >
                          {dia}
                          {tieneDatos && !seleccionado && (
                            <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                          )}
                        </button>
                      )
                    })
                  })()}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsuarioAbierto(null)
                      setDiaSeleccionado("general")
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                      diaSeleccionado === "general"
                        ? "bg-primary text-white"
                        : "border border-border bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    General (todos)
                  </button>
                  <p className="text-[0.6875rem] text-muted">
                    {diaSeleccionado === "general"
                      ? "Mostrando todos los registros"
                      : `Día: ${formatearDiaCorto(diaSeleccionado)}`}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700 lg:self-start">
                <p className="font-semibold text-primary">Cómo usar</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Elige un día en el calendario para ver quién ingresó ese día. Los días con punto
                  tienen actividad. «General» muestra el resumen de todos los días.
                </p>
                <p className="mt-3 font-semibold text-primary">Secciones que se registran</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Lección · Estudio y notas · Biblia · Chat · Hoja dominical · Pedido de oración
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Sitios que visitó</th>
                    <th className="px-3 py-2">Tiempo en app</th>
                    <th className="px-3 py-2">Última vez</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {vistaActiva.resumen.map((u) => {
                    const sitios = resumirSitiosVisitados(u.eventos).filter(
                      (s) => s.sitio !== "Entrada a la app"
                    )
                    return (
                      <tr key={u.usuarioId} className="border-b border-border/80 hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-800">{u.nombre || "—"}</td>
                        <td className="px-3 py-2">
                          {sitios.length === 0 ? (
                            <span className="text-muted">Sin visitas registradas aún</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {sitios.map((s) => (
                                <span
                                  key={s.sitio}
                                  className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-medium text-primary"
                                  title={`${s.visitas} visita(s) · ${formatearDuracion(s.segundos)}`}
                                >
                                  {s.sitio}
                                  {s.visitas > 1 ? ` (${s.visitas})` : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatearDuracion(u.tiempoTotalSeg)}
                        </td>
                        <td className="px-3 py-2 text-muted whitespace-nowrap">
                          {formatearFecha(u.ultimoAcceso)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="text-xs font-medium text-primary hover:underline"
                            onClick={() =>
                              setUsuarioAbierto((id) => (id === u.usuarioId ? null : u.usuarioId))
                            }
                          >
                            {usuarioAbierto === u.usuarioId ? "Ocultar" : "Detalle"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {vistaActiva.resumen.length === 0 && (
                <p className="p-6 text-center text-sm text-muted">
                  No hay datos para esta vista todavía.
                </p>
              )}
            </div>

            {usuarioDetalleVista && (
              <section className="mt-6 rounded-xl border border-primary/20 bg-white p-4 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-primary">
                  Recorrido — {usuarioDetalleVista.nombre}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Orden cronológico: qué parte de la app abrió y cuánto tiempo estuvo
                </p>
                <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto custom-scroll">
                  {usuarioDetalleVista.eventos
                    .filter((ev) => ["sitio", "tab", "modal", "inicio"].includes(ev.tipo))
                    .slice()
                    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
                    .map((ev) => {
                      const sitio = sitioDesdeEvento(ev.tipo, ev.destino)
                      return (
                        <li
                          key={ev.id}
                          className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-slate-800">{sitio}</span>
                          <span className="text-xs text-muted">
                            {formatearFecha(ev.createdAt)}
                            {ev.duracionSeg > 0 ? ` · ${formatearDuracion(ev.duracionSeg)}` : ""}
                          </span>
                        </li>
                      )
                    })}
                </ul>
                <p className="mt-3 text-xs text-muted">
                  Ciudad: {usuarioDetalleVista.ultimaCiudad || "—"} · IP: {usuarioDetalleVista.ultimaIp || "—"}
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
