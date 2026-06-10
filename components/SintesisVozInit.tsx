"use client"

import { useEffect } from "react"
import { registrarReanudarLectoresEnSegundoPlano } from "@/lib/leccionTts"
import { registrarPrecargaVocesEnApp } from "@/lib/sintesisVozIos"

/** Precarga voces TTS al primer toque y mantiene lectura en segundo plano. */
export default function SintesisVozInit() {
  useEffect(() => {
    registrarReanudarLectoresEnSegundoPlano()
    return registrarPrecargaVocesEnApp()
  }, [])
  return null
}
