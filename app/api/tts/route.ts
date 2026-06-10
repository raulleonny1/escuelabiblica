import { NextResponse } from "next/server"
import { MAX_TEXTO_TTS, sintetizarAudioEspanol } from "@/lib/sintesisAudioServer"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get("text")?.trim()

  if (!text || text.length > MAX_TEXTO_TTS) {
    return NextResponse.json({ error: "Texto inválido o demasiado largo" }, { status: 400 })
  }

  try {
    const audio = await sintetizarAudioEspanol(text)
    return new NextResponse(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=604800",
      },
    })
  } catch {
    return NextResponse.json({ error: "No se pudo generar el audio" }, { status: 500 })
  }
}
