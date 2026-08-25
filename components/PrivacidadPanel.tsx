"use client"

const SECCIONES = [
  {
    titulo: "1. Quiénes somos",
    texto:
      "Estudio diario es una aplicación de la Iglesia El Buen Pastor (IERE) para el estudio bíblico semanal. Al usarla, aceptas esta declaración de privacidad.",
  },
  {
    titulo: "2. Datos que usamos",
    texto:
      "Podemos tratar: el nombre que indiques para el chat y los pedidos de oración; tus notas y anotaciones de estudio; mensajes del chat; pedidos de oración que compartas; y datos técnicos de uso (por ejemplo, qué secciones visitas y cuánto tiempo, en un identificador anónimo o de sesión) para mejorar el servicio y, cuando aplica, con fines de administración pastoral interna.",
  },
  {
    titulo: "3. Para qué los usamos",
    texto:
      "Usamos estos datos solo para que funcione la app: guardar tu estudio, permitir el chat y la oración comunitaria, mostrar la lección y la hoja dominical, y conocer de forma general el uso de la herramienta. No vendemos tus datos ni los usamos para publicidad comercial.",
  },
  {
    titulo: "4. Dónde se guardan",
    texto:
      "Parte de la información se guarda en tu dispositivo (por ejemplo, preferencias y copias locales). Otra parte se sincroniza en servicios en la nube (Firebase) para que tus notas, chat y pedidos de oración funcionen entre sesiones. El acceso administrativo está restringido a personas autorizadas de la iglesia.",
  },
  {
    titulo: "5. Chat y pedidos de oración",
    texto:
      "Lo que escribas en el chat o en un pedido de oración compartido puede ser visto por otros usuarios de la comunidad. No publiques datos sensibles de terceros sin su consentimiento. Puedes pedir la eliminación de tus propios pedidos según las opciones disponibles en la app.",
  },
  {
    titulo: "6. Tus opciones",
    texto:
      "Puedes dejar de usar la app en cualquier momento. En tu dispositivo puedes borrar datos locales (caché o almacenamiento del navegador). Si deseas consultar o solicitar la eliminación de datos asociados a tu uso en la nube, contacta a la iglesia a través de los canales habituales (por ejemplo, la página de Facebook de la congregación).",
  },
  {
    titulo: "7. Menores",
    texto:
      "Si un menor usa la aplicación, debe hacerlo con supervisión de un adulto responsable. La app está pensada para el estudio comunitario de la congregación.",
  },
  {
    titulo: "8. Cambios",
    texto:
      "Podemos actualizar esta declaración cuando sea necesario. La versión vigente estará siempre disponible en el menú de la aplicación.",
  },
]

export default function PrivacidadPanel() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 pb-6">
      <p className="text-sm leading-relaxed text-slate-700">
        Declaración de privacidad de <span className="font-semibold">Estudio diario</span>.
        Última actualización: agosto 2026.
      </p>

      {SECCIONES.map((s) => (
        <section
          key={s.titulo}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <h3 className="font-display text-base font-semibold text-slate-800">{s.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.texto}</p>
        </section>
      ))}

      <p className="px-1 text-xs text-muted">
        Iglesia El Buen Pastor · IERE
      </p>
    </div>
  )
}
