"use client"

import AdminAcceso from "@/components/AdminAcceso"
import FontSizeControls from "@/components/FontSizeControls"
import PwaInstallButton from "@/components/PwaInstallButton"

export default function ConfiguracionPanel() {
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
    </div>
  )
}
