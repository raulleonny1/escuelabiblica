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
  variant?: "card" | "menu"
  abierto?: boolean
  onAbiertoChange?: (abierto: boolean) => void
  onSinLeerChange?: (n: number) => void
  ocultarBoton?: boolean
}

export default function PedidoOracionBoton({
  className = "",
  variant = "card",
  abierto: abiertoExterno,
  onAbiertoChange,
  onSinLeerChange,
  ocultarBoton = false,
}: PedidoOracionBotonProps) {
  const [abiertoInterno, setAbiertoInterno] = useState(false)
  const controlado = abiertoExterno !== undefined
  const abierto = controlado ? abiertoExterno : abiertoInterno
  const [sinLeer, setSinLeer] = useState(0)
  const { usuarioId, nombre } = useSesion()
  const idsDeOtrosRef = useRef<string[]>([])

  function setAbierto(v: boolean) {
    if (!controlado) setAbiertoInterno(v)
    onAbiertoChange?.(v)
  }

  useEffect(() => {
    return subscribePedidosCompartidos(
      (items) => {
        const ids =
          usuarioId != null
            ? items.filter((p) => p.usuarioId !== usuarioId).map((p) => p.id)
            : items.map((p) => p.id)
        idsDeOtrosRef.current = ids
        const n = contarPedidosOracionSinLeer(usuarioId ?? "", ids)
        setSinLeer(n)
        onSinLeerChange?.(n)
      },
      () => {
        idsDeOtrosRef.current = []
        setSinLeer(0)
        onSinLeerChange?.(0)
      }
    )
  }, [usuarioId, onSinLeerChange])

  useEffect(() => {
    if (!abierto) return
    if (usuarioId && nombre) {
      registrarVisitaSitio(usuarioId, nombre, "pedido_oracion", 0)
      marcarPedidosOracionVistos(usuarioId, idsDeOtrosRef.current)
      setSinLeer(0)
      onSinLeerChange?.(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto])

  function abrirModal() {
    setAbierto(true)
  }

  const etiquetaContador =
    sinLeer > 0 ? `, ${sinLeer} pedido${sinLeer === 1 ? "" : "s"} nuevos por orar` : ""

  const botonClase =
    variant === "menu"
      ? `relative flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-800 transition hover:bg-primary/8 active:bg-primary/12 ${className}`
      : `relative inline-flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center transition hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98] ${className}`

  return (
    <>
      {!ocultarBoton && (
        <button
          type="button"
          onClick={abrirModal}
          className={botonClase}
          aria-haspopup="dialog"
          aria-label={`Pedido de oración${etiquetaContador}`}
        >
          {variant === "menu" ? (
            <>
              <span className="relative text-xl" aria-hidden>
                🙏
                {sinLeer > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-white">
                    {sinLeer > 9 ? "9+" : sinLeer}
                  </span>
                )}
              </span>
              Pedido de oración
            </>
          ) : (
            <>
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
            </>
          )}
        </button>
      )}

      {abierto && (
        <PedidoOracionModal
          onCerrar={() => {
            setAbierto(false)
            if (usuarioId) {
              const n = contarPedidosOracionSinLeer(usuarioId, idsDeOtrosRef.current)
              setSinLeer(n)
              onSinLeerChange?.(n)
            }
          }}
        />
      )}
    </>
  )
}
