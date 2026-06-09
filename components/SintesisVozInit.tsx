"use client"

import { useEffect } from "react"
import { registrarPrecargaVocesEnApp } from "@/lib/sintesisVozIos"

/** Precarga voces TTS al primer toque en la app (necesario en iPhone). */
export default function SintesisVozInit() {
  useEffect(() => registrarPrecargaVocesEnApp(), [])
  return null
}
