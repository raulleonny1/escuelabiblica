import type { Metadata } from "next"
import Link from "next/link"
import CondicionesServicioPanel from "@/components/CondicionesServicioPanel"

export const metadata: Metadata = {
  title: "Condiciones del servicio | Estudio diario",
  description:
    "Condiciones del servicio de la aplicación Estudio diario y del bot de la Iglesia El Buen Pastor (IERE).",
}

/** Página pública con URL estable para registrar bots u otros servicios. */
export default function CondicionesPage() {
  return (
    <div className="custom-scroll h-full min-h-0 w-full flex-1 overflow-y-auto bg-surface p-4 md:p-6">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Volver al estudio
        </Link>
        <h1 className="font-display mt-3 text-xl font-semibold text-slate-800">
          Condiciones del servicio
        </h1>
        <div className="mt-4">
          <CondicionesServicioPanel mostrarUrl />
        </div>
      </div>
    </div>
  )
}
