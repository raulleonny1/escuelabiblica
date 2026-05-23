"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

export type EstudioActual = {
  semana: number
  numeroLeccion: number
  /** Título de la lección de la semana (cambia en cada una de las 13) */
  titulo: string
  diaLabel?: string
  /** Tema del día (lunes–jueves, etc.); la portada PNG es la misma todo el trimestre */
  temaDelDia?: string
}

type EstudioContextValue = {
  estudio: EstudioActual | null
  setEstudio: (estudio: EstudioActual | null) => void
}

const EstudioContext = createContext<EstudioContextValue | null>(null)

export function EstudioProvider({ children }: { children: ReactNode }) {
  const [estudio, setEstudio] = useState<EstudioActual | null>(null)
  const value = useMemo(() => ({ estudio, setEstudio }), [estudio])
  return <EstudioContext.Provider value={value}>{children}</EstudioContext.Provider>
}

export function useEstudio() {
  const ctx = useContext(EstudioContext)
  if (!ctx) {
    throw new Error("useEstudio debe usarse dentro de EstudioProvider")
  }
  return ctx
}
