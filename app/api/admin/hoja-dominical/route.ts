import { NextResponse } from "next/server"
import { adminPinValido } from "@/lib/adminPin"
import {
  guardarHojaDominical,
  listarHojasDominicales,
  modoAlmacenamientoHojas,
} from "@/lib/hojaDominicalServer"

export const dynamic = "force-dynamic"

function pinDesdeRequest(req: Request, form?: FormData): string {
  const header = req.headers.get("x-admin-pin")?.trim()
  if (header) return header
  if (form) return String(form.get("pin") ?? "").trim()
  return ""
}

export async function GET(req: Request) {
  const pin = pinDesdeRequest(req)
  if (!adminPinValido(pin)) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 })
  }

  const hojas = await listarHojasDominicales()
  return NextResponse.json({ hojas, modo: modoAlmacenamientoHojas() })
}

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 })
  }

  const pin = pinDesdeRequest(req, form)
  if (!adminPinValido(pin)) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 })
  }

  const semana = Number(form.get("semana"))
  const archivo = form.get("archivo")

  if (!Number.isFinite(semana)) {
    return NextResponse.json({ error: "Semana inválida" }, { status: 400 })
  }
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo PDF" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await archivo.arrayBuffer())
    const hoja = await guardarHojaDominical(semana, buffer, archivo.name)
    return NextResponse.json({ ok: true, hoja })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo subir el PDF"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
