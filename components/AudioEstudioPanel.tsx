"use client"

import Image from "next/image"
import { useEffect, type KeyboardEvent, type MouseEvent } from "react"
import type { DiaLeccionId } from "@/lib/lecciones"
import { useAudioEstudio, formatTiempo, VELOCIDADES_AUDIO } from "@/components/AudioEstudioProvider"
import { useMenuNavegacion } from "@/components/MenuNavegacion"

type Props = {
  semana: number
  diaLeccion: DiaLeccionId
  onVerLeccion: () => void
  onCerrar: () => void
}

export default function AudioEstudioPanel({
  semana,
  diaLeccion,
  onVerLeccion,
  onCerrar,
}: Props) {
  const {
    sesion,
    estado,
    tiempo,
    velocidad,
    volumen,
    cargarSesion,
    reproducir,
    alternarPausa,
    saltarSegundos,
    buscarFraccion,
    setVelocidad,
    setVolumen,
  } = useAudioEstudio()
  const { abrirPanel, abrirPedidoOracion } = useMenuNavegacion()

  useEffect(() => {
    cargarSesion(semana, diaLeccion)
  }, [semana, diaLeccion, cargarSesion])

  const pct =
    tiempo.total > 0 ? Math.min(1, Math.max(0, tiempo.actual / tiempo.total)) : 0
  const reproduciendo = estado === "playing"
  const enCurso = estado === "playing" || estado === "paused"
  const noDisponible = estado === "unavailable"
  const error = estado === "error"
  const cargando = estado === "loading"

  function onSeekClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    buscarFraccion(x / rect.width)
  }

  function onSeekKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") saltarSegundos(15)
    if (e.key === "ArrowLeft") saltarSegundos(-15)
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 pb-6">
      <header className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Lección de esta semana
        </p>
      </header>

      {/* Hero lección */}
      <section className="overflow-hidden rounded-2xl border border-primary/15 bg-[#f7f4ec] shadow-sm">
        <div className="relative aspect-[16/10] w-full bg-primary/10">
          {sesion?.imagen && (
            <Image
              src={sesion.imagen}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover object-center"
              unoptimized
              priority
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/25 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-amber-200">
              Estudio bíblico
            </p>
            <h3 className="font-display mt-1 text-xl font-semibold leading-snug sm:text-2xl">
              {sesion ? `Lección ${sesion.numeroLeccion}` : "Lección"}
              {sesion?.titulo ? ` — ${sesion.titulo}` : ""}
            </h3>
            {sesion?.descripcion && (
              <p className="mt-1 text-sm text-white/85">{sesion.descripcion}</p>
            )}
          </div>
        </div>
      </section>

      {/* Reproductor */}
      <section className="rounded-2xl border border-primary/15 bg-white p-4 shadow-sm sm:p-5">
        {noDisponible && (
          <p className="rounded-xl bg-primary/5 px-4 py-6 text-center text-sm leading-relaxed text-primary">
            {sesion?.mensajeNoDisponible ??
              "El audio de esta lección estará disponible próximamente."}
          </p>
        )}

        {error && (
          <p className="mb-3 rounded-xl bg-accent-soft px-4 py-3 text-center text-sm text-amber-900">
            No se pudo reproducir el audio. Inténtalo de nuevo en unos segundos.
          </p>
        )}

        {!noDisponible && (
          <>
            <div className="mb-4 flex items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => saltarSegundos(-15)}
                disabled={!enCurso && estado !== "ready"}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-[#f7f4ec] text-sm font-bold text-primary transition active:scale-95 disabled:opacity-40"
                aria-label="Retroceder 15 segundos"
              >
                −15
              </button>

              <button
                type="button"
                onClick={() => {
                  if (estado === "ready" || estado === "idle" || error) reproducir()
                  else alternarPausa()
                }}
                disabled={cargando}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg transition active:scale-95 disabled:opacity-60 sm:h-[4.5rem] sm:w-[4.5rem]"
                aria-label={reproduciendo ? "Pausar" : "Reproducir"}
              >
                {cargando ? (
                  <span className="text-sm font-semibold">…</span>
                ) : reproduciendo ? (
                  "⏸"
                ) : (
                  "▶"
                )}
              </button>

              <button
                type="button"
                onClick={() => saltarSegundos(15)}
                disabled={!enCurso && estado !== "ready"}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-[#f7f4ec] text-sm font-bold text-primary transition active:scale-95 disabled:opacity-40"
                aria-label="Adelantar 15 segundos"
              >
                +15
              </button>
            </div>

            <div
              role="slider"
              tabIndex={0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct * 100)}
              aria-label="Progreso del audio"
              onClick={onSeekClick}
              onKeyDown={onSeekKey}
              className="group relative h-3 cursor-pointer rounded-full bg-primary/15 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width]"
                style={{ width: `${pct * 100}%` }}
              />
              <span
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow"
                style={{ left: `calc(${pct * 100}% - 0.5rem)` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs font-medium text-muted">
              <span>{formatTiempo(tiempo.actual)}</span>
              <span>
                {cargando
                  ? "Cargando…"
                  : reproduciendo
                    ? "Reproduciendo"
                    : estado === "paused"
                      ? "En pausa"
                      : "Listo"}
                {" · "}
                {formatTiempo(tiempo.total)}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary/80">
                  Velocidad
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {VELOCIDADES_AUDIO.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVelocidad(v)}
                      className={`min-h-10 rounded-lg px-2.5 text-sm font-semibold transition ${
                        velocidad === v
                          ? "bg-primary text-white"
                          : "border border-primary/20 bg-[#f7f4ec] text-primary"
                      }`}
                    >
                      {v}×
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary/80">
                  Volumen
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volumen}
                  onChange={(e) => setVolumen(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                  aria-label="Volumen"
                />
              </label>
            </div>

            {sesion?.modo === "tts" && (
              <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-muted">
                Audio generado a partir del estudio del día (voz del dispositivo).
              </p>
            )}
          </>
        )}
      </section>

      {/* Acciones */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-wide text-primary/70">
          Acciones
        </p>
        <Accion
          icono="📖"
          label="Ver la lección"
          onClick={() => {
            onCerrar()
            onVerLeccion()
          }}
        />
        <Accion
          icono="✝️"
          label="Abrir Biblia"
          onClick={() => abrirPanel("biblia")}
        />
        <Accion
          icono="📝"
          label="Escribir una nota"
          onClick={() => abrirPanel("notas")}
        />
        <Accion
          icono="🙏"
          label="Pedir oración"
          onClick={abrirPedidoOracion}
        />
        <Accion
          icono="💬"
          label="Compartir con la comunidad"
          onClick={() => abrirPanel("chat")}
        />
      </section>
    </div>
  )
}

function Accion({
  icono,
  label,
  onClick,
}: {
  icono: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-primary/15 bg-[#f7f4ec] px-4 text-left text-base font-medium text-primary shadow-sm transition hover:bg-primary/5 active:bg-primary/10"
    >
      <span className="text-xl" aria-hidden>
        {icono}
      </span>
      {label}
    </button>
  )
}
