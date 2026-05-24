"use client"

import { useEffect, useRef, useState } from "react"
import { useSesion } from "@/components/SesionProvider"
import {
  marcarAvisoLeido,
  subscribeAvisosOracion,
  type AvisoOracion,
} from "@/lib/pedidosOracion"

export default function AvisosOracionListener() {
  const { usuarioId } = useSesion()
  const [toasts, setToasts] = useState<AvisoOracion[]>([])
  const conocidosRef = useRef<Set<string>>(new Set())
  const primeraCargaRef = useRef(true)

  useEffect(() => {
    if (!usuarioId) return

    conocidosRef.current = new Set()
    primeraCargaRef.current = true
    setToasts([])

    return subscribeAvisosOracion(
      usuarioId,
      (items) => {
        if (primeraCargaRef.current) {
          primeraCargaRef.current = false
          items.forEach((a) => conocidosRef.current.add(a.id))
          return
        }

        const nuevos: AvisoOracion[] = []
        for (const aviso of items) {
          if (conocidosRef.current.has(aviso.id)) continue
          conocidosRef.current.add(aviso.id)
          if (!aviso.leido) nuevos.push(aviso)
        }

        if (nuevos.length > 0) {
          setToasts((prev) => {
            const ids = new Set(prev.map((t) => t.id))
            return [...prev, ...nuevos.filter((n) => !ids.has(n.id))].slice(-4)
          })
        }
      },
      () => {}
    )
  }, [usuarioId])

  async function cerrar(aviso: AvisoOracion) {
    setToasts((prev) => prev.filter((t) => t.id !== aviso.id))
    try {
      await marcarAvisoLeido(aviso.id)
    } catch {
      // ignorar
    }
  }

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed left-2 right-2 top-[calc(3.25rem+env(safe-area-inset-top))] z-[58] mx-auto flex max-w-md flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((aviso) => (
        <div
          key={aviso.id}
          className="pointer-events-auto rounded-xl border border-primary/25 bg-card p-3 shadow-lg shadow-slate-900/15"
          role="status"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Pedido de oración
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">{aviso.mensaje}</p>
          {aviso.pedidoResumen && (
            <p className="mt-1 line-clamp-2 text-xs text-muted">«{aviso.pedidoResumen}»</p>
          )}
          <button
            type="button"
            onClick={() => cerrar(aviso)}
            className="mt-2 min-h-9 w-full rounded-lg bg-primary text-xs font-medium text-white active:opacity-90"
          >
            Gracias, entendido
          </button>
        </div>
      ))}
    </div>
  )
}
