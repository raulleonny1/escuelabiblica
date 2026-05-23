"use client"

import { useState, useEffect } from "react"
import Biblia from "@/components/Biblia"
import LeccionViewer from "@/components/LeccionViewer"
import {
  subscribeComentarios,
  guardarComentario,
  eliminarComentario,
  leerComentariosLocal,
  migrarComentariosLocales,
  guardarComentariosLocal,
} from "@/lib/comentarios"

import { useEstudio } from "@/components/EstudioContext"
import LeccionControls from "@/components/LeccionControls"
import NotasPanel from "@/components/NotasPanel"
import ChatNombreModal from "@/components/ChatNombreModal"
import ChatPanel from "@/components/ChatPanel"
import {
  type AnotacionLeccion,
  type MarcaFormato,
  anotacionEstaVacia,
  nuevaIdAnotacion,
  subscribeAnotaciones,
  guardarAnotacion as guardarAnotacionFb,
  eliminarAnotacion,
  leerAnotacionesLocal,
  guardarAnotacionesLocal,
} from "@/lib/anotaciones"
import {
  ETIQUETAS_DIA_LECCION,
  diaLeccionIdDesdeFecha,
  getBloquesDia,
  getLeccionPorSemana,
} from "@/lib/lecciones"
import type { DiaLeccionId } from "@/lib/lecciones"
import {
  getFechaDestacadaEnSemana,
  getFechasSemana,
  getSemanaActual,
  fechaLocalHoy,
} from "@/lib/semana"
import { fechaDeDiaLeccion, diaLeccionDeFecha } from "@/lib/semanaDia"
import {
  getChatSessionId,
  guardarNombreChat,
  iniciarPresenciaEnApp,
  leerNombreChat,
} from "@/lib/chat"
import { useMediaLg } from "@/hooks/useMediaLg"
import { CHAT_ABRIR_EVENT, CHAT_NO_LEIDOS_EVENT } from "@/lib/chatNotificaciones"
import { safeLocalRemove, safeSessionRemove } from "@/lib/storage"

type MobileTab = "leccion" | "estudio" | "chat"

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [editFecha, setEditFecha] = useState<string | null>(null)
  const [editTexto, setEditTexto] = useState("")
  const [BibliaPasaje, setBibliaPasaje] = useState("")
  const [semana, setSemana] = useState(() => getSemanaActual())
  const [comentariosPorFecha, setComentariosPorFecha] = useState<Record<string, string>>({})
  const [comentario, setComentario] = useState("")
  const [selectedDate, setSelectedDate] = useState(() =>
    getFechaDestacadaEnSemana(getSemanaActual())
  )
  const [diaLeccion, setDiaLeccion] = useState<DiaLeccionId>(() =>
    diaLeccionIdDesdeFecha(getFechaDestacadaEnSemana(getSemanaActual()))
  )
  const [anotaciones, setAnotaciones] = useState<AnotacionLeccion[]>([])
  const [cargandoComentarios, setCargandoComentarios] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>("leccion")
  const [chatNombre, setChatNombre] = useState<string | null>(null)
  const [chatNombreListo, setChatNombreListo] = useState(false)
  const [chatNoLeidos, setChatNoLeidos] = useState(0)
  const isLg = useMediaLg()
  const { setEstudio } = useEstudio()

  useEffect(() => {
    const leccion = getLeccionPorSemana(semana)
    if (!leccion) {
      setEstudio(null)
      return
    }
    const diaCorto = ETIQUETAS_DIA_LECCION[diaLeccion].split(" —")[0]
    const bloques = getBloquesDia(leccion, diaLeccion)
    const primerTitulo = bloques[0]?.titulo?.trim()
    const titulosGenericos = new Set(["Texto clave", "Texto clave de la semana"])
    const temaDelDia =
      primerTitulo && !titulosGenericos.has(primerTitulo) ? primerTitulo : undefined

    setEstudio({
      semana,
      numeroLeccion: leccion.numero,
      titulo: leccion.titulo,
      diaLabel: diaCorto,
      temaDelDia,
    })
  }, [semana, diaLeccion, setEstudio])

  function formatDateDMY(dateStr: string) {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  }

  function seleccionarPasaje(v: string) {
    setBibliaPasaje(v)
    setMobileTab("leccion")
  }

  function seleccionarDiaLeccion(dia: DiaLeccionId) {
    setDiaLeccion(dia)
    const fecha = fechaDeDiaLeccion(semana, dia)
    setSelectedDate(fecha)
    setComentario(comentariosPorFecha[fecha] ?? "")
    setEditFecha(null)
  }

  function seleccionarFechaCalendario(fecha: string) {
    setSelectedDate(fecha)
    setComentario(comentariosPorFecha[fecha] ?? "")
    setEditFecha(null)
    const dia = diaLeccionDeFecha(semana, fecha)
    if (dia) setDiaLeccion(dia)
  }

  function normalizarCita(cita: string) {
    return cita.replace(/\s+/g, " ").trim()
  }

  async function handleGuardarAnotacionLeccion(datos: {
    cita: string
    bloqueTitulo: string
    marcas?: MarcaFormato[]
    comentario?: string
    anotacionId?: string
  }) {
    const fecha = fechaDeDiaLeccion(semana, diaLeccion)
    const prev = datos.anotacionId
      ? anotaciones.find((a) => a.id === datos.anotacionId)
      : anotaciones.find(
          (a) =>
            a.fecha === fecha &&
            a.bloqueTitulo === datos.bloqueTitulo &&
            normalizarCita(a.cita) === normalizarCita(datos.cita)
        )

    const marcas = datos.marcas !== undefined ? datos.marcas : (prev?.marcas ?? [])
    const comentario =
      datos.comentario !== undefined ? datos.comentario : (prev?.comentario ?? "")

    if (anotacionEstaVacia({ marcas, comentario })) {
      if (prev?.id) await handleEliminarAnotacion(prev.id)
      return
    }

    const item: AnotacionLeccion = {
      id: datos.anotacionId ?? prev?.id ?? nuevaIdAnotacion(),
      semana,
      fecha,
      diaLeccion,
      bloqueTitulo: datos.bloqueTitulo,
      cita: datos.cita,
      comentario,
      marcas,
    }
    await guardarAnotacionFb(item)
    setAnotaciones((prevList) => {
      const sin = prevList.filter((a) => a.id !== item.id)
      const nuevo = [...sin, item]
      guardarAnotacionesLocal(nuevo)
      return nuevo
    })
  }

  async function handleQuitarMarcasAnotacion(id: string) {
    const a = anotaciones.find((x) => x.id === id)
    if (!a) return
    await handleGuardarAnotacionLeccion({
      cita: a.cita,
      bloqueTitulo: a.bloqueTitulo,
      marcas: [],
      comentario: a.comentario,
      anotacionId: id,
    })
  }

  async function handleEliminarComentarioCita(id: string) {
    const a = anotaciones.find((x) => x.id === id)
    if (!a) return
    await handleGuardarAnotacionLeccion({
      cita: a.cita,
      bloqueTitulo: a.bloqueTitulo,
      marcas: a.marcas,
      comentario: "",
      anotacionId: id,
    })
  }

  async function handleEliminarAnotacion(id: string) {
    await eliminarAnotacion(id)
    setAnotaciones((prev) => {
      const nuevo = prev.filter((a) => a.id !== id)
      guardarAnotacionesLocal(nuevo)
      return nuevo
    })
  }

  useEffect(() => {
    const guardado = leerNombreChat()
    setChatNombre(guardado || null)
    setChatNombreListo(true)
  }, [])

  useEffect(() => {
    if (!chatNombre) return
    const sessionId = getChatSessionId()
    return iniciarPresenciaEnApp(chatNombre, sessionId)
  }, [chatNombre])

  useEffect(() => {
    const onNoLeidos = (e: Event) => {
      const det = (e as CustomEvent<{ cantidad: number }>).detail
      setChatNoLeidos(det?.cantidad ?? 0)
    }
    const onAbrirChat = () => setMobileTab("chat")

    window.addEventListener(CHAT_NO_LEIDOS_EVENT, onNoLeidos)
    window.addEventListener(CHAT_ABRIR_EVENT, onAbrirChat)
    return () => {
      window.removeEventListener(CHAT_NO_LEIDOS_EVENT, onNoLeidos)
      window.removeEventListener(CHAT_ABRIR_EVENT, onAbrirChat)
    }
  }, [])

  function handleConfirmarNombreChat(nombre: string) {
    guardarNombreChat(nombre)
    setChatNombre(nombre)
  }

  function handleCambiarNombreChat() {
    safeLocalRemove("chatNombre")
    safeSessionRemove("chatJoinAnnounced")
    setChatNombre(null)
  }

  useEffect(() => {
    let migrado = false

    const unsubscribe = subscribeComentarios(
      async (data) => {
        if (!migrado && Object.keys(data).length === 0) {
          const local = leerComentariosLocal()
          if (Object.keys(local).length > 0) {
            try {
              await migrarComentariosLocales(local)
            } catch {
              setComentariosPorFecha(local)
              setSyncError("Sin conexión. Mostrando comentarios guardados en este dispositivo.")
            }
            migrado = true
            return
          }
        }
        migrado = true
        setComentariosPorFecha(data)
        setSyncError(null)
        setCargandoComentarios(false)
      },
      () => {
        const local = leerComentariosLocal()
        setComentariosPorFecha(local)
        setSyncError("Sin conexión a Firebase. Usando comentarios locales.")
        setCargandoComentarios(false)
      }
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    return subscribeAnotaciones(setAnotaciones, () => {
      setAnotaciones(leerAnotacionesLocal())
    })
  }, [])

  useEffect(() => {
    const dias = getFechasSemana(semana)
    if (!dias.length) return
    const enRango = dias.some((d) => d.fecha === selectedDate)
    if (!enRango) {
      const fecha = getFechaDestacadaEnSemana(semana)
      const dia = diaLeccionDeFecha(semana, fecha) ?? "dom"
      setSelectedDate(fecha)
      setDiaLeccion(dia)
      setComentario(comentariosPorFecha[fecha] ?? "")
      setEditFecha(null)
    }
  }, [semana, comentariosPorFecha, selectedDate])

  async function handleGuardar(fecha: string, texto: string) {
    setGuardando(true)
    try {
      await guardarComentario(fecha, texto, semana)
      setComentariosPorFecha((prev) => {
        const nuevo = { ...prev, [fecha]: texto }
        guardarComentariosLocal(nuevo)
        return nuevo
      })
      setSyncError(null)
    } catch {
      setComentariosPorFecha((prev) => {
        const nuevo = { ...prev, [fecha]: texto }
        guardarComentariosLocal(nuevo)
        return nuevo
      })
      setSyncError("No se pudo sincronizar. Guardado solo en este dispositivo.")
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(fecha: string) {
    setGuardando(true)
    try {
      await eliminarComentario(fecha)
      setComentariosPorFecha((prev) => {
        const nuevo = { ...prev }
        delete nuevo[fecha]
        guardarComentariosLocal(nuevo)
        return nuevo
      })
      setSyncError(null)
    } catch {
      setComentariosPorFecha((prev) => {
        const nuevo = { ...prev }
        delete nuevo[fecha]
        guardarComentariosLocal(nuevo)
        return nuevo
      })
      setSyncError("No se pudo eliminar en la nube. Eliminado solo en este dispositivo.")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:flex-row lg:pb-0">
      <div
        className={`layout-pdf-panel flex min-h-0 min-w-0 flex-col bg-slate-50 lg:border-r lg:border-border ${
          mobileTab === "leccion" ? "flex flex-1" : "hidden lg:flex"
        }`}
      >
        <div className="shrink-0 border-b border-border bg-card p-2 lg:hidden">
          <LeccionControls semana={semana} setSemana={setSemana} />
        </div>
        {BibliaPasaje && (
          <div className="border-b border-accent/30 bg-accent-soft px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-1">
              Pasaje seleccionado
            </p>
            <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">{BibliaPasaje}</p>
            <button
              type="button"
              onClick={() => setBibliaPasaje("")}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Cerrar
            </button>
          </div>
        )}
        <div className="relative min-h-0 flex-1 w-full">
          <LeccionViewer
            key={semana}
            semana={semana}
            diaActivo={diaLeccion}
            onDiaActivoChange={seleccionarDiaLeccion}
            anotaciones={anotaciones}
            onGuardarAnotacion={handleGuardarAnotacionLeccion}
          />
        </div>
      </div>

      <aside
        className={`layout-sidebar-panel flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto custom-scroll bg-surface p-3 md:p-4 ${
          mobileTab === "estudio" ? "flex flex-1" : "hidden lg:flex"
        }`}
      >
        <div className="hidden lg:block">
          <LeccionControls semana={semana} setSemana={setSemana} />
        </div>

        <NotasPanel
          semana={semana}
          comentariosPorFecha={comentariosPorFecha}
          selectedDate={selectedDate}
          diaLeccion={diaLeccion}
          fechaHoy={fechaLocalHoy()}
          anotaciones={anotaciones}
          onSeleccionarFecha={seleccionarFechaCalendario}
          comentario={comentario}
          setComentario={setComentario}
          cargandoComentarios={cargandoComentarios}
          syncError={syncError}
          guardando={guardando}
          editFecha={editFecha}
          editTexto={editTexto}
          setEditFecha={setEditFecha}
          setEditTexto={setEditTexto}
          onGuardar={handleGuardar}
          onEliminar={handleEliminar}
          onQuitarMarcas={handleQuitarMarcasAnotacion}
          onEliminarComentarioCita={handleEliminarComentarioCita}
          onVerTodos={() => setShowModal(true)}
        />

        <section className="flex min-h-[min(50vh,360px)] max-h-[min(55vh,480px)] flex-col custom-scroll overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-sm lg:min-h-[320px] lg:max-h-[420px]">
          <Biblia onSeleccionarPasaje={seleccionarPasaje} />
        </section>

        {chatNombre && (
          <ChatPanel
            nombre={chatNombre}
            activo={isLg}
            onCambiarNombre={handleCambiarNombreChat}
            className="hidden lg:flex lg:min-h-[280px] lg:max-h-[340px]"
          />
        )}
      </aside>

      {chatNombre && (
        <div
          className={`flex min-h-0 flex-1 flex-col bg-surface p-3 md:p-4 lg:hidden ${
            mobileTab === "chat" ? "flex" : "hidden"
          }`}
        >
          <ChatPanel
            nombre={chatNombre}
            activo={!isLg && mobileTab === "chat"}
            onCambiarNombre={handleCambiarNombreChat}
            className="min-h-0 flex-1"
          />
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navegación principal"
      >
        <button
          type="button"
          onClick={() => setMobileTab("leccion")}
          className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-medium transition active:bg-slate-100 ${
            mobileTab === "leccion" ? "text-primary bg-primary/5" : "text-slate-600"
          }`}
        >
          <span className="text-lg" aria-hidden>📖</span>
          Lección
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("estudio")}
          className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-medium transition active:bg-slate-100 ${
            mobileTab === "estudio" ? "text-primary bg-primary/5" : "text-slate-600"
          }`}
        >
          <span className="text-lg" aria-hidden>📖</span>
          Biblia y notas
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("chat")}
          className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-medium transition active:bg-slate-100 ${
            mobileTab === "chat" ? "text-primary bg-primary/5" : "text-slate-600"
          }`}
        >
          <span className="relative text-lg" aria-hidden>
            💬
            {chatNoLeidos > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.625rem] font-bold text-white">
                {chatNoLeidos > 9 ? "9+" : chatNoLeidos}
              </span>
            )}
          </span>
          Chat
        </button>
      </nav>

      {chatNombreListo && !chatNombre && (
        <ChatNombreModal onConfirm={handleConfirmarNombreChat} />
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border bg-primary px-5 py-4 text-white">
              <h2 className="font-display text-lg font-semibold">Todas mis notas</h2>
              <p className="text-xs text-amber-50/80 mt-0.5">
                {Object.keys(comentariosPorFecha).length} nota(s) guardada(s)
              </p>
            </div>
            <button
              type="button"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="custom-scroll max-h-[60vh] overflow-y-auto p-5">
              {Object.keys(comentariosPorFecha).length === 0 && (
                <p className="text-center text-sm text-muted">No hay notas guardadas.</p>
              )}
              {Object.entries(comentariosPorFecha)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([fecha, texto]) => (
                  <article key={fecha} className="mb-4 border-b border-border pb-4 last:mb-0 last:border-0">
                    <time className="text-xs font-semibold text-primary">{formatDateDMY(fecha)}</time>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 whitespace-pre-line">{texto}</p>
                  </article>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
