"use client"

const PASOS = [
  {
    titulo: "1. Qué datos podemos tener",
    texto:
      "Según cómo uses Estudio diario o el bot asociado, pueden existir: el nombre que indicaste; notas y anotaciones de estudio; mensajes del chat; pedidos de oración; y datos técnicos de uso (sesión o visitas). Parte de esa información está en tu dispositivo y otra en nuestros servicios en la nube.",
  },
  {
    titulo: "2. Cómo solicitar la eliminación",
    texto:
      "Para pedir que eliminemos tus datos asociados a la app o al bot, envía una solicitud por uno de estos canales:",
    lista: [
      "Facebook de la iglesia: https://www.facebook.com/elbuenpastoriere — escribe un mensaje privado indicando «Solicitud de eliminación de datos» y el nombre que usas en la app o en el bot.",
      "Si ya chateas con el bot, puedes enviar el mismo mensaje («Solicitud de eliminación de datos») desde esa conversación.",
    ],
  },
  {
    titulo: "3. Qué debes incluir",
    texto:
      "Para poder localizar y borrar tus datos, indica: (a) el nombre exacto que usaste en chat o pedidos de oración; (b) la plataforma (app Estudio diario, Facebook, WhatsApp u otra); (c) si quieres borrar todo o solo alguna parte (por ejemplo, solo pedidos de oración).",
  },
  {
    titulo: "4. Qué haremos",
    texto:
      "Tras verificar la solicitud, eliminaremos o anonimizaremos los datos personales asociados a tu uso (notas, mensajes, pedidos, registros de uso vinculados a ti), salvo lo que la ley nos obligue a conservar temporalmente. Te confirmaremos cuando el proceso esté hecho, normalmente en un plazo de 30 días.",
  },
  {
    titulo: "5. Datos en tu dispositivo",
    texto:
      "También puedes borrar datos locales en tu navegador o teléfono: ajustes del sitio → borrar datos / cookies / almacenamiento del sitio www.elbuenpastor.online. Si desinstalas la PWA, elimina además los datos de la aplicación en el sistema.",
  },
  {
    titulo: "6. Datos en plataformas de terceros",
    texto:
      "Si usaste Facebook Login u otra plataforma, también puedes gestionar o eliminar permisos y datos desde la configuración de esa plataforma (por ejemplo, Configuración de Facebook → Aplicaciones y sitios web).",
  },
]

export default function EliminacionDatosPanel() {
  return (
    <div className="w-full max-w-none space-y-3 pb-6">
      <p className="text-sm leading-relaxed text-slate-700">
        Instrucciones para solicitar la{" "}
        <span className="font-semibold">eliminación de tus datos</span> en Estudio diario y
        en el bot asociado. Iglesia El Buen Pastor (IERE). Última actualización: agosto 2026.
      </p>

      <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-muted">
        URL pública de estas instrucciones (para Meta / registro de apps y bots):{" "}
        <span className="break-all font-medium text-primary">
          https://www.elbuenpastor.online/eliminacion-datos
        </span>
      </p>

      {PASOS.map((s) => (
        <section
          key={s.titulo}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <h3 className="font-display text-base font-semibold text-slate-800">{s.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.texto}</p>
          {"lista" in s && s.lista && (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
              {s.lista.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="px-1 text-xs text-muted">
        Más información en la{" "}
        <a href="/privacidad" className="font-medium text-primary hover:underline">
          Declaración de privacidad
        </a>
        .
      </p>
    </div>
  )
}
