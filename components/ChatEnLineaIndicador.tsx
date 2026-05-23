"use client"

import { useEffect, useState } from "react"
import { leerNombreChat, subscribePresenciaChat, type ChatUsuarioEnLinea } from "@/lib/chat"

type Placement = "mobile" | "desktop"

export default function ChatEnLineaIndicador({ placement }: { placement: Placement }) {
  const [enLinea, setEnLinea] = useState<ChatUsuarioEnLinea[]>([])
  const [nombre, setNombre] = useState("")

  useEffect(() => {
    const actualizarNombre = () => setNombre(leerNombreChat())
    actualizarNombre()
    window.addEventListener("chat-nombre-guardado", actualizarNombre)
    const unsub = subscribePresenciaChat(setEnLinea, () => {})
    return () => {
      window.removeEventListener("chat-nombre-guardado", actualizarNombre)
      unsub()
    }
  }, [])

  if (!nombre) return null

  const miNombre = nombre.trim().toLowerCase()
  const otros = enLinea.filter((u) => u.nombre.trim().toLowerCase() !== miNombre)
  const nombres = otros.map((u) => u.nombre)
  const cantidad = enLinea.length

  const estado =
    cantidad === 0 ? "Sin conexión" : cantidad === 1 ? "Tú en línea" : `${cantidad} en línea`

  if (placement === "desktop") {
    return (
      <div className="hidden min-w-0 md:block">
        <div className="mx-auto max-w-md rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
          <p className="flex items-center justify-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-amber-50/90">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
              aria-hidden
            />
            {estado}
          </p>
          {nombres.length > 0 && (
            <p className="mt-0.5 truncate text-center text-xs text-white/95" title={nombres.join(", ")}>
              {nombres.join(" · ")}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 backdrop-blur-sm md:hidden">
      <p className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-amber-50/90">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]"
          aria-hidden
        />
        {estado}
      </p>
      {nombres.length > 0 && (
        <p className="mt-0.5 truncate text-[0.6875rem] text-white/90" title={nombres.join(", ")}>
          {nombres.join(" · ")}
        </p>
      )}
    </div>
  )
}
