"use client"

const SECCIONES = [
  {
    titulo: "1. Aceptación",
    texto:
      "Al usar Estudio diario (la aplicación web o instalada como PWA) aceptas estas Condiciones del servicio. Si no estás de acuerdo, no uses la aplicación.",
  },
  {
    titulo: "2. Descripción del servicio",
    texto:
      "Estudio diario ofrece contenido de estudio bíblico (lecciones, Biblia, notas, audio, hoja dominical), chat comunitario y pedidos de oración para la comunidad de la Iglesia El Buen Pastor (IERE). El servicio se ofrece con fines pastorales y educativos, sin garantía comercial.",
  },
  {
    titulo: "3. Uso adecuado",
    texto:
      "Te comprometes a usar la app de forma respetuosa: no insultar, acosar, publicar contenido ilegal, spam o datos ajenos sin permiso. El chat y los pedidos de oración son espacios de fe; el mal uso puede implicar la restricción del acceso.",
  },
  {
    titulo: "4. Contenido y propiedad",
    texto:
      "Las lecciones, textos y materiales de la app pertenecen a la iglesia o a sus autores según corresponda. La Biblia mostrada se ofrece para estudio personal. No está permitido copiar o redistribuir el contenido de forma masiva o comercial sin autorización.",
  },
  {
    titulo: "5. Cuentas y datos",
    texto:
      "Puedes indicar un nombre para chat y oración. Eres responsable de lo que publiques. El tratamiento de datos se describe en la Declaración de privacidad (/privacidad). Para solicitar el borrado, consulta Eliminación de datos (/eliminacion-datos).",
  },
  {
    titulo: "6. Disponibilidad",
    texto:
      "Nos esforzamos por mantener la app disponible, pero puede haber interrupciones por mantenimiento, fallos técnicos o causas ajenas. No garantizamos disponibilidad ininterrumpida ni ausencia total de errores.",
  },
  {
    titulo: "7. Limitación de responsabilidad",
    texto:
      "La app no se ofrece como servicio profesional de emergencia. En crisis graves busca ayuda humana inmediata. No somos responsables de daños derivados del uso o la imposibilidad de uso de la aplicación, en la medida que permita la ley aplicable.",
  },
  {
    titulo: "8. Cambios y contacto",
    texto:
      "Podemos actualizar estas condiciones. La versión vigente estará en el menú y en /condiciones. Para consultas: Iglesia El Buen Pastor (IERE), por ejemplo a través de su página de Facebook.",
  },
]

type CondicionesServicioPanelProps = {
  /** Si true, muestra la URL pública de esta página. */
  mostrarUrl?: boolean
}

export default function CondicionesServicioPanel({
  mostrarUrl = false,
}: CondicionesServicioPanelProps) {
  return (
    <div className="w-full max-w-none space-y-3 pb-6">
      <p className="text-sm leading-relaxed text-slate-700">
        Condiciones del servicio de{" "}
        <span className="font-semibold">Estudio diario</span>. Última actualización: agosto
        2026.
      </p>

      {mostrarUrl && (
        <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-muted">
          URL pública:{" "}
          <span className="break-all font-medium text-primary">
            https://www.elbuenpastor.online/condiciones
          </span>
        </p>
      )}

      {SECCIONES.map((s) => (
        <section
          key={s.titulo}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <h3 className="font-display text-base font-semibold text-slate-800">{s.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.texto}</p>
        </section>
      ))}

      <p className="px-1 text-xs text-muted">Iglesia El Buen Pastor · IERE</p>
    </div>
  )
}
