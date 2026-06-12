import { existsSync } from "fs"
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises"
import path from "path"
import { HOJA_DOMINICAL_PDF_PATH, semanaHojaDominicalValida } from "@/lib/hojaDominical"
import { TOTAL_LECCIONES } from "@/lib/lecciones"

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

export async function obtenerHojaDominical(semana: number): Promise<{
  url: string
  origen: "subido" | "predeterminado"
  semana: number
}> {
  const n = semanaHojaDominicalValida(semana)
  const local = rutaLocal(n)
  if (existsSync(local)) {
    try {
      const { mtimeMs } = await stat(local)
      return { url: urlPublicaHojaDominical(n, Math.floor(mtimeMs)), origen: "subido", semana: n }
    } catch {
      return { url: urlPublicaHojaDominical(n), origen: "subido", semana: n }
    }
  }
  return { url: HOJA_DOMINICAL_PDF_PATH, origen: "predeterminado", semana: n }
}

export async function listarHojasDominicales(): Promise<HojaDominicalInfo[]> {
  const lista: HojaDominicalInfo[] = []
  for (let s = 1; s <= TOTAL_LECCIONES; s++) {
    const local = rutaLocal(s)
    if (existsSync(local)) {
      try {
        const { mtimeMs } = await stat(local)
        lista.push({
          semana: s,
          subido: true,
          url: urlPublicaHojaDominical(s, Math.floor(mtimeMs)),
          actualizadoEn: new Date(mtimeMs).toISOString(),
        })
        continue
      } catch {
        /* sigue abajo */
      }
    }
    lista.push({ semana: s, subido: false, url: "", actualizadoEn: null })
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

/** Comprueba que la carpeta de PDFs se puede escribir (dev / servidor propio). */
export async function almacenamientoHojasDisponible(): Promise<boolean> {
  try {
    await mkdir(CARPETA, { recursive: true })
    const prueba = path.join(CARPETA, ".write-test")
    await writeFile(prueba, "ok")
    await readFile(prueba)
    await unlink(prueba).catch(() => {})
    return true
  } catch {
    return false
  }
}
