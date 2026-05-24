"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { ADMIN_PIN_DEFAULT } from "@/lib/adminPin"
import { safeSessionSet } from "@/lib/storage"

const CLAVE_SESION = "adminDesbloqueado"

export function estaAdminDesbloqueado(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(CLAVE_SESION) === "1"
}

export function marcarAdminDesbloqueado() {
  safeSessionSet(CLAVE_SESION, "1")
}

type AdminAccesoProps = {
  className?: string
}

export default function AdminAcceso({ className = "" }: AdminAccesoProps) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const agregarDigito = useCallback((d: string) => {
    setError("")
    setPin((p) => (p.length >= 8 ? p : p + d))
  }, [])

  const borrar = useCallback(() => {
    setError("")
    setPin((p) => p.slice(0, -1))
  }, [])

  function entrar() {
    if (pin === ADMIN_PIN_DEFAULT) {
      marcarAdminDesbloqueado()
      setAbierto(false)
      setPin("")
      router.push("/admin")
      return
    }
    setError("Código incorrecto")
    setPin("")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`rounded-md border border-white/25 bg-white/10 px-2 py-1 text-[0.625rem] font-semibold text-white/90 hover:bg-white/20 lg:text-xs ${className}`}
        aria-label="Acceso administrador"
      >
        Admin
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-pin-titulo"
        >
          <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-4 shadow-2xl">
            <h2 id="admin-pin-titulo" className="font-display text-center text-lg font-semibold text-primary">
              Acceso admin
            </h2>
            <p className="mt-1 text-center text-xs text-muted">Introduce el código numérico</p>
            <div
              className="mt-3 flex min-h-12 items-center justify-center rounded-lg border border-border bg-slate-50 font-mono text-2xl tracking-[0.4em] text-slate-800"
              aria-live="polite"
            >
              {pin ? "•".repeat(pin.length) : "—"}
            </div>
            {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "OK"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === "←") borrar()
                    else if (k === "OK") entrar()
                    else agregarDigito(k)
                  }}
                  className={`min-h-11 rounded-lg text-sm font-semibold ${
                    k === "OK"
                      ? "bg-primary text-white"
                      : k === "←"
                        ? "border border-border bg-white text-slate-600"
                        : "border border-border bg-white text-slate-800 active:bg-slate-100"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 w-full text-center text-xs text-muted underline-offset-2 hover:underline"
              onClick={() => {
                setAbierto(false)
                setPin("")
                setError("")
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
