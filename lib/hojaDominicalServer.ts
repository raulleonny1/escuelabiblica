import { randomUUID } from "crypto"
import { FieldValue } from "firebase-admin/firestore"
import { TOTAL_LECCIONES } from "@/lib/lecciones"
import {
  HOJA_DOMINICAL_COLECCION,
  HOJA_DOMINICAL_PDF_PATH,
  rutaStorageHojaDominical,
  semanaHojaDominicalValida,
} from "@/lib/hojaDominical"
import { getAdminDb, getAdminStorage } from "@/lib/firebaseAdmin"

export type HojaDominicalMeta = {
  semana: number
  url: string
  nombreArchivo: string
  actualizadoEn: string | null
  tamanoBytes: number
}

export type HojaDominicalRespuesta = {
  url: string
  origen: "subido" | "predeterminado"
  semana: number
  actualizadoEn: string | null
}

function tsIso(v: unknown): string | null {
  if (!v || typeof v !== "object") return null
  const t = v as { toDate?: () => Date }
  if (typeof t.toDate === "function") return t.toDate().toISOString()
  return null
}

function urlDescargaStorage(bucketName: string, path: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`
}

export async function obtenerHojaDominical(semana: number): Promise<HojaDominicalRespuesta> {
  const n = semanaHojaDominicalValida(semana)
  const db = getAdminDb()
  if (!db) {
    return {
      url: HOJA_DOMINICAL_PDF_PATH,
      origen: "predeterminado",
      semana: n,
      actualizadoEn: null,
    }
  }

  const doc = await db.collection(HOJA_DOMINICAL_COLECCION).doc(String(n)).get()
  if (!doc.exists) {
    return {
      url: HOJA_DOMINICAL_PDF_PATH,
      origen: "predeterminado",
      semana: n,
      actualizadoEn: null,
    }
  }

  const data = doc.data()!
  const url = String(data.url ?? "").trim()
  if (!url) {
    return {
      url: HOJA_DOMINICAL_PDF_PATH,
      origen: "predeterminado",
      semana: n,
      actualizadoEn: null,
    }
  }

  return {
    url,
    origen: "subido",
    semana: n,
    actualizadoEn: tsIso(data.actualizadoEn),
  }
}

export async function listarHojasDominicales(): Promise<HojaDominicalMeta[]> {
  const db = getAdminDb()
  const porSemana = new Map<number, HojaDominicalMeta>()

  if (db) {
    const snap = await db.collection(HOJA_DOMINICAL_COLECCION).get()
    for (const doc of snap.docs) {
      const semana = Number(doc.id)
      if (!Number.isFinite(semana) || semana < 1 || semana > TOTAL_LECCIONES) continue
      const data = doc.data()
      const url = String(data.url ?? "").trim()
      if (!url) continue
      porSemana.set(semana, {
        semana,
        url,
        nombreArchivo: String(data.nombreArchivo ?? ""),
        actualizadoEn: tsIso(data.actualizadoEn),
        tamanoBytes: Number(data.tamanoBytes) || 0,
      })
    }
  }

  const lista: HojaDominicalMeta[] = []
  for (let s = 1; s <= TOTAL_LECCIONES; s++) {
    lista.push(
      porSemana.get(s) ?? {
        semana: s,
        url: "",
        nombreArchivo: "",
        actualizadoEn: null,
        tamanoBytes: 0,
      }
    )
  }
  return lista
}

const MAX_PDF_BYTES = 15 * 1024 * 1024

export async function subirHojaDominical(
  semana: number,
  buffer: Buffer,
  nombreArchivo: string
): Promise<HojaDominicalMeta> {
  const n = semanaHojaDominicalValida(semana)
  if (buffer.length === 0) throw new Error("El archivo está vacío")
  if (buffer.length > MAX_PDF_BYTES) throw new Error("El PDF no puede superar 15 MB")

  const storage = getAdminStorage()
  const db = getAdminDb()
  if (!storage || !db) {
    throw new Error(
      "Falta FIREBASE_SERVICE_ACCOUNT_JSON en el servidor para subir PDFs."
    )
  }

  const bucket = storage.bucket()
  const path = rutaStorageHojaDominical(n)
  const token = randomUUID()
  const file = bucket.file(path)

  await file.save(buffer, {
    metadata: {
      contentType: "application/pdf",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  })

  const url = urlDescargaStorage(bucket.name, path, token)

  await db
    .collection(HOJA_DOMINICAL_COLECCION)
    .doc(String(n))
    .set({
      semana: n,
      url,
      nombreArchivo: nombreArchivo || `semana-${n}.pdf`,
      tamanoBytes: buffer.length,
      actualizadoEn: FieldValue.serverTimestamp(),
    })

  return {
    semana: n,
    url,
    nombreArchivo: nombreArchivo || `semana-${n}.pdf`,
    actualizadoEn: new Date().toISOString(),
    tamanoBytes: buffer.length,
  }
}
