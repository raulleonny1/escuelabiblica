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
    <div className="custom-scroll h-full min-h-0 overflow-y-auto bg-surface p-4 md:p-6">
      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Volver a Estudio diario
        </Link>
      </div>
      <CondicionesServicioPanel mostrarUrl />
    </div>
  )
}
