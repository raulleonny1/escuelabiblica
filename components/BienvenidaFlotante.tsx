"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { safeLocalGet, safeLocalSet } from "@/lib/storage"

type Props = {
  nombre: string
}

type TipoMensaje = "bienvenida" | "diario" | "exhortacion"

type MensajeUi = {
  tipo: TipoMensaje
  emoji: string
  titulo: string
  texto: string
}

const KEY_ULTIMA_VISITA = "bienvenidaUltimaVisita"
const KEY_ULTIMO_DIA_MOSTRADO = "bienvenidaUltimoDiaMostrado"
const KEY_PRIMER_SALUDO = "bienvenidaPrimerSaludoHecho"
const DIAS_EXHORTACION = 3

const MENSAJES_DIARIOS: Omit<MensajeUi, "tipo">[] = [
  {
    emoji: "😊",
    titulo: "Qué alegría verte hoy",
    texto: "Aparta unos minutos para escuchar al Señor y caminar de nuevo en su Palabra.",
  },
  {
    emoji: "🙏",
    titulo: "Un día más con la Palabra",
    texto: "La constancia pequeña de cada día también forma una fe fuerte y serena.",
  },
  {
    emoji: "✨",
    titulo: "Sigue adelante",
    texto: "Dios honra el corazón que vuelve a su estudio con humildad y deseo de aprender.",
  },
  {
    emoji: "☀️",
    titulo: "Hoy también te espera el Señor",
    texto: "Lee, escucha y ora con calma; una sola verdad bien recibida puede sostener todo el día.",
  },
  {
    emoji: "📖",
    titulo: "Tu estudio de hoy importa",
    texto: "No subestimes lo que Dios puede hacer cuando le das unos minutos con atención.",
  },
  {
    emoji: "💛",
    titulo: "Bienvenido otra vez",
    texto: "Cada día es una nueva oportunidad para crecer en Cristo. ¡Qué bueno que estás aquí!",
  },
  {
    emoji: "🌿",
    titulo: "Paz para tu día",
    texto: "Que este momento de estudio te renueve por dentro y te acompañe en lo que viene.",
  },
]

const MENSAJES_EXHORTACION: Omit<MensajeUi, "tipo">[] = [
  {
    emoji: "😢",
    titulo: "Te echábamos de menos",
    texto: "Aunque hayas estado lejos algunos días, siempre es buen momento para volver a la Palabra.",
  },
  {
    emoji: "🥺",
    titulo: "Qué bueno que has vuelto",
    texto: "El Señor sigue llamándote con amor. Retoma hoy el estudio y vuelve a encender el hábito.",
  },
  {
    emoji: "😔",
    titulo: "Te esperábamos",
    texto: "No empieces por la culpa sino por la gracia. Da hoy un paso sencillo y el Señor hará el resto.",
  },
  {
    emoji: "💔",
    titulo: "Volviste… ¡gracias!",
    texto: "La fe se cuida un día a la vez. Hoy puedes empezar de nuevo, con ánimo y confianza.",
  },
]

function inicioDiaLocal(fecha = new Date()): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
}

function claveDiaLocal(fecha = new Date()): string {
  const y = fecha.getFullYear()
  const m = `${fecha.getMonth() + 1}`.padStart(2, "0")
  const d = `${fecha.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function diasEntre(aIso: string, b: Date): number {
  const a = new Date(aIso)
  if (Number.isNaN(a.getTime())) return 0
  const ms = inicioDiaLocal(b).getTime() - inicioDiaLocal(a).getTime()
  return Math.max(0, Math.floor(ms / 86400000))
}

function resolverMensaje(nombre: string): MensajeUi | null {
  const hoy = new Date()
  const hoyKey = claveDiaLocal(hoy)
  const ultimoDiaMostrado = safeLocalGet(KEY_ULTIMO_DIA_MOSTRADO)
  if (ultimoDiaMostrado === hoyKey) return null

  const primeraVez = safeLocalGet(KEY_PRIMER_SALUDO) !== "1"
  const ultimaVisita = safeLocalGet(KEY_ULTIMA_VISITA)

  if (primeraVez) {
    return {
      tipo: "bienvenida",
      emoji: "🎉",
      titulo: `¡Bienvenido, ${nombre}!`,
      texto: "Nos alegra tenerte aquí. Que este espacio te acerque cada día más a Cristo y a su Palabra.",
    }
  }

  if (ultimaVisita) {
    const dias = diasEntre(ultimaVisita, hoy)
    if (dias >= DIAS_EXHORTACION) {
      const base =
        MENSAJES_EXHORTACION[dias % MENSAJES_EXHORTACION.length] ?? MENSAJES_EXHORTACION[0]!
      return { tipo: "exhortacion", ...base }
    }
  }

  const base = MENSAJES_DIARIOS[hoy.getDay() % MENSAJES_DIARIOS.length] ?? MENSAJES_DIARIOS[0]!
  return { tipo: "diario", ...base }
}

function etiquetaTipo(tipo: TipoMensaje): string {
  if (tipo === "bienvenida") return "Primera visita"
  if (tipo === "exhortacion") return "Te extrañábamos"
  return "Estudio diario"
}

export default function BienvenidaFlotante({ nombre }: Props) {
  const [cerrado, setCerrado] = useState(false)
  const [listo, setListo] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const mensaje = useMemo(() => resolverMensaje(nombre), [nombre])

  useEffect(() => {
    if (!mensaje) return
    const timer = window.setTimeout(() => setListo(true), 350)
    return () => window.clearTimeout(timer)
  }, [mensaje])

  useEffect(() => {
    if (!listo || cerrado) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [listo, cerrado])

  function marcarCerrado() {
    safeLocalSet(KEY_PRIMER_SALUDO, "1")
    safeLocalSet(KEY_ULTIMO_DIA_MOSTRADO, claveDiaLocal())
    safeLocalSet(KEY_ULTIMA_VISITA, new Date().toISOString())
  }

  function cerrar() {
    setSaliendo(true)
    marcarCerrado()
    window.setTimeout(() => setCerrado(true), 180)
  }

  if (!mensaje || cerrado || !listo) return null

  return (
    <div
      className={`fixed inset-0 z-[58] flex items-center justify-center p-4 transition-opacity duration-200 ${
        saliendo ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bienvenida-flotante-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[6px]"
        aria-label="Cerrar bienvenida"
        onClick={cerrar}
      />

      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-primary/15 bg-[#f7f4ec] shadow-2xl shadow-slate-900/25 transition-all duration-200 ${
          saliendo ? "translate-y-2 scale-[0.98]" : "translate-y-0 scale-100"
        }`}
      >
        <button
          type="button"
          onClick={cerrar}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-800 active:scale-95"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="bg-gradient-to-br from-primary via-primary to-primary-dark px-5 pb-8 pt-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-4xl shadow-inner ring-2 ring-white/25">
            <span aria-hidden>{mensaje.emoji}</span>
          </div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-amber-100/90">
            {etiquetaTipo(mensaje.tipo)}
          </p>
          <h2
            id="bienvenida-flotante-titulo"
            className="font-display mt-2 text-xl font-semibold leading-snug sm:text-2xl"
          >
            {mensaje.titulo}
          </h2>
        </div>

        <div className="relative -mt-4 rounded-t-3xl bg-[#f7f4ec] px-5 pb-5 pt-5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-md">
            <div className="relative h-12 w-12">
              <Image src="/loges.jpg" alt="" fill sizes="48px" className="object-cover" priority />
            </div>
          </div>

          <p className="text-center text-sm leading-relaxed text-slate-700 sm:text-[0.9375rem]">
            {mensaje.texto}
          </p>

          <button
            type="button"
            onClick={cerrar}
            className="mt-5 min-h-12 w-full rounded-xl bg-primary px-4 text-base font-semibold text-white shadow-md shadow-primary/25 transition active:opacity-90"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
