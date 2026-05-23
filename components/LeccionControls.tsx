"use client"

import { getLeccionPorSemana } from "@/lib/lecciones"
import { TOTAL_SEMANAS } from "@/lib/semana"

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-3 text-base text-slate-700 shadow-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20 transition md:py-2 md:text-sm"

const inputCompact =
  "w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary/20"

interface LeccionControlsProps {
  semana: number
  setSemana: (n: number) => void
  compact?: boolean
}

export default function LeccionControls({ semana, setSemana, compact }: LeccionControlsProps) {
  const leccion = getLeccionPorSemana(semana)

  if (compact) {
    return (
      <select
        value={semana}
        onChange={(e) => setSemana(Number(e.target.value))}
        className={inputCompact}
        aria-label="Semana de la lección"
      >
        {Array.from({ length: TOTAL_SEMANAS }, (_, i) => {
          const n = i + 1
          const l = getLeccionPorSemana(n)
          return (
            <option key={n} value={n}>
              S{n}
              {l ? ` · ${l.titulo}` : ""}
            </option>
          )
        })}
      </select>
    )
  }

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Lección de la semana
      </p>
      <label className="mb-1 block text-xs text-slate-500">Semana (domingo a sábado)</label>
      <select
        value={semana}
        onChange={(e) => setSemana(Number(e.target.value))}
        className={inputClass}
      >
        {Array.from({ length: TOTAL_SEMANAS }, (_, i) => {
          const n = i + 1
          const l = getLeccionPorSemana(n)
          return (
            <option key={n} value={n}>
              Semana {n}
              {l ? ` — ${l.titulo}` : ""}
            </option>
          )
        })}
      </select>
      {leccion && (
        <>
          <p className="mt-2 text-sm font-medium text-primary">
            Lección {leccion.numero}: {leccion.titulo}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dom: lección principal · Lun–Jue: temas de apoyo · Vie: repaso
          </p>
        </>
      )}
    </section>
  )
}
