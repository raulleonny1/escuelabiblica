"use client"

const SECCIONES_APP = [
  {
    titulo: "1. Aceptación",
    texto:
      "Al usar Estudio diario (la aplicación web o instalada como PWA) aceptas estas Condiciones del servicio. Si no estás de acuerdo, no uses la aplicación ni los servicios asociados.",
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
      "Puedes indicar un nombre para chat y oración. Eres responsable de lo que publiques. El tratamiento de datos se describe en la Declaración de privacidad disponible en el menú y en /privacidad.",
  },
  {
    titulo: "6. Disponibilidad",
    texto:
      "Nos esforzamos por mantener la app disponible, pero puede haber interrupciones por mantenimiento, fallos técnicos o causas ajenas. No garantizamos disponibilidad ininterrumpida ni ausencia total de errores.",
  },
]

const SECCIONES_BOT = [
  {
    titulo: "7. El bot (servicio automatizado)",
    texto:
      "Además de la aplicación, la Iglesia El Buen Pastor puede ofrecer un bot (asistente automatizado) en plataformas de mensajería u otros canales, vinculado al ministerio de Estudio diario. Al iniciar una conversación o usar el bot, aceptas estas mismas condiciones en lo que aplique al bot.",
  },
  {
    titulo: "8. Qué hace el bot",
    texto:
      "El bot puede enviar o responder con información sobre estudios, recordatorios, oraciones, enlaces a la app u otros contenidos pastorales. Sus respuestas son de apoyo espiritual e informativo; no sustituyen el consejo pastoral personal, médico, legal o profesional.",
  },
  {
    titulo: "9. Uso del bot",
    texto:
      "Usa el bot de forma respetuosa. No envíes contenido ilegal, ofensivo, spam ni datos sensibles de terceros. Podemos limitar, suspender o desactivar el bot o tu acceso si hay abuso o riesgo para la comunidad.",
  },
  {
    titulo: "10. Mensajes y plataformas",
    texto:
      "Los mensajes que intercambias con el bot pasan también por la plataforma externa (por ejemplo WhatsApp, Messenger, Telegram u otra). Esa plataforma tiene sus propias condiciones y privacidad; te recomendamos revisarlas. Nosotros tratamos los datos del bot solo para prestar el servicio pastoral descrito.",
  },
  {
    titulo: "11. Limitación de responsabilidad",
    texto:
      "Ni la app ni el bot se ofrecen como servicio profesional de emergencia. En crisis graves busca ayuda humana inmediata. No somos responsables de daños derivados del uso o la imposibilidad de uso de la app o del bot, en la medida que permita la ley aplicable.",
  },
  {
    titulo: "12. Cambios y contacto",
    texto:
      "Podemos actualizar estas condiciones. La versión vigente estará en la app (menú) y en la URL pública /condiciones. Para consultas: contacta a la Iglesia El Buen Pastor (IERE) por los canales habituales, como su página de Facebook.",
  },
]

type CondicionesServicioPanelProps = {
  /** Si true, muestra un aviso con la URL pública útil para registrar el bot. */
  mostrarUrl?: boolean
}

export default function CondicionesServicioPanel({
  mostrarUrl = false,
}: CondicionesServicioPanelProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 pb-6">
      <p className="text-sm leading-relaxed text-slate-700">
        Condiciones del servicio de <span className="font-semibold">Estudio diario</span> y
        del <span className="font-semibold">bot</span> asociado. Última actualización: agosto
        2026.
      </p>

      {mostrarUrl && (
        <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-muted">
          URL pública de estas condiciones (para registro del bot u otros servicios):{" "}
          <span className="break-all font-medium text-primary">
            https://www.elbuenpastor.online/condiciones
          </span>
        </p>
      )}

      <h3 className="pt-1 font-display text-sm font-semibold uppercase tracking-wide text-primary">
        Aplicación Estudio diario
      </h3>
      {SECCIONES_APP.map((s) => (
        <section
          key={s.titulo}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <h4 className="font-display text-base font-semibold text-slate-800">{s.titulo}</h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.texto}</p>
        </section>
      ))}

      <h3 className="pt-2 font-display text-sm font-semibold uppercase tracking-wide text-primary">
        Bot / asistente automatizado
      </h3>
      {SECCIONES_BOT.map((s) => (
        <section
          key={s.titulo}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <h4 className="font-display text-base font-semibold text-slate-800">{s.titulo}</h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.texto}</p>
        </section>
      ))}

      <p className="px-1 text-xs text-muted">Iglesia El Buen Pastor · IERE</p>
    </div>
  )
}
