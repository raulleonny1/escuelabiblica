import { NextResponse } from "next/server"
import { adminPinValido } from "@/lib/adminPin"
import { listarHojasDominicales, subirHojaDominical } from "@/lib/hojaDominicalServer"
import { adminStorageDisponible } from "@/lib/firebaseAdmin"

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

  if (!adminStorageDisponible()) {
    return NextResponse.json(
      {
        error:
          "Falta FIREBASE_SERVICE_ACCOUNT_JSON en el servidor para gestionar PDFs.",
        hojas: [],
      },
      { status: 503 }
    )
  }

  try {
    const hojas = await listarHojasDominicales()
    return NextResponse.json({ hojas })
  } catch {
    return NextResponse.json({ error: "No se pudieron listar las hojas" }, { status: 500 })
  }
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

  if (!adminStorageDisponible()) {
    return NextResponse.json(
      {
        error:
          "Falta FIREBASE_SERVICE_ACCOUNT_JSON en el servidor para subir PDFs.",
      },
      { status: 503 }
    )
  }

  const semana = Number(form.get("semana"))
  const archivo = form.get("archivo")

  if (!Number.isFinite(semana)) {
    return NextResponse.json({ error: "Semana inválida" }, { status: 400 })
  }

  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo PDF" }, { status: 400 })
  }

  if (archivo.type !== "application/pdf" && !archivo.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await archivo.arrayBuffer())
    const hoja = await subirHojaDominical(semana, buffer, archivo.name)
    return NextResponse.json({ ok: true, hoja })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo subir el PDF"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
