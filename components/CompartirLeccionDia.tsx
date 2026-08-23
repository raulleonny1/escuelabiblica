"use client"

import { useMemo, useState } from "react"
import type { BloqueLeccion, DiaLeccionId } from "@/lib/lecciones"
import {
  formatearLeccionDiaParaCompartir,
  resumenLeccionParaX,
} from "@/lib/compartirLeccionDia"
import {
  abrirFacebookCompartir,
  abrirInstagram,
  abrirWhatsApp,
  abrirX,
  copiarAlPortapapeles,
  urlPaginaActual,
} from "@/lib/compartirRedes"

type CompartirLeccionDiaProps = {
  semana: number
  dia: DiaLeccionId
  numeroLeccion: number
  tituloLeccion: string
  bloques: BloqueLeccion[]
}

const btn =
  "h-7 shrink-0 rounded px-2.5 text-[0.7rem] font-semibold leading-none text-white transition hover:brightness-105"

export default function CompartirLeccionDia({
  semana,
  dia,
  numeroLeccion,
  tituloLeccion,
  bloques,
}: CompartirLeccionDiaProps) {
  const [aviso, setAviso] = useState<string | null>(null)

  const textoElegante = useMemo(
    () =>
      formatearLeccionDiaParaCompartir({
        semana,
        dia,
        numeroLeccion,
        tituloLeccion,
        bloques,
      }),
    [semana, dia, numeroLeccion, tituloLeccion, bloques]
  )

  const textoX = useMemo(
    () =>
      resumenLeccionParaX({
        numeroLeccion,
        tituloLeccion,
        dia,
        bloques,
      }),
    [numeroLeccion, tituloLeccion, dia, bloques]
  )

  function avisar(msg: string) {
    setAviso(msg)
    window.setTimeout(() => setAviso(null), 9000)
  }

  if (bloques.length === 0) return null

  return (
    <div className="mt-3 rounded-lg border border-border/80 bg-surface/80 px-2.5 py-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
          Compartir lección del día
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className={`${btn} bg-[#25D366]`}
            onClick={() => abrirWhatsApp(textoElegante)}
          >
            WhatsApp
          </button>
          <button
            type="button"
            className={`${btn} bg-[#1877F2]`}
            onClick={async () => {
              const ok = await copiarAlPortapapeles(textoElegante)
              avisar(
                ok
                  ? "Lección copiada. En Facebook pégala (Ctrl+V) y publica."
                  : "Copia el texto a mano y pégalo en Facebook."
              )
              abrirFacebookCompartir(urlPaginaActual())
            }}
          >
            Facebook
          </button>
          <button
            type="button"
            className={`${btn} bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af]`}
            onClick={async () => {
              const ok = await copiarAlPortapapeles(textoElegante)
              avisar(
                ok
                  ? "Lección copiada. En Instagram pégala en la publicación (mantener → Pegar)."
                  : "Copia el texto a mano y pégalo en Instagram."
              )
              abrirInstagram()
            }}
          >
            Instagram
          </button>
          <button
            type="button"
            className={`${btn} bg-black hover:bg-neutral-800`}
            onClick={async () => {
              // X tiene límite: resumen + texto completo en portapapeles
              await copiarAlPortapapeles(textoElegante)
              avisar("Texto completo copiado. En X se abre un resumen; puedes pegar el resto.")
              abrirX(textoX)
            }}
          >
            X
          </button>
        </div>
      </div>
      {aviso && (
        <p className="mt-1.5 text-[0.65rem] leading-snug text-amber-900">{aviso}</p>
      )}
    </div>
  )
}
