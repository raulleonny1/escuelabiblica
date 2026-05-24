"use client"

import { useState } from "react"
import PedidoOracionModal from "@/components/PedidoOracionModal"

type PedidoOracionBotonProps = {
  className?: string
}

export default function PedidoOracionBoton({ className = "" }: PedidoOracionBotonProps) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`inline-flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center transition hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98] ${className}`}
        aria-haspopup="dialog"
      >
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

      {abierto && <PedidoOracionModal onCerrar={() => setAbierto(false)} />}
    </>
  )
}
