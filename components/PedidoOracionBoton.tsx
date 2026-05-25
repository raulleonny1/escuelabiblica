"use client"

import { useEffect, useRef, useState } from "react"
import PedidoOracionModal from "@/components/PedidoOracionModal"
import { useSesion } from "@/components/SesionProvider"
import { registrarVisitaSitio } from "@/lib/analytics"
import {
  contarPedidosOracionSinLeer,
  marcarPedidosOracionVistos,
  subscribePedidosCompartidos,
} from "@/lib/pedidosOracion"

type PedidoOracionBotonProps = {
  className?: string
}

export default function PedidoOracionBoton({ className = "" }: PedidoOracionBotonProps) {
  const [abierto, setAbierto] = useState(false)
  const [sinLeer, setSinLeer] = useState(0)
  const { usuarioId, nombre } = useSesion()
  const idsDeOtrosRef = useRef<string[]>([])

  useEffect(() => {
    return subscribePedidosCompartidos(
      (items) => {
        const ids =
          usuarioId != null
            ? items.filter((p) => p.usuarioId !== usuarioId).map((p) => p.id)
            : items.map((p) => p.id)
        idsDeOtrosRef.current = ids
        setSinLeer(contarPedidosOracionSinLeer(usuarioId ?? "", ids))
      },
      () => {
        idsDeOtrosRef.current = []
        setSinLeer(0)
      }
    )
  }, [usuarioId])

  function abrirModal() {
    if (usuarioId && nombre) {
      registrarVisitaSitio(usuarioId, nombre, "pedido_oracion", 0)
      marcarPedidosOracionVistos(usuarioId, idsDeOtrosRef.current)
      setSinLeer(0)
    }
    setAbierto(true)
  }

  const etiquetaContador =
    sinLeer > 0 ? `, ${sinLeer} pedido${sinLeer === 1 ? "" : "s"} nuevos por orar` : ""

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        className={`relative inline-flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center transition hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98] ${className}`}
        aria-haspopup="dialog"
        aria-label={`Pedido de oración${etiquetaContador}`}
      >
        {sinLeer > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-none text-white shadow-md ring-2 ring-white"
            aria-hidden
          >
            {sinLeer > 99 ? "99+" : sinLeer}
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-5 w-5 text-primary"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1"
          />
          <circle cx="12" cy="12" r="3.5" strokeWidth="1.75" />
        </svg>
        <span className="text-[0.6875rem] font-semibold leading-tight text-primary md:text-xs">
          Pedido
          <br />
          de oración
        </span>
      </button>

      {abierto && (
        <PedidoOracionModal
          onCerrar={() => {
            setAbierto(false)
            if (usuarioId) {
              setSinLeer(contarPedidosOracionSinLeer(usuarioId, idsDeOtrosRef.current))
            }
          }}
        />
      )}
    </>
  )
}
