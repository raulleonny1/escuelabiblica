import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage"
import {
  HOJA_DOMINICAL_CARPETA,
  HOJA_DOMINICAL_PDF_PATH,
  rutaStorageHojaDominical,
  semanaHojaDominicalValida,
} from "@/lib/hojaDominical"
import { getStorageBucket, isFirebaseConfigured } from "@/lib/firebase"
import { TOTAL_LECCIONES } from "@/lib/lecciones"

export type HojaDominicalEstado = {
  semana: number
  url: string
  subido: boolean
}

export function hojasDominicalesDisponibles(): boolean {
  return isFirebaseConfigured() && Boolean(getStorageBucket())
}

export async function urlHojaDominical(semana: number): Promise<string> {
  if (!hojasDominicalesDisponibles()) return HOJA_DOMINICAL_PDF_PATH
  try {
    const storage = getStorageBucket()
    return await getDownloadURL(ref(storage, rutaStorageHojaDominical(semana)))
  } catch {
    return HOJA_DOMINICAL_PDF_PATH
  }
}

export async function listarHojasDominicales(): Promise<HojaDominicalEstado[]> {
  const semanasSubidas = new Set<number>()

  if (hojasDominicalesDisponibles()) {
    try {
      const storage = getStorageBucket()
      const carpeta = await listAll(ref(storage, HOJA_DOMINICAL_CARPETA))
      for (const item of carpeta.items) {
        const match = item.name.match(/^semana-(\d+)\.pdf$/i)
        if (match) semanasSubidas.add(Number(match[1]))
      }
    } catch {
      /* sin archivos aún */
    }
  }

  const lista: HojaDominicalEstado[] = []
  for (let s = 1; s <= TOTAL_LECCIONES; s++) {
    lista.push({
      semana: s,
      url: "",
      subido: semanasSubidas.has(s),
    })
  }
  return lista
}

export async function subirHojaDominical(semana: number, file: File): Promise<void> {
  if (!hojasDominicalesDisponibles()) {
    throw new Error("Firebase Storage no está configurado (revisa NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).")
  }
  if (file.size > 15 * 1024 * 1024) throw new Error("El PDF no puede superar 15 MB")
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Solo se permiten archivos PDF")
  }

  const n = semanaHojaDominicalValida(semana)
  const storage = getStorageBucket()
  await uploadBytes(ref(storage, rutaStorageHojaDominical(n)), file, {
    contentType: "application/pdf",
  })
}
