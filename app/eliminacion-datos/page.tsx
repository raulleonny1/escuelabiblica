import type { Metadata } from "next"
import Link from "next/link"
import EliminacionDatosPanel from "@/components/EliminacionDatosPanel"

export const metadata: Metadata = {
  title: "Eliminación de datos | Estudio diario",
  description:
    "Cómo solicitar la eliminación de tus datos en Estudio diario y el bot — Iglesia El Buen Pastor (IERE).",
}

/**
 * URL pública exigida por Meta/Facebook para apps y bots
 * que tratan datos de usuarios (instrucciones de eliminación).
 */
export default function EliminacionDatosPage() {
  return (
    <div className="custom-scroll h-full min-h-0 w-full flex-1 overflow-y-auto bg-surface p-4 md:p-6">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Volver al estudio
        </Link>
        <h1 className="font-display mt-3 text-xl font-semibold text-slate-800">
          Eliminación de datos
        </h1>
        <div className="mt-4">
          <EliminacionDatosPanel />
        </div>
      </div>
    </div>
  )
}
