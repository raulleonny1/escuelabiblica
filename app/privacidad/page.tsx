import type { Metadata } from "next"
import Link from "next/link"
import PrivacidadPanel from "@/components/PrivacidadPanel"

export const metadata: Metadata = {
  title: "Declaración de privacidad | Estudio diario",
  description:
    "Declaración de privacidad de Estudio diario — Iglesia El Buen Pastor (IERE).",
}

/** Página pública con URL estable (útil junto a /condiciones al registrar bots). */
export default function PrivacidadPage() {
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
      <PrivacidadPanel />
    </div>
  )
}
