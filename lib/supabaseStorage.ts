const BUCKET = "hojas-dominicales"

function baseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw) return null
  // Solo el host del proyecto, sin /rest/v1/ ni /storage/v1/
  return raw.replace(/\/+$/, "").replace(/\/rest\/v1\/?$/i, "")
}

function apiKey(): string | null {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    null
  )
}

export function supabaseStorageConfigurado(): boolean {
  return Boolean(baseUrl() && apiKey())
}

function headers(): HeadersInit {
  const key = apiKey()!
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  }
}

export function urlPublicaStorage(pathArchivo: string): string {
  return `${baseUrl()}/storage/v1/object/public/${BUCKET}/${pathArchivo}`
}

export async function listarArchivosStorage(): Promise<string[]> {
  const url = baseUrl()
  const key = apiKey()
  if (!url || !key) return []

  const res = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      ...headers(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: "", limit: 100 }),
  })

  if (!res.ok) return []

  const data = (await res.json()) as { name: string }[]
  return Array.isArray(data) ? data.map((f) => f.name) : []
}

export async function subirArchivoStorage(
  pathArchivo: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const url = baseUrl()
  const key = apiKey()
  if (!url || !key) throw new Error("Supabase no configurado")

  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${pathArchivo}`, {
    method: "POST",
    headers: {
      ...headers(),
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  })

  if (!res.ok) {
    const txt = await res.text()
    let msg = txt
    try {
      const j = JSON.parse(txt) as { message?: string; error?: string }
      msg = j.message || j.error || txt
    } catch {
      /* texto plano */
    }
    if (msg.includes("Bucket not found") || res.status === 404) {
      throw new Error(
        "Falta el bucket «hojas-dominicales» en Supabase. Ejecuta supabase/storage-setup.sql"
      )
    }
    throw new Error(msg || `Error ${res.status} al subir`)
  }
}

export { BUCKET as SUPABASE_BUCKET_HOJAS }
