import { normalizarTextoParaTts } from "@/lib/ttsNormalizar"

const MAX_CARACTERES = 200

/** Síntesis de voz en español vía servicio público (MP3). */
export async function sintetizarAudioEspanol(texto: string): Promise<Buffer> {
  const trozo = normalizarTextoParaTts(texto).slice(0, MAX_CARACTERES)
  if (!trozo) throw new Error("Texto vacío")

  const url = new URL("https://translate.google.com/translate_tts")
  url.searchParams.set("ie", "UTF-8")
  url.searchParams.set("client", "tw-ob")
  url.searchParams.set("tl", "es")
  url.searchParams.set("q", trozo)

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://translate.google.com/",
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`TTS respondió ${res.status}`)

  const tipo = res.headers.get("content-type") ?? ""
  if (!tipo.includes("audio")) throw new Error("Respuesta no es audio")

  return Buffer.from(await res.arrayBuffer())
}

export { MAX_CARACTERES as MAX_TEXTO_TTS }
