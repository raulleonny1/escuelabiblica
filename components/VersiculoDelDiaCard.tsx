"use client"

import { useEffect, useMemo, useState } from "react"
import { getColorFondoVersiculo } from "@/lib/fondosVersiculo"
import {
  getOracionDelDia,
  textoParaCompartirOracion,
} from "@/lib/oracionesDia"
import type { DiaLeccionId } from "@/lib/lecciones"

type VersiculoDelDiaCardProps = {
  semana: number
  dia: DiaLeccionId
  compact?: boolean
  className?: string
}

const LIMITE_VISTA = 110

export default function VersiculoDelDiaCard({
  semana,
  dia,
  compact = false,
  className = "",
}: VersiculoDelDiaCardProps) {
  const oracion = getOracionDelDia(semana, dia)
  const colorFondo = useMemo(() => getColorFondoVersiculo(semana, dia), [semana, dia])
  const [abierto, setAbierto] = useState(false)
  const [avisoCopia, setAvisoCopia] = useState<string | null>(null)

  useEffect(() => {
    if (!abierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [abierto])

  if (!oracion) return null

  const esLarga = oracion.texto.length > LIMITE_VISTA
  const textoCompartir = textoParaCompartirOracion(oracion, semana)

  async function copiarTexto(texto: string): Promise<boolean> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto)
        return true
      }
    } catch {
      /* fallback abajo */
    }
    try {
      const ta = document.createElement("textarea")
      ta.value = texto
      ta.setAttribute("readonly", "")
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }

  async function compartirWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(textoCompartir)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  async function compartirFacebook() {
    const copiado = await copiarTexto(textoCompartir)
    setAvisoCopia(
      copiado
        ? "Oración copiada. En el cuadro de Facebook pégala (Ctrl+V o mantener → Pegar) y publica."
        : "Copia la oración a mano y pégala en el cuadro de Facebook."
    )
    window.setTimeout(() => setAvisoCopia(null), 10000)

    const pagina =
      typeof window !== "undefined"
        ? window.location.href.split("#")[0] || window.location.origin
        : "https://www.facebook.com/"
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pagina)}`
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=700")
  }

  async function compartirX() {
    // X sí admite texto en la URL (límite ~280 caracteres)
    const max = 270
    const cuerpo =
      textoCompartir.length <= max
        ? textoCompartir
        : `${textoCompartir.slice(0, max - 1)}…`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(cuerpo)}`
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=650")
  }

  async function compartirInstagram() {
    // Instagram no permite publicar texto desde la web con un enlace.
    const copiado = await copiarTexto(textoCompartir)
    setAvisoCopia(
      copiado
        ? "Oración copiada. Abre una publicación o historia en Instagram y pégala en el texto (mantener → Pegar)."
        : "Copia la oración a mano y pégala en Instagram."
    )
    window.setTimeout(() => setAvisoCopia(null), 10000)
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`relative isolate overflow-hidden rounded-lg border border-white/15 text-left shadow-md transition hover:brightness-110 active:scale-[0.99] ${
          compact
            ? "min-h-[4.5rem] w-full"
            : "hidden h-24 w-[11.5rem] shrink-0 md:block md:h-28 md:w-[13.5rem] lg:w-[15rem]"
        } ${className}`}
        style={{ backgroundColor: colorFondo }}
        aria-label="Oración del día. Toca para leer completa y compartir."
      >
        <div
          className={`relative z-10 flex h-full flex-col justify-center text-white ${
            compact ? "px-3 py-2.5" : "px-3 py-2 md:px-3.5"
          }`}
        >
          <p
            className={`font-semibold uppercase tracking-wider text-white/90 ${
              compact ? "text-[0.625rem]" : "text-[0.65rem]"
            }`}
          >
            Oración del día
          </p>
          <p
            className={`font-display mt-0.5 leading-snug text-white ${
              compact ? "line-clamp-2 text-[0.8125rem]" : "line-clamp-3 text-[0.8125rem] md:text-sm"
            }`}
          >
            {oracion.texto}
          </p>
          <p
            className={`mt-1 font-medium text-amber-200/95 ${
              compact ? "text-[0.625rem]" : "text-[0.65rem]"
            }`}
          >
            {esLarga ? "Toca para leer y compartir" : "Toca para compartir"}
          </p>
        </div>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="oracion-dia-titulo"
          onClick={() => setAbierto(false)}
        >
          <div
            className="relative flex max-h-[min(88vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3 px-4 py-3 text-white sm:px-5"
              style={{ backgroundColor: colorFondo }}
            >
              <div className="min-w-0">
                <h2
                  id="oracion-dia-titulo"
                  className="font-display text-base font-semibold sm:text-lg"
                >
                  Oración del día
                </h2>
                <p className="mt-0.5 text-[0.6875rem] text-white/80 sm:text-xs">
                  Semana {semana} · {oracion.temaDia}
                </p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg leading-none text-white transition hover:bg-white/30"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="custom-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <p className="font-display text-[0.9375rem] leading-relaxed text-slate-800 sm:text-base">
                {oracion.texto}
              </p>
              <p className="mt-3 text-xs text-muted">
                Lección: {oracion.leccionTitulo}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-1.5 border-t border-border bg-surface px-3 py-2">
              {avisoCopia && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[0.65rem] leading-snug text-amber-900">
                  {avisoCopia}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void compartirWhatsApp()}
                  className="h-7 rounded px-2.5 text-[0.7rem] font-semibold leading-none text-white bg-[#25D366] hover:brightness-105"
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => void compartirFacebook()}
                  className="h-7 rounded px-2.5 text-[0.7rem] font-semibold leading-none text-white bg-[#1877F2] hover:brightness-105"
                >
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() => void compartirInstagram()}
                  className="h-7 rounded px-2.5 text-[0.7rem] font-semibold leading-none text-white bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:brightness-105"
                >
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() => void compartirX()}
                  className="h-7 rounded px-2.5 text-[0.7rem] font-semibold leading-none text-white bg-black hover:bg-neutral-800"
                >
                  X
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
