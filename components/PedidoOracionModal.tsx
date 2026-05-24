"use client"

import { useEffect, useState } from "react"
import { useSesion } from "@/components/SesionProvider"
import { mensajeErrorFirebase } from "@/lib/firebase"
import {
  contarOrando,
  crearPedidoOracion,
  eliminarPedidoOracion,
  formatearHace,
  marcarOrandoPor,
  quitarOrandoPor,
  subscribeMisPedidos,
  subscribePedidosCompartidos,
  yaEstoyOrando,
  type PedidoOracion,
} from "@/lib/pedidosOracion"

type PedidoOracionModalProps = {
  onCerrar: () => void
}

export default function PedidoOracionModal({ onCerrar }: PedidoOracionModalProps) {
  const { usuarioId, nombre } = useSesion()
  const [texto, setTexto] = useState("")
  const [compartir, setCompartir] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [comunidad, setComunidad] = useState<PedidoOracion[]>([])
  const [mios, setMios] = useState<PedidoOracion[]>([])
  const [orandoId, setOrandoId] = useState<string | null>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [onCerrar])

  useEffect(() => {
    const unsubC = subscribePedidosCompartidos(
      setComunidad,
      (e) => setSyncError(mensajeErrorFirebase(e))
    )
    return () => unsubC()
  }, [])

  useEffect(() => {
    if (!usuarioId) return
    const unsubM = subscribeMisPedidos(
      usuarioId,
      setMios,
      (e) => setSyncError(mensajeErrorFirebase(e))
    )
    return () => unsubM()
  }, [usuarioId])

  const misPrivados = mios.filter((p) => !p.compartir)
  const idsComunidad = new Set(comunidad.map((p) => p.id))

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!usuarioId || !nombre) return
    setError(null)
    setEnviando(true)
    try {
      await crearPedidoOracion(usuarioId, nombre, texto, compartir)
      setTexto("")
      setCompartir(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el pedido.")
    } finally {
      setEnviando(false)
    }
  }

  async function toggleOrando(pedido: PedidoOracion) {
    if (!usuarioId || !nombre || !pedido.compartir) return
    setOrandoId(pedido.id)
    try {
      if (yaEstoyOrando(pedido, usuarioId)) {
        await quitarOrandoPor(pedido.id, usuarioId)
      } else {
        await marcarOrandoPor(pedido.id, usuarioId, nombre)
      }
    } catch {
      setError("No se pudo registrar tu oración. Intenta de nuevo.")
    } finally {
      setOrandoId(null)
    }
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminar este pedido de oración?")) return
    try {
      await eliminarPedidoOracion(id)
    } catch {
      setError("No se pudo eliminar el pedido.")
    }
  }

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center bg-slate-900/55 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pedido-oracion-titulo"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-amber-100/90">
              Comunidad de estudio
            </p>
            <h2 id="pedido-oracion-titulo" className="font-display text-lg font-semibold">
              Pedidos de oración
            </h2>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg leading-none hover:bg-white/30"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="custom-scroll min-h-0 flex-1 overflow-y-auto p-4">
          {syncError && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {syncError}
            </p>
          )}

          <form onSubmit={handleEnviar} className="rounded-xl border border-primary/25 bg-primary/5 p-3">
            <label htmlFor="pedido-texto" className="text-xs font-semibold text-primary">
              Tu pedido de oración
            </label>
            <textarea
              id="pedido-texto"
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value)
                setError(null)
              }}
              placeholder="Escribe aquí tu petición…"
              maxLength={500}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-base text-slate-800 focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={compartir}
                onChange={(e) => setCompartir(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <span>
                <strong>Deseo que otros oren por este pedido</strong>
                <span className="mt-0.5 block text-xs text-muted">
                  {compartir
                    ? "Aparecerá en la lista para quienes estudian contigo."
                    : "Solo tú lo verás en «Mis pedidos privados»."}
                </span>
              </span>
            </label>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={enviando || texto.trim().length < 3}
              className="mt-3 min-h-11 w-full rounded-lg bg-primary text-sm font-medium text-white shadow-md disabled:opacity-50"
            >
              {enviando ? "Enviando…" : "Enviar pedido"}
            </button>
          </form>

          <section className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
              Pedidos de la comunidad
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Ora con un clic para que la persona sepa que no está sola.
            </p>
            {comunidad.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-border bg-surface px-3 py-4 text-center text-sm text-muted">
                Aún no hay pedidos compartidos. Sé el primero en compartir el tuyo.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {comunidad.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    esMio={pedido.usuarioId === usuarioId}
                    usuarioId={usuarioId}
                    orandoId={orandoId}
                    onOrar={() => toggleOrando(pedido)}
                    onEliminar={() => handleEliminar(pedido.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          {misPrivados.length > 0 && (
            <section className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Mis pedidos privados
              </h3>
              <ul className="mt-3 space-y-3">
                {misPrivados.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    esMio
                    privado
                    usuarioId={usuarioId}
                    onEliminar={() => handleEliminar(pedido.id)}
                  />
                ))}
              </ul>
            </section>
          )}

          {mios.some((p) => p.compartir && !idsComunidad.has(p.id)) && (
            <section className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Mis pedidos compartidos
              </h3>
              <ul className="mt-3 space-y-3">
                {mios
                  .filter((p) => p.compartir && !idsComunidad.has(p.id))
                  .map((pedido) => (
                    <PedidoCard
                      key={pedido.id}
                      pedido={pedido}
                      esMio
                      usuarioId={usuarioId}
                      orandoId={orandoId}
                      onOrar={() => toggleOrando(pedido)}
                      onEliminar={() => handleEliminar(pedido.id)}
                    />
                  ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function PedidoCard({
  pedido,
  esMio,
  privado,
  usuarioId,
  orandoId,
  onOrar,
  onEliminar,
}: {
  pedido: PedidoOracion
  esMio?: boolean
  privado?: boolean
  usuarioId: string | null
  orandoId?: string | null
  onOrar?: () => void
  onEliminar?: () => void
}) {
  const orando = usuarioId ? yaEstoyOrando(pedido, usuarioId) : false
  const total = contarOrando(pedido)
  const nombresOrando = Object.values(pedido.orandoPor)

  return (
    <li className="rounded-xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">
            {pedido.nombre}
            {esMio && (
              <span className="ml-1.5 text-[0.625rem] font-normal text-muted">(tú)</span>
            )}
          </p>
          <p className="text-[0.625rem] text-muted">{formatearHace(pedido.createdAt)}</p>
        </div>
        {privado && (
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[0.625rem] font-medium text-slate-600">
            Solo tú
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{pedido.texto}</p>

      {pedido.compartir && !privado && usuarioId && pedido.usuarioId !== usuarioId && onOrar && (
        <button
          type="button"
          disabled={orandoId === pedido.id}
          onClick={onOrar}
          className={`mt-3 min-h-10 w-full rounded-lg text-sm font-medium transition ${
            orando
              ? "border border-primary/40 bg-primary/10 text-primary"
              : "bg-primary text-white shadow-sm active:opacity-90"
          } disabled:opacity-60`}
        >
          {orandoId === pedido.id
            ? "…"
            : orando
              ? "✓ Estaré orando"
              : "Estaré orando"}
        </button>
      )}

      {pedido.compartir && total > 0 && (
        <p className="mt-2 text-xs text-muted">
          {total === 1 ? "1 persona está orando" : `${total} personas están orando`}
          {nombresOrando.length > 0 && nombresOrando.length <= 4 && (
            <span className="text-slate-500"> · {nombresOrando.join(", ")}</span>
          )}
        </p>
      )}

      {esMio && onEliminar && (
        <button
          type="button"
          onClick={onEliminar}
          className="mt-2 text-xs text-red-600 underline-offset-2 hover:underline"
        >
          Eliminar mi pedido
        </button>
      )}
    </li>
  )
}
