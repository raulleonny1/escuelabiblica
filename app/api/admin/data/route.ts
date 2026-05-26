import { NextResponse } from "next/server"
import { adminPinValido } from "@/lib/adminPin"
import { construirDashboardData, type EventoRow, type SesionRow } from "@/lib/adminAnalyticsSummary"
import { getAdminDb } from "@/lib/firebaseAdmin"

export const dynamic = "force-dynamic"

function tsIso(v: unknown): string | null {
  if (!v || typeof v !== "object") return null
  const t = v as { toDate?: () => Date }
  if (typeof t.toDate === "function") return t.toDate().toISOString()
  return null
}

export async function POST(req: Request) {
  let pin = ""
  try {
    const body = (await req.json()) as { pin?: string }
    pin = body.pin ?? ""
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 })
  }

  if (!adminPinValido(pin)) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      {
        error:
          "Falta FIREBASE_SERVICE_ACCOUNT_JSON en el servidor. Añade la cuenta de servicio de Firebase en Vercel para ver el panel admin.",
        usarCliente: true,
      },
      { status: 503 }
    )
  }

  const [sesSnap, evSnap] = await Promise.all([
    db.collection("analyticsSesiones").orderBy("ultimoAcceso", "desc").limit(500).get(),
    db.collection("analyticsEventos").orderBy("createdAt", "desc").limit(3000).get(),
  ])

  const sesiones: SesionRow[] = sesSnap.docs.map((d) => {
    const x = d.data()
    return {
      sessionId: String(x.sessionId ?? d.id),
      usuarioId: String(x.usuarioId ?? ""),
      nombre: String(x.nombre ?? ""),
      ip: String(x.ip ?? ""),
      ciudad: String(x.ciudad ?? ""),
      region: String(x.region ?? ""),
      pais: String(x.pais ?? ""),
      dispositivo: String(x.dispositivo ?? ""),
      inicioEn: tsIso(x.inicioEn),
      ultimoAcceso: tsIso(x.ultimoAcceso),
      tiempoTotalSeg: Number(x.tiempoTotalSeg) || 0,
      ultimaRuta: String(x.ultimaRuta ?? ""),
      activo: x.activo !== false,
    }
  })

  const eventos: EventoRow[] = evSnap.docs.map((d) => {
    const x = d.data()
    return {
      id: d.id,
      sessionId: String(x.sessionId ?? ""),
      usuarioId: String(x.usuarioId ?? ""),
      nombre: String(x.nombre ?? ""),
      tipo: String(x.tipo ?? ""),
      destino: String(x.destino ?? ""),
      duracionSeg: Number(x.duracionSeg) || 0,
      createdAt: tsIso(x.createdAt),
    }
  })

  return NextResponse.json(construirDashboardData(sesiones, eventos))
}
