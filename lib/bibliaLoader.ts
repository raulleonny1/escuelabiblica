import {
  type BibliaData,
  type VersoJson,
  construirBibliaDesdeVersos,
} from "@/lib/biblia"

const RVR_URL = "/biblia/rvr1909.json"

let cache: BibliaData | null = null
let promesa: Promise<BibliaData> | null = null

export function cargarBiblia(): Promise<BibliaData> {
  if (cache) return Promise.resolve(cache)
  if (!promesa) {
    promesa = fetch(RVR_URL)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar la Biblia")
        return r.json()
      })
      .then((data: { verses?: VersoJson[] }) => {
        if (!Array.isArray(data.verses) || data.verses.length === 0) {
          throw new Error("Biblia vacía")
        }
        cache = construirBibliaDesdeVersos(data.verses)
        return cache
      })
  }
  return promesa
}
