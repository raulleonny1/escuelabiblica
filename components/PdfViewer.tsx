"use client"

import { useEffect, useMemo, useState } from "react"
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core"
import { zoomPlugin } from "@react-pdf-viewer/zoom"
import { findPageIndexForDay, getFechaLecturaParaSemana } from "@/lib/leccionPdf"
import { getPdfWorkerUrl } from "@/lib/pdfWorker"
import "@react-pdf-viewer/core/lib/styles/index.css"
import "@react-pdf-viewer/zoom/lib/styles/index.css"

interface PdfViewerProps {
  url: string
  irAlDiaLectura?: boolean
  semana?: number
  /** Si se indica, abre en la página de este día (YYYY-MM-DD) */
  fechaLectura?: string
}

function detectarModoTactil(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1023px)").matches
  )
}

const botonZoom =
  "flex h-10 min-w-10 items-center justify-center rounded-lg border border-border bg-white px-3 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-primary/8 active:bg-primary/12 disabled:opacity-40"

export default function PdfViewer({ url, irAlDiaLectura, semana, fechaLectura }: PdfViewerProps) {
  const [touchMode] = useState(detectarModoTactil)
  const [montado, setMontado] = useState(false)
  const [paginaInicial, setPaginaInicial] = useState(0)
  const [paginaLista, setPaginaLista] = useState(false)

  const zoomPluginInstance = useMemo(() => zoomPlugin({ enableShortcuts: true }), [])
  const { ZoomIn, ZoomOut, CurrentScale, zoomTo } = zoomPluginInstance

  useEffect(() => {
    setMontado(true)
  }, [])

  useEffect(() => {
    let cancelado = false
    setPaginaLista(false)
    setPaginaInicial(0)

    if (!irAlDiaLectura || (!semana && !fechaLectura)) {
      setPaginaLista(true)
      return
    }

    async function resolverPagina() {
      try {
        const pdfjs = await import("pdfjs-dist")
        pdfjs.GlobalWorkerOptions.workerSrc = getPdfWorkerUrl()
        const doc = await pdfjs.getDocument(url).promise
        const fecha =
          fechaLectura ?? (semana ? getFechaLecturaParaSemana(semana) : undefined)
        if (!fecha) {
          if (!cancelado) setPaginaLista(true)
          return
        }
        const index = await findPageIndexForDay(doc, fecha)
        if (!cancelado) setPaginaInicial(index)
        await doc.destroy()
      } catch {
        if (!cancelado) setPaginaInicial(0)
      } finally {
        if (!cancelado) setPaginaLista(true)
      }
    }

    resolverPagina()
    return () => {
      cancelado = true
    }
  }, [url, irAlDiaLectura, semana, fechaLectura])

  if (!montado || !paginaLista) {
    return (
      <div className="pdf-viewer-shell flex h-full min-h-[200px] items-center justify-center lg:min-h-[480px]">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const escalaInicial = touchMode ? SpecialZoomLevel.PageWidth : SpecialZoomLevel.PageFit

  return (
    <div className="pdf-viewer-shell flex h-full w-full min-h-[200px] flex-col lg:min-h-[480px]">
      <div className="flex shrink-0 items-center justify-center gap-2 border-b border-border bg-card px-3 py-2">
        <ZoomOut>
          {(props) => (
            <button
              type="button"
              className={botonZoom}
              onClick={props.onClick}
              aria-label="Alejar"
            >
              −
            </button>
          )}
        </ZoomOut>
        <CurrentScale>
          {(props) => (
            <span className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums text-slate-700">
              {Math.round(props.scale * 100)}%
            </span>
          )}
        </CurrentScale>
        <ZoomIn>
          {(props) => (
            <button
              type="button"
              className={botonZoom}
              onClick={props.onClick}
              aria-label="Acercar"
            >
              +
            </button>
          )}
        </ZoomIn>
        <button
          type="button"
          className={`${botonZoom} text-sm font-medium`}
          onClick={() => zoomTo(escalaInicial)}
          aria-label="Ajustar a la página"
        >
          Ajustar
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <Worker workerUrl={getPdfWorkerUrl()}>
          <Viewer
            key={`${url}-${paginaInicial}`}
            fileUrl={url}
            initialPage={paginaInicial}
            defaultScale={escalaInicial}
            plugins={[zoomPluginInstance]}
            renderLoader={(percent) => (
              <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-slate-500">
                Cargando PDF… {Math.round(percent)}%
              </div>
            )}
            renderError={(loadError) => (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 p-4 text-center">
                <p className="font-semibold text-red-700">No se pudo abrir el PDF</p>
                <p className="text-sm text-slate-600">
                  {loadError.message || "Archivo no encontrado"}
                </p>
                <p className="text-xs text-slate-400 break-all">{url}</p>
              </div>
            )}
          />
        </Worker>
      </div>
    </div>
  )
}
