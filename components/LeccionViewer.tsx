"use client"

import Image from "next/image"
import { useMemo } from "react"
import TextoLeccionSelectable from "@/components/TextoLeccionSelectable"
import type { AnotacionLeccion, MarcaFormato } from "@/lib/anotaciones"
import {
  ETIQUETAS_DIA_LECCION,
  ORDEN_DIAS_LECCION,
  getBloquesDia,
  getLeccionPorSemana,
  type DiaLeccionId,
} from "@/lib/lecciones"
import {
  fechaEnSemana,
  fechaLocalHoy,
  getFechasSemana,
  getSemanaActual,
  indiceDiaEnSemana,
} from "@/lib/semana"

interface LeccionViewerProps {
  semana: number
  diaActivo: DiaLeccionId
  onDiaActivoChange: (dia: DiaLeccionId) => void
  anotaciones: AnotacionLeccion[]
  onGuardarAnotacion: (datos: {
    cita: string
    bloqueTitulo: string
    marcas?: MarcaFormato[]
    comentario?: string
    anotacionId?: string
  }) => Promise<void>
}

function formatRangoSemana(semana: number): string {
  const dias = getFechasSemana(semana)
  if (dias.length < 7) return `Semana ${semana}`
  const fmt = (f: string) => {
    const [, m, d] = f.split("-")
    return `${Number(d)}/${Number(m)}`
  }
  return `${dias[0].diaCorto} ${fmt(dias[0].fecha)} – ${dias[6].diaCorto} ${fmt(dias[6].fecha)}`
}

export default function LeccionViewer({
  semana,
  diaActivo,
  onDiaActivoChange,
  anotaciones,
  onGuardarAnotacion,
}: LeccionViewerProps) {
  const leccion = getLeccionPorSemana(semana)
  const hoy = fechaLocalHoy()
  const diasCalendario = getFechasSemana(semana)
  const esSemanaActual = semana === getSemanaActual()
  const hoyEnSemana = fechaEnSemana(hoy, semana)
  const indiceHoy = indiceDiaEnSemana(hoy)

  const anotacionesDia = useMemo(
    () => anotaciones.filter((a) => a.semana === semana && a.diaLeccion === diaActivo),
    [anotaciones, semana, diaActivo]
  )

  const bloques = useMemo(
    () => (leccion ? getBloquesDia(leccion, diaActivo) : []),
    [leccion, diaActivo]
  )

  if (!leccion) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">
        No hay lección para la semana {semana}.
      </div>
    )
  }

  const esRepaso = diaActivo === "vie"
  const esDesafio = diaActivo === "sab"
  const fechaDiaActivo = diasCalendario[indiceDeDiaLeccionLocal(diaActivo)]?.fecha

  return (
    <article className="custom-scroll flex h-full flex-col overflow-y-auto bg-card">
      <header className="shrink-0 border-b border-border px-4 py-4 md:px-8">
        <div className="flex gap-3 sm:gap-4">
          <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-primary/20 shadow-md sm:h-28 sm:w-20">
            <Image
              src="/portada.png"
              alt="Portada del trimestre"
              fill
              sizes="80px"
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Semana {semana} · {formatRangoSemana(semana)}
            </p>
            <h2 className="font-display mt-1 text-xl font-semibold text-primary md:text-2xl">
              Lección {leccion.numero} — {leccion.titulo}
            </h2>
          </div>
        </div>
        <p className="mt-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
          <span className="font-semibold">Barra de edición:</span> mantén pulsado y selecciona
          cualquier frase → resaltar, negrita, subrayar o comentar. Se guarda en el día del
          calendario.
        </p>

        <div
          className="mt-3 flex gap-1 overflow-x-auto pb-1 custom-scroll"
          role="tablist"
          aria-label="Día de la lección"
        >
          {ORDEN_DIAS_LECCION.map((id, i) => {
            const activo = diaActivo === id
            const esHoyCal = esSemanaActual && hoyEnSemana && diasCalendario[i]?.fecha === hoy
            const futuro = esSemanaActual && hoyEnSemana && i > indiceHoy
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activo}
                disabled={futuro}
                title={futuro ? "Disponible cuando llegue este día" : undefined}
                onClick={() => onDiaActivoChange(id)}
                className={`shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                  activo
                    ? esRepaso && id === "vie"
                      ? "bg-accent text-white shadow-md"
                      : "bg-primary text-white shadow-md"
                    : futuro
                      ? "cursor-not-allowed border border-border bg-slate-100 text-slate-400"
                      : "border border-border bg-white text-slate-600 active:bg-surface"
                } ${esHoyCal && !activo ? "ring-2 ring-accent/60" : ""}`}
              >
                {diasCalendario[i]?.diaCorto ?? id}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-sm font-medium text-primary">
          {ETIQUETAS_DIA_LECCION[diaActivo]}
          {fechaDiaActivo && (
            <span className="font-normal text-muted">
              {" "}
              · {diasCalendario.find((d) => d.fecha === fechaDiaActivo)?.diaNum}/
              {fechaDiaActivo.split("-")[1]}
            </span>
          )}
          {esSemanaActual && diasCalendario[indiceHoy]?.fecha === fechaDiaActivo && " · Hoy"}
        </p>
      </header>

      <div className="flex-1 px-4 py-5 md:px-8 md:py-6">
        {bloques.map((bloque) => (
          <section
            key={`${diaActivo}-${bloque.titulo}`}
            className={`mb-5 last:mb-0 ${
              esRepaso
                ? "rounded-xl border border-accent/50 bg-accent-soft px-4 py-4"
                : esDesafio
                  ? "rounded-xl border border-primary/30 bg-primary/5 px-4 py-4"
                  : bloque.titulo === "Texto clave"
                    ? "rounded-xl border border-accent/40 bg-accent-soft px-4 py-4"
                    : ""
            }`}
          >
            <h3
              className={`text-sm font-semibold ${
                esRepaso ? "text-amber-900" : "text-primary"
              }`}
            >
              {bloque.titulo}
            </h3>
            <TextoLeccionSelectable
              texto={bloque.texto}
              bloqueTitulo={bloque.titulo}
              anotacionesBloque={anotacionesDia.filter((a) => a.bloqueTitulo === bloque.titulo)}
              onGuardarAnotacion={async (datos) =>
                onGuardarAnotacion({ ...datos, bloqueTitulo: bloque.titulo })
              }
            />
          </section>
        ))}
      </div>
    </article>
  )
}

function indiceDeDiaLeccionLocal(dia: DiaLeccionId): number {
  return ORDEN_DIAS_LECCION.indexOf(dia)
}
