import { existsSync } from "fs"
import { mkdir, stat, writeFile } from "fs/promises"
import path from "path"
import { semanaHojaDominicalValida } from "@/lib/hojaDominical"
import { TOTAL_LECCIONES } from "@/lib/lecciones"
import {
  listarArchivosStorage,
  subirArchivoStorage,
  supabaseStorageConfigurado,
  urlPublicaStorage,
} from "@/lib/supabaseStorage"

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

async function nombresSubidos(): Promise<Set<string>> {
  const nombres = new Set<string>()
  if (supabaseStorageConfigurado()) {
    for (const n of await listarArchivosStorage()) nombres.add(n)
  }
  for (let s = 1; s <= TOTAL_LECCIONES; s++) {
    if (existsSync(rutaLocal(s))) nombres.add(nombrePdfHojaDominical(s))
  }
  return nombres
}

async function infoDesdeNombre(semana: number, nombres: Set<string>): Promise<HojaDominicalInfo | null> {
  const archivo = nombrePdfHojaDominical(semana)
  if (!nombres.has(archivo)) return null

  const local = rutaLocal(semana)
  if (existsSync(local)) {
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

  if (supabaseStorageConfigurado()) {
    return {
      semana,
      subido: true,
      url: urlPublicaStorage(archivo),
      actualizadoEn: null,
    }
  }

  return null
}

export async function obtenerHojaDominical(semana: number): Promise<HojaDominicalRespuesta> {
  const n = semanaHojaDominicalValida(semana)
  const nombres = await nombresSubidos()
  const info = await infoDesdeNombre(n, nombres)
  if (info?.url) return { url: info.url, origen: "subido", semana: n }
  return { url: null, origen: "ninguno", semana: n }
}

export async function listarHojasDominicales(): Promise<HojaDominicalInfo[]> {
  const nombres = await nombresSubidos()
  const lista: HojaDominicalInfo[] = []
  for (let s = 1; s <= TOTAL_LECCIONES; s++) {
    lista.push(
      (await infoDesdeNombre(s, nombres)) ?? {
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

  const pathArchivo = nombrePdfHojaDominical(n)

  if (supabaseStorageConfigurado()) {
    await subirArchivoStorage(pathArchivo, buffer, "application/pdf")
    return {
      semana: n,
      subido: true,
      url: urlPublicaStorage(pathArchivo),
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
