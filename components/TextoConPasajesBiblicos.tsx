"use client"

import { useState } from "react"
import PasajeBiblicoModal from "@/components/PasajeBiblicoModal"
import { renderTextoConMarcas } from "@/lib/renderTextoMarcado"
import { segmentarPasajesEnTexto } from "@/lib/pasajeBiblico"
import type { AnotacionLeccion } from "@/lib/anotaciones"

type Props = {
  texto: string
  anotaciones: AnotacionLeccion[]
}

export default function TextoConPasajesBiblicos({ texto, anotaciones }: Props) {
  const [pasajeAbierto, setPasajeAbierto] = useState<string | null>(null)
  const segmentos = segmentarPasajesEnTexto(texto)

  return (
    <>
      {segmentos.map((seg, i) =>
        seg.tipo === "pasaje" ? (
          <button
            key={`p-${i}-${seg.referencia}`}
            type="button"
            className="pasaje-biblico-link mx-0.5 inline cursor-pointer rounded-sm border-b border-dotted border-primary/70 bg-primary/5 px-0.5 font-medium text-primary hover:bg-primary/15 active:bg-primary/20"
            onClick={() => setPasajeAbierto(seg.referencia)}
            title={`Leer ${seg.referencia} en la Biblia`}
          >
            {seg.contenido}
          </button>
        ) : (
          <span key={`t-${i}`}>{renderTextoConMarcas(seg.contenido, anotaciones)}</span>
        )
      )}

      {pasajeAbierto && (
        <PasajeBiblicoModal referencia={pasajeAbierto} onCerrar={() => setPasajeAbierto(null)} />
      )}
    </>
  )
}
