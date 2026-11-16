"use client"

/**
 * Visor PDF con pdf.js (canvas).
 * No usa @react-pdf-viewer/zoom: en React 19 tumba la app al abrir la hoja.
 */

import { useEffect, useRef, useState } from "react"
import { findPageIndexForDay, getFechaLecturaParaSemana } from "@/lib/leccionPdf"
import { getPdfWorkerUrl } from "@/lib/pdfWorker"

interface PdfViewerProps {
  url: string
  irAlDiaLectura?: boolean
  semana?: number
  fechaLectura?: string
}

type PdfDoc = {
  numPages: number
  getPage: (n: number) => Promise<{
    getViewport: (p: { scale: number }) => { width: number; height: number }
    render: (p: {
      canvasContext: CanvasRenderingContext2D
      viewport: { width: number; height: number }
    }) => { promise: Promise<void> }
  }>
  destroy: () => Promise<void>
}

export default function PdfViewer({ url, irAlDiaLectura, semana, fechaLectura }: PdfViewerProps) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [paginas, setPaginas] = useState(0)
  const [paginaActual, setPaginaActual] = useState(0)
  const docRef = useRef<PdfDoc | null>(null)
  const renderGen = useRef(0)

  useEffect(() => {
    let cancelado = false
    const gen = ++renderGen.current

    async function cargar() {
      setCargando(true)
      setError(null)
      setPaginas(0)

      try {
        const pdfjs = await import("pdfjs-dist")
        pdfjs.GlobalWorkerOptions.workerSrc = getPdfWorkerUrl()
        const cargado = await pdfjs.getDocument({
          url,
          withCredentials: false,
        }).promise

        if (cancelado || gen !== renderGen.current) {
          await cargado.destroy()
          return
        }

        docRef.current?.destroy().catch(() => {})
        docRef.current = cargado as unknown as PdfDoc
        setPaginas(cargado.numPages)

        let inicial = 0
        if (irAlDiaLectura && (semana || fechaLectura)) {
          const fecha =
            fechaLectura ?? (semana ? getFechaLecturaParaSemana(semana) : undefined)
          if (fecha) {
            try {
              inicial = await findPageIndexForDay(cargado, fecha)
            } catch {
              inicial = 0
            }
          }
        }
        if (!cancelado && gen === renderGen.current) {
          setPaginaActual(Math.min(Math.max(inicial, 0), cargado.numPages - 1))
          setCargando(false)
        }
      } catch (e) {
        if (!cancelado && gen === renderGen.current) {
          setError(e instanceof Error ? e.message : "No se pudo cargar el PDF")
          setCargando(false)
        }
      }
    }

    void cargar()
    return () => {
      cancelado = true
      docRef.current?.destroy().catch(() => {})
      docRef.current = null
    }
  }, [url, irAlDiaLectura, semana, fechaLectura])

  useEffect(() => {
    const doc = docRef.current
    const host = contenedorRef.current
    if (!doc || !host || cargando || error || paginas < 1) return

    let cancelado = false
    const gen = ++renderGen.current

    async function pintar() {
      if (!doc || !host) return
      host.innerHTML = ""

      const ancho = Math.max(host.clientWidth || 320, 280)
      // Escala para que quepa al ancho del modal
      const paginaPrueba = await doc.getPage(1)
      const base = paginaPrueba.getViewport({ scale: 1 })
      const scale = Math.min(2.2, Math.max(0.7, (ancho - 16) / base.width))

      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelado || gen !== renderGen.current) return
        const page = await doc.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement("canvas")
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        canvas.className = "mx-auto mb-3 block max-w-full rounded bg-white shadow-sm"
        canvas.style.width = "100%"
        canvas.style.height = "auto"
        const ctx = canvas.getContext("2d")
        if (!ctx) continue
        host.appendChild(canvas)
        await page.render({ canvasContext: ctx, viewport }).promise
      }

      // Ir a la página pedida
      const canvasPagina = host.children[paginaActual] as HTMLElement | undefined
      canvasPagina?.scrollIntoView({ block: "start" })
    }

    void pintar().catch((e) => {
      if (!cancelado) setError(e instanceof Error ? e.message : "Error al dibujar el PDF")
    })

    return () => {
      cancelado = true
    }
  }, [cargando, error, paginas, paginaActual, url])

  if (error) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="font-semibold text-red-700">No se pudo abrir el PDF</p>
        <p className="text-sm text-slate-600">{error}</p>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="pdf-viewer-shell flex h-full min-h-[200px] items-center justify-center lg:min-h-[480px]">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="pdf-viewer-shell flex h-full w-full min-h-[200px] flex-col lg:min-h-[480px]">
      <div
        ref={contenedorRef}
        className="custom-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-slate-200/80 p-2 sm:p-3"
      />
    </div>
  )
}
