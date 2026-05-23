"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { MarcaFormato } from "@/lib/anotaciones"

export type PosicionBarra = {
  top: number
  left: number
}

type Props = {
  posicion: PosicionBarra
  citaPreview: string
  marcasActivas: MarcaFormato[]
  onResaltar: () => void
  onNegrita: () => void
  onSubrayar: () => void
  onComentar: () => void
  onQuitarFormato: () => void
  onCerrar: () => void
}

function btnBase(activo: boolean) {
  return `flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition active:scale-95 ${
    activo
      ? "bg-primary text-white shadow-inner"
      : "bg-white/15 text-white hover:bg-white/25"
  }`
}

export function toggleMarca(marcas: MarcaFormato[], marca: MarcaFormato): MarcaFormato[] {
  return marcas.includes(marca) ? marcas.filter((m) => m !== marca) : [...marcas, marca]
}

export function calcularPosicionBarra(rect: DOMRect): PosicionBarra {
  const anchoBarra = 320
  const margen = 8
  const vw = typeof window !== "undefined" ? window.innerWidth : 400
  const vh = typeof window !== "undefined" ? window.innerHeight : 600

  let left = rect.left + rect.width / 2 - anchoBarra / 2
  left = Math.max(margen, Math.min(left, vw - anchoBarra - margen))

  let top = rect.bottom + margen
  if (top > vh - 72) {
    top = rect.top - 56
  }
  top = Math.max(margen, top)

  return { top, left }
}

export default function BarraEdicion({
  posicion,
  citaPreview,
  marcasActivas,
  onResaltar,
  onNegrita,
  onSubrayar,
  onComentar,
  onQuitarFormato,
  onCerrar,
}: Props) {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  if (!montado) return null

  const preview =
    citaPreview.length > 48 ? `${citaPreview.slice(0, 45)}…` : citaPreview

  const barra = (
    <div
      className="fixed z-[80] w-[min(calc(100vw-1rem),20rem)] overflow-hidden rounded-xl border border-primary/30 bg-slate-900 shadow-2xl"
      style={{ top: posicion.top, left: posicion.left }}
      role="toolbar"
      aria-label="Barra de edición"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="border-b border-white/10 bg-primary/90 px-3 py-2">
        <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-white/80">
          Texto seleccionado
        </p>
        <p className="mt-0.5 truncate text-xs italic text-white">«{preview}»</p>
      </div>

      <div className="flex flex-wrap gap-1 p-2">
        <button
          type="button"
          className={btnBase(marcasActivas.includes("resaltado"))}
          onClick={onResaltar}
          title="Resaltar"
        >
          <span className="inline-block h-3 w-5 rounded-sm bg-amber-300" aria-hidden />
          Resaltar
        </button>
        <button
          type="button"
          className={btnBase(marcasActivas.includes("negrita"))}
          onClick={onNegrita}
          title="Negrita"
        >
          <strong className="text-sm">B</strong>
          Negrita
        </button>
        <button
          type="button"
          className={btnBase(marcasActivas.includes("subrayado"))}
          onClick={onSubrayar}
          title="Subrayar"
        >
          <span className="text-sm underline decoration-2">U</span>
          Subrayar
        </button>
        <button
          type="button"
          className={`${btnBase(false)} bg-primary/80`}
          onClick={onComentar}
          title="Añadir comentario en notas del día"
        >
          💬 Comentar
        </button>
        {marcasActivas.length > 0 && (
          <button
            type="button"
            className="min-h-10 rounded-lg px-2.5 text-xs font-medium text-amber-200 active:bg-white/10"
            onClick={onQuitarFormato}
            title="Quitar resaltado, negrita y subrayado"
          >
            Quitar formato
          </button>
        )}
        <button
          type="button"
          className="ml-auto min-h-10 min-w-10 rounded-lg text-lg text-white/80 active:bg-white/10"
          onClick={onCerrar}
          title="Cerrar"
          aria-label="Cerrar barra"
        >
          ×
        </button>
      </div>
    </div>
  )

  return createPortal(barra, document.body)
}
