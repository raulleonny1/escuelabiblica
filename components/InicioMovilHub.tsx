"use client"

import Image from "next/image"
import { useMenuNavegacion } from "@/components/MenuNavegacion"
import { useEstudio } from "@/components/EstudioContext"
import PwaInstallButton from "@/components/PwaInstallButton"
import { getVersiculoDelDia } from "@/lib/versiculosDia"
import type { DiaLeccionId } from "@/lib/lecciones"
import { ETIQUETAS_DIA_LECCION } from "@/lib/lecciones"

type Props = {
  semana: number
  diaLeccion: DiaLeccionId
  onAbrirLeccion: () => void
  onAbrirAudio: () => void
}

function IconoLibro() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16.5H6.5A2.5 2.5 0 0 0 4 22V5.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M4 19.5h16" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 7h8M8 10.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconoAudio() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden>
      <path
        d="M3 12a5.5 5.5 0 0 1 5.5-5.5H10v11H8.5A5.5 5.5 0 0 1 3 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a5.5 5.5 0 0 0-5.5-5.5H14v11h1.5A5.5 5.5 0 0 0 21 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.5V5.25a2.75 2.75 0 0 1 5.5 0V6.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="7.25" cy="16.75" r="1.35" fill="currentColor" />
      <circle cx="16.75" cy="16.75" r="1.35" fill="currentColor" />
      <path
        d="M6.2 9.2c.55-.9 1.15-1.35 1.8-1.55M17.8 9.2c-.55-.9-1.15-1.35-1.8-1.55"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

function IconoBiblia() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7.5v6M9.5 10.5H14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8 17.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconoNotas() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
      <path
        d="M7 3.5h8.5L19 7v13.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M15 3.5V7h3.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconoComunidad() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16.5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3.5 19c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M14 19c.3-2 1.6-3.2 3.5-3.2 1.4 0 2.5.7 3 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconoOracion() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
      <path
        d="M8.5 11.5c0-2.2 1.2-3.5 2.3-4.4.5-.4 1.2-.4 1.7 0 1.1.9 2.3 2.2 2.3 4.4v5.2c0 1.3-.9 2.3-2.2 2.3h-2c-1.2 0-2.1-1-2.1-2.3v-5.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M8.5 13.5H6.8A1.8 1.8 0 0 1 5 11.7V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M15.5 13.5h1.7A1.8 1.8 0 0 0 19 11.7V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconoHoja() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
      <rect x="6" y="3.5" width="12" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 8h6M9 11.5h6M9 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const BOTON_BASE =
  "flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-primary/15 bg-[#f7f4ec] px-2 py-3 text-center text-primary shadow-sm transition active:scale-[0.98] active:bg-primary/5"

export default function InicioMovilHub({
  semana,
  diaLeccion,
  onAbrirLeccion,
  onAbrirAudio,
}: Props) {
  const {
    abrirPanel,
    abrirHojaDominical,
    abrirPedidoOracion,
    chatNoLeidos,
    pedidoSinLeer,
  } = useMenuNavegacion()
  const { estudio } = useEstudio()
  const versiculo = getVersiculoDelDia(semana, diaLeccion)
  const diaCorto = ETIQUETAS_DIA_LECCION[diaLeccion].split(" —")[0]
  const tituloLeccion = estudio
    ? `Lección ${estudio.numeroLeccion}: ${estudio.titulo}`
    : "Lección del día"

  return (
    <div className="custom-scroll flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto bg-[#f3f0e8] lg:hidden">
      <section className="relative shrink-0 overflow-hidden">
        <div className="relative aspect-[16/9] w-full min-h-[9.5rem] max-h-[13rem]">
          <Image
            src="/fondos/banner-inicio-estudio.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
            {versiculo ? (
              <>
                <p className="font-display text-sm leading-snug sm:text-base">
                  «{versiculo.texto}»
                </p>
                <p className="mt-1.5 text-xs font-semibold tracking-wide text-white/90 sm:text-sm">
                  {versiculo.cita}
                </p>
              </>
            ) : (
              <p className="font-display text-sm leading-snug sm:text-base">
                {tituloLeccion}
                <span className="mt-1 block text-xs font-sans font-medium text-white/85">
                  {diaCorto}
                </span>
              </p>
            )}
          </div>
        </div>
        <p className="border-b border-primary/10 bg-[#f7f4ec] px-4 py-2 text-center text-xs text-primary/80">
          {tituloLeccion}
          {estudio?.temaDelDia ? ` · ${estudio.temaDelDia}` : ` · ${diaCorto}`}
        </p>
      </section>

      <nav
        className="grid flex-1 grid-cols-2 content-start gap-3 p-4 pb-8 sm:gap-4 sm:p-5"
        aria-label="Inicio"
      >
        <button type="button" onClick={onAbrirLeccion} className={BOTON_BASE}>
          <IconoLibro />
          <span className="text-sm font-semibold leading-tight">Lección del día</span>
        </button>

        <button type="button" onClick={onAbrirAudio} className={BOTON_BASE}>
          <IconoAudio />
          <span className="text-sm font-semibold leading-tight">Audio del estudio</span>
        </button>

        <button type="button" onClick={() => abrirPanel("biblia")} className={BOTON_BASE}>
          <IconoBiblia />
          <span className="text-sm font-semibold leading-tight">Biblia</span>
        </button>

        <button type="button" onClick={() => abrirPanel("notas")} className={BOTON_BASE}>
          <IconoNotas />
          <span className="text-sm font-semibold leading-tight">Mis notas</span>
        </button>

        <button type="button" onClick={() => abrirPanel("chat")} className={`relative ${BOTON_BASE}`}>
          <span className="relative">
            <IconoComunidad />
            {chatNoLeidos > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.625rem] font-bold text-white">
                {chatNoLeidos > 9 ? "9+" : chatNoLeidos}
              </span>
            )}
          </span>
          <span className="text-sm font-semibold leading-tight">Comunidad</span>
        </button>

        <button
          type="button"
          onClick={abrirPedidoOracion}
          className={`relative ${BOTON_BASE}`}
        >
          <span className="relative">
            <IconoOracion />
            {pedidoSinLeer > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-white">
                {pedidoSinLeer > 9 ? "9+" : pedidoSinLeer}
              </span>
            )}
          </span>
          <span className="text-sm font-semibold leading-tight">Pedir oración</span>
        </button>

        <button type="button" onClick={abrirHojaDominical} className={BOTON_BASE}>
          <IconoHoja />
          <span className="text-sm font-semibold leading-tight">Hoja dominical</span>
        </button>

        <div className={BOTON_BASE}>
          <PwaInstallButton variant="hub" />
        </div>
      </nav>
    </div>
  )
}
