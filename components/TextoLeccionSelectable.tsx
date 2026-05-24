"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import BarraEdicion, { calcularPosicionBarra, toggleMarca } from "@/components/BarraEdicion"
import type { AnotacionLeccion, MarcaFormato } from "@/lib/anotaciones"
import TextoConPasajesBiblicos from "@/components/TextoConPasajesBiblicos"

type Props = {
  texto: string
  bloqueTitulo: string
  anotacionesBloque: AnotacionLeccion[]
  onGuardarAnotacion: (datos: {
    cita: string
    marcas?: MarcaFormato[]
    comentario?: string
    anotacionId?: string
  }) => Promise<void>
}

function normalizarCita(s: string) {
  return s.replace(/\s+/g, " ").trim()
}

function buscarAnotacion(anotaciones: AnotacionLeccion[], cita: string) {
  const n = normalizarCita(cita)
  return (
    anotaciones.find((a) => normalizarCita(a.cita) === n) ??
    anotaciones.find((a) => normalizarCita(a.cita).includes(n) || n.includes(normalizarCita(a.cita)))
  )
}

export default function TextoLeccionSelectable({
  texto,
  bloqueTitulo,
  anotacionesBloque,
  onGuardarAnotacion,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [barra, setBarra] = useState<{
    posicion: { top: number; left: number }
    cita: string
    anotacionId?: string
    marcas: MarcaFormato[]
  } | null>(null)
  const [modalComentario, setModalComentario] = useState(false)
  const [textoComentario, setTextoComentario] = useState("")
  const [guardando, setGuardando] = useState(false)

  const cerrarBarra = useCallback(() => {
    setBarra(null)
    window.getSelection()?.removeAllRanges()
  }, [])

  const leerSeleccion = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !ref.current) return null

    const rango = sel.getRangeAt(0)
    if (!ref.current.contains(rango.commonAncestorContainer)) return null

    const cita = normalizarCita(sel.toString())
    if (cita.length < 2) return null

    const rect = rango.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return null

    const existente = buscarAnotacion(anotacionesBloque, cita)
    return {
      cita,
      anotacionId: existente?.id,
      marcas: existente?.marcas ?? [],
      posicion: calcularPosicionBarra(rect),
    }
  }, [anotacionesBloque])

  const mostrarBarra = useCallback(() => {
    const data = leerSeleccion()
    if (!data) {
      setBarra(null)
      return
    }
    setBarra({
      posicion: data.posicion,
      cita: data.cita,
      anotacionId: data.anotacionId,
      marcas: data.marcas,
    })
  }, [leerSeleccion])

  useEffect(() => {
    const onSelectionChange = () => {
      if (!ref.current) return
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) return
      const rango = sel.getRangeAt(0)
      if (ref.current.contains(rango.commonAncestorContainer)) {
        mostrarBarra()
      }
    }

    document.addEventListener("selectionchange", onSelectionChange)
    return () => document.removeEventListener("selectionchange", onSelectionChange)
  }, [mostrarBarra])

  useEffect(() => {
    const cerrarSiScroll = () => {
      if (barra) cerrarBarra()
    }
    window.addEventListener("scroll", cerrarSiScroll, true)
    return () => window.removeEventListener("scroll", cerrarSiScroll, true)
  }, [barra, cerrarBarra])

  async function persistirMarcas(marcas: MarcaFormato[]) {
    const citaFinal = barra?.cita
    if (!citaFinal) return
    setGuardando(true)
    try {
      await onGuardarAnotacion({
        cita: citaFinal,
        marcas,
        anotacionId: barra?.anotacionId,
      })
      setBarra((prev) => (prev && prev.cita === citaFinal ? { ...prev, marcas } : prev))
    } finally {
      setGuardando(false)
    }
  }

  async function aplicarMarca(marca: MarcaFormato) {
    if (!barra) return
    const prev = buscarAnotacion(anotacionesBloque, barra.cita)
    const marcas = toggleMarca(prev?.marcas ?? barra.marcas, marca)
    await persistirMarcas(marcas)
  }

  async function quitarFormato() {
    if (!barra) return
    await persistirMarcas([])
    setBarra((b) => (b ? { ...b, marcas: [] } : null))
  }

  function abrirComentario() {
    if (!barra) return
    const prev = buscarAnotacion(anotacionesBloque, barra.cita)
    setTextoComentario(prev?.comentario ?? "")
    setModalComentario(true)
  }

  async function guardarComentario() {
    if (!barra || !textoComentario.trim()) return
    setGuardando(true)
    try {
      await onGuardarAnotacion({
        cita: barra.cita,
        comentario: textoComentario.trim(),
        anotacionId: barra.anotacionId,
      })
      setModalComentario(false)
      setTextoComentario("")
      cerrarBarra()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <div
        ref={ref}
        className="mt-2 cursor-text select-text rounded-lg text-base leading-relaxed text-slate-700 transition ring-offset-2 focus-within:ring-2 focus-within:ring-primary/20"
        onMouseUp={() => setTimeout(mostrarBarra, 10)}
        onTouchEnd={() => setTimeout(mostrarBarra, 350)}
      >
        <TextoConPasajesBiblicos texto={texto} anotaciones={anotacionesBloque} />
      </div>

      {barra && !modalComentario && (
        <BarraEdicion
          posicion={barra.posicion}
          citaPreview={barra.cita}
          marcasActivas={barra.marcas}
          onResaltar={() => aplicarMarca("resaltado")}
          onNegrita={() => aplicarMarca("negrita")}
          onSubrayar={() => aplicarMarca("subrayado")}
          onComentar={abrirComentario}
          onQuitarFormato={quitarFormato}
          onCerrar={cerrarBarra}
        />
      )}

      {guardando && (
        <p className="mt-1 text-[0.6875rem] text-primary" aria-live="polite">
          Guardando…
        </p>
      )}

      {modalComentario && barra && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setModalComentario(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Comentario sobre este pasaje
            </p>
            <p className="mt-1 text-[0.6875rem] text-muted">
              Aparecerá en «Comentarios de la lección», no en la nota libre del día.
            </p>
            <blockquote className="mt-2 border-l-4 border-accent bg-accent-soft px-3 py-2 text-sm italic text-slate-700">
              «{barra.cita.length > 120 ? `${barra.cita.slice(0, 117)}…` : barra.cita}»
            </blockquote>
            <p className="mt-1 text-[0.6875rem] text-muted">{bloqueTitulo}</p>
            <textarea
              value={textoComentario}
              onChange={(e) => setTextoComentario(e.target.value)}
              placeholder="¿Qué te enseña esta frase? Escribe tu reflexión..."
              className="mt-3 min-h-32 w-full rounded-lg border border-border px-3 py-2 text-base focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 min-h-11 rounded-lg bg-primary text-sm font-medium text-white active:opacity-90"
                onClick={guardarComentario}
              >
                Guardar comentario
              </button>
              <button
                type="button"
                className="min-h-11 rounded-lg border border-border px-4 text-sm text-slate-600"
                onClick={() => setModalComentario(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
