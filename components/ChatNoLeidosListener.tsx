"use client"

import { useCallback, useEffect, useRef } from "react"
import { useSesion } from "@/components/SesionProvider"
import { useMenuNavegacion } from "@/components/MenuNavegacion"
import { getChatSessionId, subscribeChatMessages, type ChatMessage } from "@/lib/chat"
import {
  actualizarTituloNoLeidos,
  emitirNoLeidos,
  mensajeEsParaMi,
  notificarMensajeChat,
  reproducirSonidoMensajeDirecto,
} from "@/lib/chatNotificaciones"

/**
 * Mantiene el contador de mensajes sin leer aunque el panel de chat esté cerrado
 * (p. ej. en el hub de inicio → badge de Comunidad).
 */
export default function ChatNoLeidosListener() {
  const { nombre } = useSesion()
  const { panel } = useMenuNavegacion()
  const activoRef = useRef(panel === "chat")
  const historialListoRef = useRef(false)
  const ultimoIdVistoRef = useRef<string | null>(null)

  useEffect(() => {
    activoRef.current = panel === "chat"
    if (panel === "chat") {
      emitirNoLeidos(0)
      actualizarTituloNoLeidos(0)
    }
  }, [panel])

  const procesarMensajesNuevos = useCallback(
    (data: ChatMessage[]) => {
      if (!nombre) return
      const mensajesTexto = data.filter((m) => m.tipo === "message")
      const ultimo = mensajesTexto[mensajesTexto.length - 1]
      if (!ultimo) return

      const miNombre = nombre.trim().toLowerCase()

      if (!historialListoRef.current) {
        historialListoRef.current = true
        ultimoIdVistoRef.current = ultimo.id
        return
      }

      if (activoRef.current) {
        ultimoIdVistoRef.current = ultimo.id
        emitirNoLeidos(0)
        actualizarTituloNoLeidos(0)
        return
      }

      if (ultimo.nombre.trim().toLowerCase() === miNombre) {
        ultimoIdVistoRef.current = ultimo.id
        return
      }

      if (ultimoIdVistoRef.current === ultimo.id) return

      const previo = ultimoIdVistoRef.current
      let noLeidos = 1
      if (previo) {
        const idx = data.findIndex((m) => m.id === previo)
        if (idx >= 0) {
          noLeidos = data
            .slice(idx + 1)
            .filter(
              (m) =>
                m.tipo === "message" && m.nombre.trim().toLowerCase() !== miNombre
            ).length
        }
      }

      emitirNoLeidos(noLeidos)
      actualizarTituloNoLeidos(noLeidos)

      if (mensajeEsParaMi(ultimo.texto, nombre)) {
        reproducirSonidoMensajeDirecto()
        notificarMensajeChat(ultimo.nombre, ultimo.texto, nombre)
      }

      ultimoIdVistoRef.current = ultimo.id
    },
    [nombre]
  )

  useEffect(() => {
    if (!nombre) return
    const sessionId = getChatSessionId()
    if (!sessionId) return

    historialListoRef.current = false
    ultimoIdVistoRef.current = null

    const unsub = subscribeChatMessages(
      (data) => procesarMensajesNuevos(data),
      () => {}
    )
    return unsub
  }, [nombre, procesarMensajesNuevos])

  return null
}
