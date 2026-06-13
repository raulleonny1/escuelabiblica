import { existsSync } from "fs"
import { mkdir, stat, writeFile } from "fs/promises"
import path from "path"
import { semanaHojaDominicalValida } from "@/lib/hojaDominical"
import { TOTAL_LECCIONES } from "@/lib/lecciones"
import { getSupabaseServer, SUPABASE_BUCKET_HOJAS, supabaseConfigurado } from "@/lib/supabaseServer"

export type HojaDominicalInfo = {
  semana: number
  subido: boolean
  url: string
  actualizadoEn: string | null
}

export type HojaDominicalRespuesta = {
  url: string | null
  origen: "subido" | "ninguno"
  semana: number
}

const MAX_PDF_BYTES = 15 * 1024 * 1024
const CARPETA = path.join(process.cwd(), "public", "pdf", "hojas")

export function nombrePdfHojaDominical(semana: number): string {
  const n = semanaHojaDominicalValida(semana)
  return `semana-${String(n).padStart(2, "0")}.pdf`
}

function urlPublicaLocal(semana: number, version?: number): string {
  const base = `/pdf/hojas/${nombrePdfHojaDominical(semana)}`
  return version ? `${base}?v=${version}` : base
}

function rutaLocal(semana: number): string {
  return path.join(CARPETA, nombrePdfHojaDominical(semana))
}

function urlPublicaSupabase(pathArchivo: string): string {
  const supabase = getSupabaseServer()!
  return supabase.storage.from(SUPABASE_BUCKET_HOJAS).getPublicUrl(pathArchivo).data.publicUrl
}

async function nombresEnSupabase(): Promise<Set<string>> {
  const nombres = new Set<string>()
  const supabase = getSupabaseServer()
  if (!supabase) return nombres
  try {
    const { data } = await supabase.storage.from(SUPABASE_BUCKET_HOJAS).list("", { limit: 100 })
    for (const f of data ?? []) nombres.add(f.name)
  } catch {
    /* vacío */
  }
  return nombres
}

async function infoDesdeSupabase(
  semana: number,
  cache?: Set<string>
): Promise<HojaDominicalInfo | null> {
  if (!supabaseConfigurado()) return null
  const archivo = nombrePdfHojaDominical(semana)
  const nombres = cache ?? (await nombresEnSupabase())
  if (!nombres.has(archivo)) return null
  return {
    semana,
    subido: true,
    url: urlPublicaSupabase(archivo),
    actualizadoEn: null,
  }
}

async function infoDesdeDisco(semana: number): Promise<HojaDominicalInfo | null> {
  const local = rutaLocal(semana)
  if (!existsSync(local)) return null
  try {
    const { mtimeMs } = await stat(local)
    return {
      semana,
      subido: true,
      url: urlPublicaLocal(semana, Math.floor(mtimeMs)),
      actualizadoEn: new Date(mtimeMs).toISOString(),
    }
  } catch {
    return { semana, subido: true, url: urlPublicaLocal(semana), actualizadoEn: null }
  }
}

async function infoHoja(semana: number, cache?: Set<string>): Promise<HojaDominicalInfo | null> {
  return (await infoDesdeSupabase(semana, cache)) ?? (await infoDesdeDisco(semana))
}

export async function obtenerHojaDominical(semana: number): Promise<HojaDominicalRespuesta> {
  const n = semanaHojaDominicalValida(semana)
  const info = await infoHoja(n)
  if (info?.url) {
    return { url: info.url, origen: "subido", semana: n }
  }
  return { url: null, origen: "ninguno", semana: n }
}

export async function listarHojasDominicales(): Promise<HojaDominicalInfo[]> {
  const cache = await nombresEnSupabase()
  const lista: HojaDominicalInfo[] = []
  for (let s = 1; s <= TOTAL_LECCIONES; s++) {
    lista.push(
      (await infoHoja(s, cache)) ?? {
        semana: s,
        subido: false,
        url: "",
        actualizadoEn: null,
      }
    )
  }
  return lista
}

export async function guardarHojaDominical(
  semana: number,
  buffer: Buffer,
  nombreOriginal: string
): Promise<HojaDominicalInfo> {
  const n = semanaHojaDominicalValida(semana)
  if (buffer.length === 0) throw new Error("El archivo está vacío")
  if (buffer.length > MAX_PDF_BYTES) throw new Error("El PDF no puede superar 15 MB")

  const esPdf =
    nombreOriginal.toLowerCase().endsWith(".pdf") ||
    buffer.subarray(0, 5).toString("ascii") === "%PDF-"
  if (!esPdf) throw new Error("Solo se permiten archivos PDF")

  const supabase = getSupabaseServer()
  if (supabase) {
    const pathArchivo = nombrePdfHojaDominical(n)
    const { error } = await supabase.storage.from(SUPABASE_BUCKET_HOJAS).upload(pathArchivo, buffer, {
      contentType: "application/pdf",
      upsert: true,
    })
    if (error) {
      throw new Error(
        error.message.includes("Bucket not found")
          ? "Crea el bucket «hojas-dominicales» en Supabase (público). Ejecuta supabase/storage-setup.sql"
          : error.message
      )
    }
    return {
      semana: n,
      subido: true,
      url: urlPublicaSupabase(pathArchivo),
      actualizadoEn: new Date().toISOString(),
    }
  }

  await mkdir(CARPETA, { recursive: true })
  const destino = rutaLocal(n)
  await writeFile(destino, buffer)
  const { mtimeMs } = await stat(destino)
  return {
    semana: n,
    subido: true,
    url: urlPublicaLocal(n, Math.floor(mtimeMs)),
    actualizadoEn: new Date(mtimeMs).toISOString(),
  }
}
