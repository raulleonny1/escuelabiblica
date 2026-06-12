import { NextResponse } from "next/server"
import { obtenerHojaDominical } from "@/lib/hojaDominicalServer"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const semana = Number(searchParams.get("semana") ?? "1")

  if (!Number.isFinite(semana)) {
    return NextResponse.json({ error: "Semana inválida" }, { status: 400 })
  }

  try {
    const data = await obtenerHojaDominical(semana)
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    })
  } catch {
    return NextResponse.json({ error: "No se pudo obtener la hoja dominical" }, { status: 500 })
  }
}
