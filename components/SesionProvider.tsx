"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import ChatNombreModal from "@/components/ChatNombreModal"
import AvisosOracionListener from "@/components/AvisosOracionListener"
import PwaInstallPrompt from "@/components/PwaInstallPrompt"
import { ensureUsuarioAuth } from "@/lib/auth"
import { guardarNombreChat, leerNombreChat } from "@/lib/chat"
import { safeLocalRemove, safeSessionRemove } from "@/lib/storage"

type SesionContextValue = {
  usuarioId: string | null
  nombre: string | null
  listo: boolean
  confirmarNombre: (nombre: string) => void
  cambiarNombre: () => void
}

const SesionContext = createContext<SesionContextValue | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [listo, setListo] = useState(false)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [nombre, setNombre] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    ensureUsuarioAuth()
      .then((uid) => {
        if (cancelado) return
        setUsuarioId(uid)
        setNombre(leerNombreChat() || null)
        setListo(true)
      })
      .catch(() => {
        if (cancelado) return
        setListo(true)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const confirmarNombre = useCallback((n: string) => {
    guardarNombreChat(n)
    setNombre(n)
  }, [])

  const cambiarNombre = useCallback(() => {
    safeLocalRemove("chatNombre")
    safeSessionRemove("chatJoinAnnounced")
    setNombre(null)
  }, [])

  useEffect(() => {
    if (!listo) return
    const prev = document.body.style.overflow
    if (!nombre) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = prev
    }
    return () => {
      document.body.style.overflow = prev
    }
  }, [listo, nombre])

  const value = useMemo(
    () => ({ usuarioId, nombre, listo, confirmarNombre, cambiarNombre }),
    [usuarioId, nombre, listo, confirmarNombre, cambiarNombre]
  )

  if (!listo) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <SesionContext.Provider value={value}>
      {nombre ? children : null}
      {!nombre && <ChatNombreModal onConfirm={confirmarNombre} />}
      {nombre ? (
        <>
          <AvisosOracionListener />
          <PwaInstallPrompt />
        </>
      ) : null}
    </SesionContext.Provider>
  )
}

export function useSesion() {
  const ctx = useContext(SesionContext)
  if (!ctx) {
    throw new Error("useSesion debe usarse dentro de SesionProvider")
  }
  return ctx
}
