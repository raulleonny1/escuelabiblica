"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { safeLocalGet, safeLocalSet } from "@/lib/storage"

type Props = {
  nombre: string
}

type MensajeUi = {
  titulo: string
  texto: string
}

const KEY_ULTIMA_VISITA = "bienvenidaUltimaVisita"
const KEY_ULTIMO_DIA_MOSTRADO = "bienvenidaUltimoDiaMostrado"
const KEY_PRIMER_SALUDO = "bienvenidaPrimerSaludoHecho"
const DIAS_EXHORTACION = 3

const MENSAJES_DIARIOS: MensajeUi[] = [
  {
    titulo: "Qué alegría verte hoy",
    texto: "Aparta unos minutos para escuchar al Señor y caminar de nuevo en su Palabra.",
  },
  {
    titulo: "Un día más con la Palabra",
    texto: "La constancia pequeña de cada día también forma una fe fuerte y serena.",
  },
  {
    titulo: "Sigue adelante",
    texto: "Dios honra el corazón que vuelve a su estudio con humildad y deseo de aprender.",
  },
  {
    titulo: "Hoy también te espera el Señor",
    texto: "Lee, escucha y ora con calma; una sola verdad bien recibida puede sostener todo el día.",
  },
  {
    titulo: "Tu estudio de hoy importa",
    texto: "No subestimes lo que Dios puede hacer cuando le das unos minutos con atención.",
  },
]

const MENSAJES_EXHORTACION: MensajeUi[] = [
  {
    titulo: "Qué bueno que has vuelto",
    texto: "El Señor sigue llamándote con amor. Retoma hoy el estudio y vuelve a encender el hábito.",
  },
  {
    titulo: "Te echábamos de menos",
    texto: "Aunque hayas estado lejos algunos días, siempre es buen momento para volver a la Palabra.",
  },
  {
    titulo: "Vuelve con ánimo",
    texto: "No empieces por la culpa sino por la gracia. Da hoy un paso sencillo y el Señor hará el resto.",
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
      titulo: `Bienvenido, ${nombre}`,
      texto: "Nos alegra tenerte aquí. Que este espacio te acerque cada día más a Cristo y a su Palabra.",
    }
  }

  if (ultimaVisita) {
    const dias = diasEntre(ultimaVisita, hoy)
    if (dias >= DIAS_EXHORTACION) {
      return MENSAJES_EXHORTACION[dias % MENSAJES_EXHORTACION.length] ?? MENSAJES_EXHORTACION[0]
    }
  }

  return MENSAJES_DIARIOS[hoy.getDay() % MENSAJES_DIARIOS.length] ?? MENSAJES_DIARIOS[0]
}

export default function BienvenidaFlotante({ nombre }: Props) {
  const [cerrado, setCerrado] = useState(false)
  const [listo, setListo] = useState(false)
  const mensaje = useMemo(() => resolverMensaje(nombre), [nombre])

  useEffect(() => {
    if (!mensaje) return
    const timer = window.setTimeout(() => setListo(true), 450)
    return () => window.clearTimeout(timer)
  }, [mensaje])

  useEffect(() => {
    if (!nombre) return
    safeLocalSet(KEY_ULTIMA_VISITA, new Date().toISOString())
  }, [nombre])

  function cerrar() {
    setCerrado(true)
    safeLocalSet(KEY_PRIMER_SALUDO, "1")
    safeLocalSet(KEY_ULTIMO_DIA_MOSTRADO, claveDiaLocal())
    safeLocalSet(KEY_ULTIMA_VISITA, new Date().toISOString())
  }

  if (!mensaje || cerrado || !listo) return null

  return (
    <div
      className="fixed right-3 top-[calc(env(safe-area-inset-top)+4.5rem)] z-[58] w-[min(24rem,calc(100vw-1.5rem))] sm:right-4 sm:top-[calc(env(safe-area-inset-top)+5rem)]"
      role="dialog"
      aria-labelledby="bienvenida-flotante-titulo"
      aria-live="polite"
    >
      <div className="rounded-2xl border border-primary/20 bg-[#f7f4ec]/97 p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-primary/15 bg-white">
            <Image src="/loges.jpg" alt="" fill sizes="64px" className="object-cover" priority />
          </div>
          <div className="min-w-0 flex-1">
            <p
              id="bienvenida-flotante-titulo"
              className="font-display text-base font-semibold leading-snug text-primary"
            >
              {mensaje.titulo}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{mensaje.texto}</p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-primary/8 active:bg-primary/12"
            aria-label="Cerrar bienvenida"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
