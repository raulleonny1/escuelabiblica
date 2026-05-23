"use client"

import { ETIQUETAS_DIA_LECCION, type DiaLeccionId } from "@/lib/lecciones"
import {
  type AnotacionLeccion,
  ETIQUETA_MARCA,
  anotacionesPorFecha,
  comentariosCitaDelDia,
  marcasDelDia,
} from "@/lib/anotaciones"
import { getFechasSemana, getSemanaActual } from "@/lib/semana"

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-3 text-base text-slate-700 shadow-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20 transition md:py-2 md:text-sm"

interface NotasPanelProps {
  semana: number
  comentariosPorFecha: Record<string, string>
  selectedDate: string
  diaLeccion: DiaLeccionId
  fechaHoy: string
  anotaciones: AnotacionLeccion[]
  onSeleccionarFecha: (fecha: string) => void
  comentario: string
  setComentario: (texto: string) => void
  cargandoComentarios: boolean
  syncError: string | null
  guardando: boolean
  editFecha: string | null
  editTexto: string
  setEditFecha: (fecha: string | null) => void
  setEditTexto: (texto: string) => void
  onGuardar: (fecha: string, texto: string) => Promise<void>
  onEliminar: (fecha: string) => Promise<void>
  onQuitarMarcas: (id: string) => Promise<void>
  onEliminarComentarioCita: (id: string) => Promise<void>
  onVerTodos: () => void
}

function formatDateDMY(dateStr: string) {
  if (!dateStr) return ""
  const [year, month, day] = dateStr.split("-")
  return `${day}/${month}/${year}`
}

function citaCorta(cita: string, max = 100) {
  return cita.length > max ? `${cita.slice(0, max - 1)}…` : cita
}

export default function NotasPanel({
  semana,
  comentariosPorFecha,
  selectedDate,
  diaLeccion,
  fechaHoy,
  anotaciones,
  onSeleccionarFecha,
  comentario,
  setComentario,
  cargandoComentarios,
  syncError,
  guardando,
  editFecha,
  editTexto,
  setEditFecha,
  setEditTexto,
  onGuardar,
  onEliminar,
  onQuitarMarcas,
  onEliminarComentarioCita,
  onVerTodos,
}: NotasPanelProps) {
  const diasSemana = getFechasSemana(semana)
  const esSemanaActual = semana === getSemanaActual()
  const notaSeleccionada = selectedDate ? comentariosPorFecha[selectedDate] : undefined
  const marcasDia = selectedDate ? marcasDelDia(anotaciones, selectedDate) : []
  const comentariosCitaDia = selectedDate ? comentariosCitaDelDia(anotaciones, selectedDate) : []

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Mis notas</p>
            <p className="text-xs text-slate-500">
              Semana {semana} · {ETIQUETAS_DIA_LECCION[diaLeccion].replace(/ —.*/, "")}
            </p>
          </div>
          <button
            type="button"
            onClick={onVerTodos}
            className="min-h-10 shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm active:opacity-90"
          >
            Ver todos
          </button>
        </div>

        {syncError && (
          <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
            {syncError}
          </div>
        )}

        {cargandoComentarios ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Cargando...
          </div>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-7 gap-1">
              {diasSemana.map((dia) => {
                const tieneNotaLibre = Boolean(comentariosPorFecha[dia.fecha]?.trim())
                const delDia = anotacionesPorFecha(anotaciones, dia.fecha)
                const tieneMarcas = delDia.some((a) => a.marcas.length > 0)
                const tieneComentarioCita = delDia.some((a) => a.comentario.trim())
                const estudiando = selectedDate === dia.fecha
                const esHoy = esSemanaActual && dia.fecha === fechaHoy
                const tieneAlgo = tieneNotaLibre || tieneMarcas || tieneComentarioCita
                return (
                  <button
                    key={dia.fecha}
                    type="button"
                    onClick={() => onSeleccionarFecha(dia.fecha)}
                    className={`relative flex min-h-[4.75rem] flex-col items-center justify-center rounded-lg border px-0.5 py-1.5 text-center transition active:scale-[0.97] ${
                      estudiando
                        ? "border-primary bg-primary text-white shadow-md ring-2 ring-primary ring-offset-1"
                        : tieneAlgo
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-surface text-slate-600"
                    } ${esHoy && !estudiando ? "ring-2 ring-accent/70" : ""}`}
                    title={
                      estudiando
                        ? "Día que estás estudiando"
                        : [
                            tieneMarcas && "Texto marcado",
                            tieneComentarioCita && "Comentarios de citas",
                            tieneNotaLibre && "Nota libre",
                          ]
                            .filter(Boolean)
                            .join(" · ") || (esHoy ? "Hoy" : undefined)
                    }
                  >
                    {estudiando && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-primary px-1 text-[0.5rem] font-bold uppercase text-white shadow">
                        Lee
                      </span>
                    )}
                    <span
                      className={`text-[0.625rem] font-medium leading-none ${estudiando ? "text-white/90" : ""}`}
                    >
                      {dia.diaCorto}
                    </span>
                    <span className="mt-0.5 text-base font-bold leading-none">{dia.diaNum}</span>
                    <span
                      className={`text-[0.5625rem] leading-none ${estudiando ? "text-white/80" : "text-muted"}`}
                    >
                      {dia.mesCorto}
                    </span>
                    {tieneAlgo && (
                      <span className="mt-1 flex gap-0.5" aria-hidden>
                        {tieneMarcas && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${estudiando ? "bg-amber-300" : "bg-amber-500"}`}
                          />
                        )}
                        {tieneComentarioCita && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${estudiando ? "bg-sky-200" : "bg-sky-500"}`}
                          />
                        )}
                        {tieneNotaLibre && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${estudiando ? "bg-white" : "bg-primary"}`}
                          />
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {selectedDate && (
              <p className="mb-2 text-xs font-medium text-primary">
                {formatDateDMY(selectedDate)}
              </p>
            )}

            {marcasDia.length > 0 && (
              <div className="mb-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2.5">
                <p className="text-xs font-semibold text-amber-900">
                  Texto marcado ({marcasDia.length})
                </p>
                <p className="text-[0.6875rem] text-amber-800/90">
                  Resaltados, negritas y subrayados de la lección de este día.
                </p>
                {marcasDia.map((a) => (
                  <article
                    key={a.id}
                    className="rounded-md border border-amber-100 bg-white p-2 text-sm"
                  >
                    <p className="text-[0.6875rem] font-medium text-muted">{a.bloqueTitulo}</p>
                    <blockquote className="mt-1 border-l-2 border-amber-400 pl-2 text-xs italic text-slate-700">
                      «{citaCorta(a.cita)}»
                    </blockquote>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {a.marcas.map((m) => (
                        <span
                          key={m}
                          className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-medium text-amber-900"
                        >
                          {ETIQUETA_MARCA[m]}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-2 text-[0.6875rem] font-medium text-red-600"
                      onClick={() => onQuitarMarcas(a.id)}
                    >
                      Quitar formato del texto
                    </button>
                  </article>
                ))}
              </div>
            )}

            {comentariosCitaDia.length > 0 && (
              <div className="mb-3 space-y-2 rounded-lg border border-sky-200 bg-sky-50/80 p-2.5">
                <p className="text-xs font-semibold text-sky-900">
                  Comentarios de la lección ({comentariosCitaDia.length})
                </p>
                <p className="text-[0.6875rem] text-sky-800/90">
                  Reflexiones sobre pasajes que comentaste desde la barra de edición.
                </p>
                {comentariosCitaDia.map((a) => (
                  <article
                    key={a.id}
                    className="rounded-md border border-sky-100 bg-white p-2 text-sm"
                  >
                    <p className="text-[0.6875rem] font-medium text-muted">{a.bloqueTitulo}</p>
                    <blockquote className="mt-1 border-l-2 border-sky-400 pl-2 text-xs italic text-slate-600">
                      «{citaCorta(a.cita)}»
                    </blockquote>
                    <p className="mt-1.5 text-sm text-slate-800 whitespace-pre-line">{a.comentario}</p>
                    <button
                      type="button"
                      className="mt-2 text-[0.6875rem] font-medium text-red-600"
                      onClick={() => onEliminarComentarioCita(a.id)}
                    >
                      Eliminar comentario
                    </button>
                  </article>
                ))}
              </div>
            )}

            {selectedDate &&
              marcasDia.length === 0 &&
              comentariosCitaDia.length === 0 &&
              !notaSeleccionada && (
                <p className="mb-3 text-xs text-muted">
                  Este día aún no tiene marcas ni comentarios de la lección. Selecciona texto en la
                  lección para marcarlo o comentarlo.
                </p>
              )}

            {selectedDate && notaSeleccionada && editFecha !== selectedDate && (
              <article className="mb-3 rounded-lg border border-border bg-surface/80 p-2.5">
                <p className="text-xs font-semibold text-muted">Nota libre del día</p>
                <time className="mt-1 block text-xs font-medium text-primary">
                  {formatDateDMY(selectedDate)}
                </time>
                <p className="mt-1 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {notaSeleccionada}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    className="flex-1 min-h-10 rounded-md border border-border bg-white text-xs font-medium text-slate-600 active:bg-accent-soft"
                    onClick={() => {
                      setEditFecha(selectedDate)
                      setEditTexto(notaSeleccionada)
                    }}
                    disabled={guardando}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="flex-1 min-h-10 rounded-md border border-red-200 bg-red-50 text-xs font-medium text-red-700 active:bg-red-100"
                    onClick={() => onEliminar(selectedDate)}
                    disabled={guardando}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            )}

            {editFecha && (
              <div className="mb-3 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
                <p className="text-xs font-medium text-primary">Editando {formatDateDMY(editFecha)}</p>
                <textarea
                  value={editTexto}
                  onChange={(e) => setEditTexto(e.target.value)}
                  className={`${inputClass} min-h-24 resize-none`}
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="flex-1 min-h-10 rounded-lg bg-primary text-xs font-medium text-white disabled:opacity-50"
                    disabled={guardando}
                    onClick={async () => {
                      await onGuardar(editFecha, editTexto)
                      setEditFecha(null)
                      if (editFecha === selectedDate) setComentario(editTexto)
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="flex-1 min-h-10 rounded-lg border border-border text-xs font-medium text-slate-600"
                    onClick={() => setEditFecha(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Nota libre del día
        </p>
        <p className="mb-2 text-[0.6875rem] text-muted">
          Solo para tu reflexión general del día. No mezcla con resaltados ni comentarios de citas.
        </p>
        <label className="mb-1 block text-xs text-slate-500">
          Día vinculado a la lección ({diaLeccion.toUpperCase()})
        </label>
        <input
          type="date"
          value={selectedDate}
          min={diasSemana[0]?.fecha}
          max={diasSemana[6]?.fecha}
          onChange={(e) => onSeleccionarFecha(e.target.value)}
          className={inputClass}
        />
        {selectedDate && (
          <div className="mt-2 space-y-2">
            <p className="text-xs font-medium text-primary">
              Escribe para {formatDateDMY(selectedDate)}
            </p>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Reflexión general del día (independiente de la lección)..."
              className={`${inputClass} min-h-28 resize-none`}
            />
            <button
              type="button"
              className="min-h-12 w-full rounded-lg bg-primary py-3 text-base font-medium text-white shadow-md shadow-primary/20 active:opacity-90 disabled:opacity-50"
              disabled={guardando || !comentario.trim()}
              onClick={() => onGuardar(selectedDate, comentario)}
            >
              {guardando ? "Guardando..." : "Guardar nota libre"}
            </button>
          </div>
        )}
      </section>
    </>
  )
}
