"use client"

import { useCallback, useRef, useState } from "react"
import Link from "next/link"
import { ADMIN_PIN_DEFAULT } from "@/lib/adminPin"
import { estaAdminDesbloqueado } from "@/components/AdminAcceso"
import { LECCIONES } from "@/lib/lecciones"

export default function AdminHojasPage() {
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState<number | null>(null)
  const [subidas, setSubidas] = useState<Set<number>>(new Set())
  const inputsRef = useRef<Record<number, HTMLInputElement | null>>({})

  const pin = () => sessionStorage.getItem("adminPinUsado") ?? ADMIN_PIN_DEFAULT

  const marcarSubidas = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hoja-dominical", {
        headers: { "x-admin-pin": pin() },
      })
      const json = await res.json()
      if (res.ok && json.hojas) {
        setSubidas(new Set(json.hojas.filter((h: { subido: boolean }) => h.subido).map((h: { semana: number }) => h.semana)))
      }
    } catch {
      /* ignorar */
    }
  }, [])

  async function subir(semana: number, file: File) {
    setSubiendo(semana)
    setError(null)
    setOk(null)
    try {
      const form = new FormData()
      form.append("pin", pin())
      form.append("semana", String(semana))
      form.append("archivo", file)

      const res = await fetch("/api/admin/hoja-dominical", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "No se pudo subir el PDF")

      setSubidas((prev) => new Set(prev).add(semana))
      setOk(`Semana ${semana} subida. Ya se ve al pulsar «Hoja dominical».`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir")
    } finally {
      setSubiendo(null)
      const input = inputsRef.current[semana]
      if (input) input.value = ""
    }
  }

  if (!estaAdminDesbloqueado()) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted">Primero entra al admin con el PIN.</p>
        <Link href="/admin" className="mt-3 text-primary underline">
          Ir al panel
        </Link>
      </div>
    )
  }

  return (
    <div className="custom-scroll h-full min-h-0 overflow-y-auto bg-slate-50 p-3 md:p-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-primary">Hojas dominicales</h1>
            <p className="text-sm text-muted">Sube un PDF por semana del trimestre.</p>
          </div>
          <Link href="/admin" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white">
            ← Volver al panel
          </Link>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
        {ok && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{ok}</p>
        )}

        <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-white p-2 shadow-sm">
          {LECCIONES.map((leccion) => {
            const ocupado = subiendo === leccion.numero
            const tiene = subidas.has(leccion.numero)

            return (
              <li key={leccion.numero} className="flex flex-wrap items-center gap-3 px-2 py-3">
                <span className="w-8 font-semibold text-primary">{leccion.numero}</span>
                <span className="min-w-0 flex-1 text-sm">{leccion.titulo}</span>
                {tiene && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6875rem] font-medium text-emerald-800">
                    Subido
                  </span>
                )}
                <input
                  ref={(el) => {
                    inputsRef.current[leccion.numero] = el
                  }}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void subir(leccion.numero, file)
                  }}
                />
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => inputsRef.current[leccion.numero]?.click()}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {ocupado ? "Subiendo…" : "Subir PDF"}
                </button>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={marcarSubidas}
          className="mt-4 text-xs text-primary underline"
        >
          Ver cuáles ya están subidas
        </button>
      </div>
    </div>
  )
}
