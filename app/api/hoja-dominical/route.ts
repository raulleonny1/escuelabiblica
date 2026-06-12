import { NextResponse } from "next/server"
import { obtenerHojaDominical } from "@/lib/hojaDominicalServer"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const semana = Number(new URL(req.url).searchParams.get("semana") ?? "1")
  if (!Number.isFinite(semana)) {
    return NextResponse.json({ error: "Semana inválida" }, { status: 400 })
  }

  const data = await obtenerHojaDominical(semana)
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
  })
}
