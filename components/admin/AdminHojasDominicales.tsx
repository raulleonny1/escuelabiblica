"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ADMIN_PIN_DEFAULT } from "@/lib/adminPin"
import type { HojaDominicalInfo } from "@/lib/hojaDominicalServer"
import { LECCIONES } from "@/lib/lecciones"

export default function AdminHojasDominicales() {
  const [hojas, setHojas] = useState<HojaDominicalInfo[]>(() =>
    LECCIONES.map((l) => ({
      semana: l.numero,
      subido: false,
      url: "",
      actualizadoEn: null,
    }))
  )
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState<number | null>(null)
  const inputsRef = useRef<Record<number, HTMLInputElement | null>>({})

  const pin = () => sessionStorage.getItem("adminPinUsado") ?? ADMIN_PIN_DEFAULT

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/hoja-dominical", {
        headers: { "x-admin-pin": pin() },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "No se pudo cargar la lista")
      if (json.hojas?.length) setHojas(json.hojas)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

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

      setHojas((prev) =>
        prev.map((h) => (h.semana === semana ? (json.hoja as HojaDominicalInfo) : h))
      )
      setOk(`Semana ${semana} lista. Al pulsar «Hoja dominical» se abrirá este PDF.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir")
    } finally {
      setSubiendo(null)
      const input = inputsRef.current[semana]
      if (input) input.value = ""
    }
  }

  const subidas = hojas.filter((h) => h.subido).length

  return (
    <section className="mt-8 rounded-xl border border-border bg-white p-4 shadow-sm md:p-5">
      <h2 className="font-display text-lg font-semibold text-primary">Hojas dominicales (PDF)</h2>
      <p className="mt-1 text-sm text-muted">
        Elige la semana y sube el PDF. Se verá al pulsar «Hoja dominical» en esa lección.
      </p>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {ok && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {ok}
        </p>
      )}

      <p className="mt-3 text-xs font-medium text-primary">
        {subidas} de {LECCIONES.length} semanas con PDF ·{" "}
        <button
          type="button"
          onClick={cargar}
          disabled={cargando}
          className="text-primary underline disabled:opacity-50"
        >
          {cargando ? "Actualizando…" : "Actualizar"}
        </button>
      </p>

      <ul className="mt-4 divide-y divide-border">
        {LECCIONES.map((leccion) => {
          const hoja = hojas.find((h) => h.semana === leccion.numero)
          const ocupado = subiendo === leccion.numero

          return (
            <li
              key={leccion.numero}
              className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="w-8 shrink-0 font-semibold text-primary">{leccion.numero}</span>
              <span className="min-w-0 flex-1 text-sm text-slate-800">{leccion.titulo}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ${
                  hoja?.subido ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                }`}
              >
                {hoja?.subido ? "Subido" : "Sin PDF"}
              </span>
              {hoja?.subido && hoja.url && (
                <a
                  href={hoja.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary underline"
                >
                  Ver
                </a>
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
                className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {ocupado ? "Subiendo…" : "Subir PDF"}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
