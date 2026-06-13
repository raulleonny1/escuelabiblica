import { existsSync } from "fs"
import { mkdir, stat, writeFile } from "fs/promises"
import path from "path"
import { HOJA_DOMINICAL_PDF_PATH, semanaHojaDominicalValida } from "@/lib/hojaDominical"
import { TOTAL_LECCIONES } from "@/lib/lecciones"
import { getSupabaseServer, SUPABASE_BUCKET_HOJAS, supabaseConfigurado } from "@/lib/supabaseServer"

export type HojaDominicalInfo = {
  semana: number
  subido: boolean
  url: string
  actualizadoEn: string | null
}

const MAX_PDF_BYTES = 15 * 1024 * 1024
const CARPETA = path.join(process.cwd(), "public", "pdf", "hojas")

export function nombrePdfHojaDominical(semana: number): string {
  const n = semanaHojaDominicalValida(semana)
  return `semana-${String(n).padStart(2, "0")}.pdf`
}

export function urlPublicaHojaDominical(semana: number, version?: number): string {
  const base = `/pdf/hojas/${nombrePdfHojaDominical(semana)}`
  return version ? `${base}?v=${version}` : base
}

function rutaLocal(semana: number): string {
  return path.join(CARPETA, nombrePdfHojaDominical(semana))
}

async function urlPublicaSupabase(path: string): Promise<string | null> {
  const supabase = getSupabaseServer()
  if (!supabase) return null
  const { data } = supabase.storage.from(SUPABASE_BUCKET_HOJAS).getPublicUrl(path)
  const res = await fetch(data.publicUrl, { method: "HEAD", cache: "no-store" })
  if (!res.ok) return null
  const fecha = res.headers.get("last-modified")
  const version = fecha ? new Date(fecha).getTime() : Date.now()
  return `${data.publicUrl}?v=${version}`
}

async function infoDesdeSupabase(semana: number): Promise<HojaDominicalInfo | null> {
  if (!supabaseConfigurado()) return null
  const path = nombrePdfHojaDominical(semana)
  const url = await urlPublicaSupabase(path)
  if (!url) return null
  return {
    semana,
    subido: true,
    url,
    actualizadoEn: new Date().toISOString(),
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
      url: urlPublicaHojaDominical(semana, Math.floor(mtimeMs)),
      actualizadoEn: new Date(mtimeMs).toISOString(),
    }
  } catch {
    return {
      semana,
      subido: true,
      url: urlPublicaHojaDominical(semana),
      actualizadoEn: null,
    }
  }
}

async function infoHoja(semana: number): Promise<HojaDominicalInfo | null> {
  return (await infoDesdeSupabase(semana)) ?? (await infoDesdeDisco(semana))
}

export async function obtenerHojaDominical(semana: number): Promise<{
  url: string
  origen: "subido" | "predeterminado"
  semana: number
}> {
  const n = semanaHojaDominicalValida(semana)
  const info = await infoHoja(n)
  if (info?.url) {
    return { url: info.url, origen: "subido", semana: n }
  }
  return { url: HOJA_DOMINICAL_PDF_PATH, origen: "predeterminado", semana: n }
}

export async function listarHojasDominicales(): Promise<HojaDominicalInfo[]> {
  const lista: HojaDominicalInfo[] = []
  for (let s = 1; s <= TOTAL_LECCIONES; s++) {
    lista.push(
      (await infoHoja(s)) ?? {
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
    const path = nombrePdfHojaDominical(n)
    const { error } = await supabase.storage.from(SUPABASE_BUCKET_HOJAS).upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true,
    })
    if (error) {
      throw new Error(
        error.message.includes("Bucket not found")
          ? "Crea el bucket «hojas-dominicales» en Supabase Storage (público). Ver supabase/storage-setup.sql"
          : error.message
      )
    }
    const url = await urlPublicaSupabase(path)
    if (!url) throw new Error("PDF subido pero no se pudo obtener la URL pública")
    return {
      semana: n,
      subido: true,
      url,
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
    url: urlPublicaHojaDominical(n, Math.floor(mtimeMs)),
    actualizadoEn: new Date(mtimeMs).toISOString(),
  }
}

export function modoAlmacenamientoHojas(): "supabase" | "disco" {
  return supabaseConfigurado() ? "supabase" : "disco"
}
