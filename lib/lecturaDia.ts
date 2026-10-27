/** Plan «Dios nos habla cada día»: 3 pistas sincronizadas, lun–sáb, 1 mes. */

export const PLAN_LECTURA_INICIO = "2026-10-26"
export const PLAN_LECTURA_FIN = "2026-11-25"

/** Capítulos por libro (orden canónico protestante / RVR). */
const CAPITULOS_LIBRO: Record<string, number> = {
  Génesis: 50,
  Éxodo: 40,
  Levítico: 27,
  Números: 36,
  Deuteronomio: 34,
  Josué: 24,
  Jueces: 21,
  Rut: 4,
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Reyes": 22,
  "2 Reyes": 25,
  "1 Crónicas": 29,
  "2 Crónicas": 36,
  Esdras: 10,
  Nehemías: 13,
  Ester: 10,
  Job: 42,
  Salmos: 150,
  Proverbios: 31,
  Eclesiastés: 12,
  "Cantares": 8,
  Isaías: 66,
  Jeremías: 52,
  Lamentaciones: 5,
  Ezequiel: 48,
  Daniel: 12,
  Oseas: 14,
  Joel: 3,
  Amós: 9,
  Abdías: 1,
  Jonás: 4,
  Miqueas: 7,
  Nahúm: 3,
  Habacuc: 3,
  Sofonías: 3,
  Hageo: 2,
  Zacarías: 14,
  Malaquías: 4,
  Mateo: 28,
  Marcos: 16,
  Lucas: 24,
  Juan: 21,
  Hechos: 28,
  Romanos: 16,
  "1 Corintios": 16,
  "2 Corintios": 13,
  Gálatas: 6,
  Efesios: 6,
  Filipenses: 4,
  Colosenses: 4,
  "1 Tesalonicenses": 5,
  "2 Tesalonicenses": 3,
  "1 Timoteo": 6,
  "2 Timoteo": 4,
  Tito: 3,
  Filemón: 1,
  Hebreos: 13,
  Santiago: 5,
  "1 Pedro": 5,
  "2 Pedro": 3,
  "1 Juan": 5,
  "2 Juan": 1,
  "3 Juan": 1,
  Judas: 1,
  Apocalipsis: 22,
}

/** Libros AT en orden a partir de Ezequiel (ancla del plan). */
const LIBROS_AT_DESDE_EZEQUIEL = [
  "Ezequiel",
  "Daniel",
  "Oseas",
  "Joel",
  "Amós",
  "Abdías",
  "Jonás",
  "Miqueas",
  "Nahúm",
  "Habacuc",
  "Sofonías",
  "Hageo",
  "Zacarías",
  "Malaquías",
] as const

type CapRef = { libro: string; capitulo: number }

export type CapituloLectura = {
  libro: string
  capitulo: number
  /** Título visible (p. ej. «Daniel 1», «Salmo 92»). */
  etiqueta: string
  /** Referencia para cargar el texto (p. ej. «Salmo 92», «Apocalipsis 15»). */
  referencia: string
}

export type LecturaDelDia = {
  fecha: string
  indiceDia: number
  at: {
    libro: string
    desde: number
    hasta: number
    etiqueta: string
    referencias: string[]
  }
  salmo: { capitulo: number; etiqueta: string; referencia: string }
  apocalipsis: { capitulo: number; etiqueta: string; referencia: string }
  resumen: string
  /** Capítulos del día en orden, uno por pantalla de lectura. */
  capitulos: CapituloLectura[]
  referencias: string[]
}

function parseFechaLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y!, m! - 1, d!)
}

function fechaAIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function fechaHoyLocal(): string {
  return fechaAIso(new Date())
}

function esDomingo(d: Date): boolean {
  return d.getDay() === 0
}

/** Índice 0-based de días de lectura (lun–sáb) desde el inicio del plan. */
export function indiceDiaLectura(fechaIso: string): number | null {
  const inicio = parseFechaLocal(PLAN_LECTURA_INICIO)
  const fin = parseFechaLocal(PLAN_LECTURA_FIN)
  const actual = parseFechaLocal(fechaIso)

  if (actual < inicio || actual > fin) return null
  if (esDomingo(actual)) return null

  let idx = 0
  const cursor = new Date(inicio.getTime())
  while (cursor < actual) {
    if (!esDomingo(cursor)) idx++
    cursor.setDate(cursor.getDate() + 1)
  }
  return idx
}

function construirColaAt(): CapRef[] {
  const cola: CapRef[] = []
  for (const libro of LIBROS_AT_DESDE_EZEQUIEL) {
    const total = CAPITULOS_LIBRO[libro] ?? 0
    const desde = libro === "Ezequiel" ? 47 : 1
    for (let c = desde; c <= total; c++) {
      cola.push({ libro, capitulo: c })
    }
  }
  return cola
}

const COLA_AT = construirColaAt()

function formatoRangoAt(caps: CapRef[]): LecturaDelDia["at"] {
  const primero = caps[0]!
  const ultimo = caps[caps.length - 1]!
  const mismoLibro = primero.libro === ultimo.libro
  const desde = primero.capitulo
  const hasta = ultimo.capitulo
  let etiqueta: string
  if (mismoLibro) {
    etiqueta = desde === hasta ? `${primero.libro} ${desde}` : `${primero.libro} ${desde}-${hasta}`
  } else {
    etiqueta = caps.map((c) => `${c.libro} ${c.capitulo}`).join(", ")
  }
  const referencias = caps.map((c) => `${c.libro} ${c.capitulo}`)
  return { libro: primero.libro, desde, hasta, etiqueta, referencias }
}

function salmoDelDia(indice: number): LecturaDelDia["salmo"] {
  // Día 0 → Salmo 91
  const n = ((90 + indice) % 150) + 1
  return { capitulo: n, etiqueta: `Salmo ${n}`, referencia: `Salmo ${n}` }
}

function apocalipsisDelDia(indice: number): LecturaDelDia["apocalipsis"] {
  // Día 0 → Apocalipsis 15; cicla 1–22
  const n = ((14 + indice) % 22) + 1
  return {
    capitulo: n,
    etiqueta: `Apocalipsis ${n}`,
    referencia: `Apocalipsis ${n}`,
  }
}

function capitulosDelDia(
  capsAt: CapRef[],
  salmo: LecturaDelDia["salmo"],
  apocalipsis: LecturaDelDia["apocalipsis"]
): CapituloLectura[] {
  const lista: CapituloLectura[] = capsAt.map((c) => ({
    libro: c.libro,
    capitulo: c.capitulo,
    etiqueta: `${c.libro} ${c.capitulo}`,
    referencia: `${c.libro} ${c.capitulo}`,
  }))
  lista.push({
    libro: "Salmos",
    capitulo: salmo.capitulo,
    etiqueta: salmo.etiqueta,
    referencia: salmo.referencia,
  })
  lista.push({
    libro: "Apocalipsis",
    capitulo: apocalipsis.capitulo,
    etiqueta: apocalipsis.etiqueta,
    referencia: apocalipsis.referencia,
  })
  return lista
}

export function getLecturaDelDia(fechaIso?: string): LecturaDelDia | null {
  const fecha = fechaIso ?? fechaHoyLocal()
  const indice = indiceDiaLectura(fecha)
  if (indice == null) return null

  const offset = indice * 2
  const caps = COLA_AT.slice(offset, offset + 2)
  if (caps.length === 0) return null

  const at = formatoRangoAt(caps)
  const salmo = salmoDelDia(indice)
  const apocalipsis = apocalipsisDelDia(indice)
  const capitulos = capitulosDelDia(caps, salmo, apocalipsis)
  const referencias = capitulos.map((c) => c.referencia)
  const resumen = `${at.etiqueta} · ${salmo.etiqueta} · ${apocalipsis.etiqueta}`

  return {
    fecha,
    indiceDia: indice,
    at,
    salmo,
    apocalipsis,
    resumen,
    capitulos,
    referencias,
  }
}

export function etiquetaFechaLectura(fechaIso: string): string {
  const d = parseFechaLocal(fechaIso)
  return d.toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}
