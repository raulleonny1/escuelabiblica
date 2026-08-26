"use client"

import Link from "next/link"
import AdminAcceso from "@/components/AdminAcceso"
import FontSizeControls from "@/components/FontSizeControls"
import PwaInstallButton from "@/components/PwaInstallButton"

type Props = {
  /** Se llama al ir a una página legal (para cerrar el panel de configuración). */
  onNavegar?: () => void
}

const linkClase =
  "flex min-h-11 w-full items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-800 shadow-sm transition hover:bg-primary/5 active:bg-primary/10"

export default function ConfiguracionPanel({ onNavegar }: Props) {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="font-display text-base font-semibold text-slate-800">
          Tamaño de letra
        </h3>
        <p className="mt-1 text-sm text-muted">
          Ajusta el texto de toda la aplicación.
        </p>
        <div className="mt-3">
          <FontSizeControls variant="menu" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="font-display text-base font-semibold text-slate-800">
          Administración
        </h3>
        <p className="mt-1 text-sm text-muted">
          Acceso reservado para administradores.
        </p>
        <div className="mt-3">
          <AdminAcceso variant="menu" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="font-display text-base font-semibold text-slate-800">
          Aplicación
        </h3>
        <p className="mt-1 text-sm text-muted">
          Instala la app en tu dispositivo si está disponible.
        </p>
        <div className="mt-3">
          <PwaInstallButton variant="menu" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="font-display text-base font-semibold text-slate-800">
          Privacidad y datos
        </h3>
        <p className="mt-1 text-sm text-muted">
          Documentos legales de Estudio diario.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link href="/privacidad" onClick={onNavegar} className={linkClase}>
            <span aria-hidden>🔒</span>
            Declaración de privacidad
          </Link>
          <Link href="/condiciones" onClick={onNavegar} className={linkClase}>
            <span aria-hidden>📜</span>
            Condiciones del servicio
          </Link>
          <Link href="/eliminacion-datos" onClick={onNavegar} className={linkClase}>
            <span aria-hidden>🗑️</span>
            Eliminación de datos
          </Link>
        </div>
      </section>
    </div>
  )
}
