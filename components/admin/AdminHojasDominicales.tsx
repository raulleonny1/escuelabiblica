"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  hojasDominicalesDisponibles,
  listarHojasDominicales,
  subirHojaDominical,
  type HojaDominicalEstado,
} from "@/lib/hojaDominicalStorage"
import { LECCIONES } from "@/lib/lecciones"

export default function AdminHojasDominicales() {
  const [hojas, setHojas] = useState<HojaDominicalEstado[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState<number | null>(null)
  const inputsRef = useRef<Record<number, HTMLInputElement | null>>({})

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setHojas(await listarHojasDominicales())
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
      await subirHojaDominical(semana, file)
      setOk(`PDF de la semana ${semana} subido correctamente.`)
      await cargar()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir")
    } finally {
      setSubiendo(null)
      const input = inputsRef.current[semana]
      if (input) input.value = ""
    }
  }

  const subidas = hojas.filter((h) => h.subido).length
  const storageOk = hojasDominicalesDisponibles()

  return (
    <section className="mt-8 rounded-xl border border-border bg-white p-4 shadow-sm md:p-5">
      <h2 className="font-display text-lg font-semibold text-primary">Hojas dominicales (PDF)</h2>
      <p className="mt-1 text-sm text-muted">
        Sube el PDF de cada semana. Al pulsar «Hoja dominical» en la lección se abre el PDF de esa semana.
      </p>

      {!storageOk && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Falta configurar Firebase Storage (<code>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</code>).
        </p>
      )}

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
        {subidas} de {LECCIONES.length} semanas con PDF subido
      </p>

      {cargando ? (
        <div className="flex justify-center py-8">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
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
                    hoja?.subido
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {hoja?.subido ? "Subido" : "Sin PDF"}
                </span>
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
                  disabled={!storageOk || ocupado}
                  onClick={() => inputsRef.current[leccion.numero]?.click()}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {ocupado ? "Subiendo…" : "Subir PDF"}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
