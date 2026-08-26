import type { Metadata } from "next"
import Link from "next/link"
import PrivacidadPanel from "@/components/PrivacidadPanel"

export const metadata: Metadata = {
  title: "Declaración de privacidad | Estudio diario",
  description:
    "Declaración de privacidad de Estudio diario — Iglesia El Buen Pastor (IERE).",
}

export default function PrivacidadPage() {
  return (
    <div className="custom-scroll h-full min-h-0 w-full flex-1 overflow-y-auto bg-surface p-4 md:p-6">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          ← Volver al estudio
        </Link>
        <h1 className="font-display mt-3 text-xl font-semibold text-slate-800">
          Declaración de privacidad
        </h1>
        <div className="mt-4">
          <PrivacidadPanel />
        </div>
      </div>
    </div>
  )
}
