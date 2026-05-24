"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef } from "react"
import TextoLeccionSelectable from "@/components/TextoLeccionSelectable"
import VersiculoDelDiaCard from "@/components/VersiculoDelDiaCard"
import HojaDominicalBoton from "@/components/HojaDominicalBoton"
import PedidoOracionBoton from "@/components/PedidoOracionBoton"
import type { AnotacionLeccion, MarcaFormato } from "@/lib/anotaciones"
import { PORTADA_SRC } from "@/lib/portada"
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

  const tabsDiaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activo = tabsDiaRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    activo?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" })
  }, [diaActivo, semana])

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
      <header className="shrink-0 border-b border-border bg-card px-2 py-2 sm:px-4 sm:py-3 md:px-8 md:py-4">
        <div className="hidden gap-3 sm:flex sm:items-stretch md:gap-4">
          <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-primary/20 shadow-md md:h-28 md:w-20">
            <Image
              src={PORTADA_SRC}
              unoptimized
              alt=""
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
          <div className="hidden shrink-0 items-center gap-2 self-center md:flex">
            <HojaDominicalBoton semana={semana} fecha={fechaDiaActivo} />
            <PedidoOracionBoton />
          </div>
          <VersiculoDelDiaCard semana={semana} dia={diaActivo} />
        </div>

        <div className="min-w-0 sm:hidden">
          <h2 className="font-display line-clamp-2 text-base font-semibold leading-snug text-primary">
            L{leccion.numero}: {leccion.titulo}
          </h2>
          <p className="mt-0.5 text-[0.6875rem] text-muted">
            {ETIQUETAS_DIA_LECCION[diaActivo].split(" —")[0]} · Sem. {semana}
          </p>
          <div className="mt-2 flex items-stretch gap-2 md:hidden">
            <HojaDominicalBoton semana={semana} fecha={fechaDiaActivo} className="shrink-0" />
            <PedidoOracionBoton className="shrink-0" />
            <VersiculoDelDiaCard semana={semana} dia={diaActivo} compact className="min-w-0 flex-1" />
          </div>
        </div>

        <p className="mt-2 hidden rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary lg:block">
          <span className="font-semibold">Barra de edición:</span> selecciona texto para resaltar,
          negrita, subrayar o comentar.
        </p>

        <div
          ref={tabsDiaRef}
          className="mt-2 flex gap-0.5 overflow-x-auto pb-0.5 custom-scroll sm:mt-3 sm:gap-1"
          role="tablist"
          aria-label="Día de la lección"
        >
          {ORDEN_DIAS_LECCION.map((id, i) => {
            const activo = diaActivo === id
            const esHoyCal = esSemanaActual && hoyEnSemana && diasCalendario[i]?.fecha === hoy
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => onDiaActivoChange(id)}
                className={`shrink-0 rounded-md px-2 py-1.5 text-[0.6875rem] font-semibold transition sm:rounded-lg sm:px-2.5 sm:py-2 sm:text-xs ${
                  activo
                    ? esRepaso && id === "vie"
                      ? "bg-accent text-white shadow-md"
                      : "bg-primary text-white shadow-md"
                    : "border border-border bg-white text-slate-600 hover:border-primary/40 hover:bg-primary/5 active:bg-surface"
                } ${esHoyCal && !activo ? "ring-2 ring-accent/60" : ""}`}
              >
                {diasCalendario[i]?.diaCorto ?? id}
              </button>
            )
          })}
        </div>
        <p className="mt-1 hidden text-sm font-medium text-primary sm:block">
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

      <div className="flex-1 px-3 py-3 sm:px-4 sm:py-5 md:px-8 md:py-6">
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
