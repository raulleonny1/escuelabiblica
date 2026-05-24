import { LIBROS_RVR_1909, ordenarClavesNumericas, type BibliaData } from "@/lib/biblia"

const ALIAS_LIBRO: Record<string, string> = {
  Salmo: "Salmos",
}

const ABREVIATURAS_LIBRO: Record<string, string[]> = {
  Mateo: ["Mt", "Mat"],
  Marcos: ["Mr", "Mc", "Mar"],
  Lucas: ["Lc", "Luc"],
  Juan: ["Jn", "Jn."],
  Hechos: ["Hch", "Act"],
  Romanos: ["Rom", "Ro"],
  "1 Corintios": ["1 Co", "1Cor", "I Cor"],
  "2 Corintios": ["2 Co", "2Cor", "II Cor"],
  Gálatas: ["Gal", "Ga"],
  Efesios: ["Ef", "Efe"],
  Filipenses: ["Fil", "Flp"],
  Colosenses: ["Col"],
  "1 Tesalonicenses": ["1 Tes", "1Ts", "I Tes"],
  "2 Tesalonicenses": ["2 Tes", "2Ts", "II Tes"],
  "1 Timoteo": ["1 Tim", "1Ti", "I Tim"],
  "2 Timoteo": ["2 Tim", "2Ti", "II Tim"],
  Tito: ["Tit", "Tt"],
  Filemón: ["Flm", "Filem"],
  Hebreos: ["Heb", "He"],
  Santiago: ["Stg", "Stgo", "Sgo"],
  "1 Pedro": ["1 Pe", "1P", "I Ped"],
  "2 Pedro": ["2 Pe", "2P", "II Ped"],
  "1 Juan": ["1 Jn", "1Jn", "I Jn"],
  "2 Juan": ["2 Jn", "2Jn", "II Jn"],
  "3 Juan": ["3 Jn", "3Jn", "III Jn"],
  Judas: ["Jud", "Jd"],
  Revelación: ["Ap", "Apoc", "Rev"],
  Salmos: ["Sal", "Ps"],
  Proverbios: ["Prov", "Pr"],
  Génesis: ["Gen", "Gn"],
  Éxodo: ["Ex", "Exo"],
  Isaías: ["Isa", "Is"],
  Jeremías: ["Jer"],
  Daniel: ["Dan", "Dn"],
}

function normalizarTokenLibro(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function escaparRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function tokenLibroAPatron(token: string): string {
  return token
    .trim()
    .split(/\s+/)
    .map(escaparRegExp)
    .join("\\s+")
}

const TOKENS_A_LIBRO = new Map<string, string>()
for (const libro of LIBROS_RVR_1909) {
  TOKENS_A_LIBRO.set(normalizarTokenLibro(libro), libro)
}
for (const [libro, variantes] of Object.entries(ABREVIATURAS_LIBRO)) {
  TOKENS_A_LIBRO.set(normalizarTokenLibro(libro), libro)
  for (const v of variantes) TOKENS_A_LIBRO.set(normalizarTokenLibro(v), libro)
}
for (const [alias, canonico] of Object.entries(ALIAS_LIBRO)) {
  TOKENS_A_LIBRO.set(normalizarTokenLibro(alias), canonico)
}

const TOKENS_LIBRO = [...TOKENS_A_LIBRO.keys()].sort((a, b) => b.length - a.length)

export type ReferenciaPasaje = {
  libro: string
  capitulo: number
  versiculoInicio?: number
  versiculoFin?: number
  capituloFin?: number
}

export type VersoPasaje = {
  capitulo: number
  numero: string
  texto: string
}

export type TextoPasajeResultado = {
  titulo: string
  versos: VersoPasaje[]
  aviso?: string
  error?: string
}

export type SegmentoTextoPasaje =
  | { tipo: "texto"; contenido: string }
  | { tipo: "pasaje"; contenido: string; referencia: string }

const MAX_VERSOS = 45

const RE_PASAJES = new RegExp(
  `(${TOKENS_LIBRO.map(tokenLibroAPatron).join("|")})\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?|-(\\d+))?`,
  "gi"
)

function normalizarLibro(nombre: string): string {
  const token = normalizarTokenLibro(nombre)
  return TOKENS_A_LIBRO.get(token) ?? ALIAS_LIBRO[nombre] ?? nombre
}

export function parseReferenciaPasaje(raw: string): ReferenciaPasaje | null {
  const normalizado = normalizarTokenLibro(raw.trim())
  const match = normalizado.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?|-(\d+))?$/)
  if (!match) return null

  const libroNorm = normalizarLibro(match[1] ?? "")
  if (!LIBROS_RVR_1909.includes(libroNorm as (typeof LIBROS_RVR_1909)[number])) return null

  const capitulo = Number(match[2])
  const versiculoInicio = match[3] ? Number(match[3]) : undefined
  const versiculoFin = match[4] ? Number(match[4]) : undefined
  const capituloFin = !versiculoInicio && match[5] ? Number(match[5]) : undefined

  if (versiculoInicio !== undefined) {
    return { libro: libroNorm, capitulo, versiculoInicio, versiculoFin }
  }
  if (capituloFin !== undefined) {
    return { libro: libroNorm, capitulo, capituloFin }
  }
  if (capitulo > 0) {
    return { libro: libroNorm, capitulo }
  }
  return null
}

export function formatearTituloPasaje(ref: ReferenciaPasaje): string {
  if (ref.versiculoInicio) {
    const fin =
      ref.versiculoFin && ref.versiculoFin !== ref.versiculoInicio
        ? `-${ref.versiculoFin}`
        : ""
    return `${ref.libro} ${ref.capitulo}:${ref.versiculoInicio}${fin}`
  }
  if (ref.capituloFin) {
    return `${ref.libro} ${ref.capitulo}–${ref.capituloFin}`
  }
  return `${ref.libro} ${ref.capitulo}`
}

export function segmentarPasajesEnTexto(texto: string): SegmentoTextoPasaje[] {
  const segmentos: SegmentoTextoPasaje[] = []
  let ultimo = 0

  for (const coincidencia of texto.matchAll(RE_PASAJES)) {
    const indice = coincidencia.index ?? 0
    const bruto = coincidencia[0]

    if (indice > 0 && /[a-záéíóúñ0-9]/i.test(texto[indice - 1] ?? "")) continue

    const despues = indice + bruto.length
    if (despues < texto.length && /[a-záéíóúñ0-9]/i.test(texto[despues] ?? "")) continue

    if (!parseReferenciaPasaje(bruto)) continue

    if (indice > ultimo) {
      segmentos.push({ tipo: "texto", contenido: texto.slice(ultimo, indice) })
    }
    segmentos.push({ tipo: "pasaje", contenido: bruto, referencia: bruto })
    ultimo = despues
  }

  if (ultimo < texto.length) {
    segmentos.push({ tipo: "texto", contenido: texto.slice(ultimo) })
  }

  if (segmentos.length === 0) {
    segmentos.push({ tipo: "texto", contenido: texto })
  }

  return segmentos
}

export function extraerTextoPasaje(
  biblia: BibliaData,
  ref: ReferenciaPasaje
): TextoPasajeResultado {
  const titulo = formatearTituloPasaje(ref)
  const libroData = biblia[ref.libro]
  if (!libroData) {
    return { titulo, versos: [], error: `No se encontró el libro «${ref.libro}» en la Biblia.` }
  }

  const versos: VersoPasaje[] = []

  const agregarCapitulo = (cap: number) => {
    const capData = libroData[String(cap)]
    if (!capData) return
    for (const num of ordenarClavesNumericas(Object.keys(capData))) {
      if (versos.length >= MAX_VERSOS) return
      versos.push({ capitulo: cap, numero: num, texto: capData[num]! })
    }
  }

  if (ref.versiculoInicio !== undefined) {
    const capData = libroData[String(ref.capitulo)]
    const fin = ref.versiculoFin ?? ref.versiculoInicio
    for (let v = ref.versiculoInicio; v <= fin && versos.length < MAX_VERSOS; v++) {
      const t = capData?.[String(v)]
      if (t) versos.push({ capitulo: ref.capitulo, numero: String(v), texto: t })
    }
  } else if (ref.capituloFin !== undefined) {
    for (let c = ref.capitulo; c <= ref.capituloFin && versos.length < MAX_VERSOS; c++) {
      agregarCapitulo(c)
    }
  } else {
    agregarCapitulo(ref.capitulo)
  }

  if (versos.length === 0) {
    return { titulo, versos: [], error: "No se encontraron versículos para esta referencia." }
  }

  let aviso: string | undefined
  if (versos.length >= MAX_VERSOS) {
    aviso = "Pasaje muy largo; se muestra el inicio. Abre la pestaña Biblia para leerlo completo."
  }

  return { titulo, versos, aviso }
}
