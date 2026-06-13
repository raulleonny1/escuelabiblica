import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cliente: SupabaseClient | null = null

export const SUPABASE_BUCKET_HOJAS = "hojas-dominicales"

export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      (process.env.SUPABASE_SECRET_KEY?.trim() ||
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim())
  )
}

/** Cliente servidor para Storage (usa secret si existe; si no, publishable). */
export function getSupabaseServer(): SupabaseClient | null {
  if (cliente) return cliente

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !key) return null

  cliente = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cliente
}
