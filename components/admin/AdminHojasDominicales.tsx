"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ADMIN_PIN_DEFAULT } from "@/lib/adminPin"
import type { HojaDominicalMeta } from "@/lib/hojaDominicalServer"
import { LECCIONES } from "@/lib/lecciones"

function formatearFecha(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })
  } catch {
    return iso
  }
}

function formatearTamano(bytes: number): string {
  if (bytes <= 0) return "—"
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminHojasDominicales() {
  const [hojas, setHojas] = useState<HojaDominicalMeta[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      if (!res.ok) throw new Error(json.error ?? "No se pudieron cargar las hojas")
      setHojas(json.hojas ?? [])
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
    try {
      const form = new FormData()
      form.append("pin", pin())
      form.append("semana", String(semana))
      form.append("archivo", file)

      const res = await fetch("/api/admin/hoja-dominical", {
        method: "POST",
        body: form,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "No se pudo subir el PDF")

      setHojas((prev) =>
        prev.map((h) => (h.semana === semana ? (json.hoja as HojaDominicalMeta) : h))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir")
    } finally {
      setSubiendo(null)
      const input = inputsRef.current[semana]
      if (input) input.value = ""
    }
  }

  const subidas = hojas.filter((h) => h.url).length

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-primary">Hoja dominical por semana</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Sube un PDF para cada semana del trimestre. Al pulsar «Hoja dominical» en la lección,
          los estudiantes verán el PDF de esa semana. Si no hay PDF subido, se usa el archivo
          predeterminado en <code className="text-[0.6875rem]">/pdf/Hoja-dominical.pdf</code>.
        </p>
        <p className="mt-2 text-xs font-medium text-primary">
          {subidas} de {LECCIONES.length} semanas con PDF personalizado
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={cargando}
          onClick={cargar}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
        >
          {cargando ? "Cargando…" : "Actualizar lista"}
        </button>
      </div>

      {cargando && hojas.length === 0 ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2">Semana</th>
                <th className="px-3 py-2">Lección</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Actualizado</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {LECCIONES.map((leccion) => {
                const hoja = hojas.find((h) => h.semana === leccion.numero)
                const tienePdf = Boolean(hoja?.url)
                const ocupado = subiendo === leccion.numero

                return (
                  <tr
                    key={leccion.numero}
                    className="border-b border-border/80 hover:bg-slate-50"
                  >
                    <td className="px-3 py-3 font-semibold text-primary">
                      {leccion.numero}
                    </td>
                    <td className="max-w-[220px] px-3 py-3 text-slate-800">
                      <span className="line-clamp-2">{leccion.titulo}</span>
                    </td>
                    <td className="px-3 py-3">
                      {tienePdf ? (
                        <span className="inline-flex flex-col gap-0.5">
                          <span className="inline-block w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6875rem] font-medium text-emerald-800">
                            PDF subido
                          </span>
                          <span className="text-[0.625rem] text-muted">
                            {hoja?.nombreArchivo || "—"} · {formatearTamano(hoja?.tamanoBytes ?? 0)}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[0.6875rem] font-medium text-slate-600">
                          Predeterminado
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">
                      {formatearFecha(hoja?.actualizadoEn ?? null)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {tienePdf && (
                          <a
                            href={hoja!.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Ver PDF
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
                          className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {ocupado ? "Subiendo…" : tienePdf ? "Reemplazar" : "Subir PDF"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
