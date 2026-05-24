import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function ipDesdeRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]?.trim() || "—"
  const real = req.headers.get("x-real-ip")
  if (real) return real.trim()
  return "—"
}

export async function GET(req: Request) {
  const ip = ipDesdeRequest(req)
  let ciudad = "Desconocida"
  let region = ""
  let pais = ""

  if (ip && ip !== "—" && !ip.startsWith("127.") && ip !== "::1") {
    try {
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country`,
        { cache: "no-store", signal: AbortSignal.timeout(4000) }
      )
      const data = (await res.json()) as {
        status?: string
        city?: string
        regionName?: string
        country?: string
      }
      if (data.status === "success") {
        ciudad = [data.city, data.regionName, data.country].filter(Boolean).join(", ")
        region = data.regionName ?? ""
        pais = data.country ?? ""
      }
    } catch {
      // mantener Desconocida
    }
  }

  return NextResponse.json({ ip, ciudad, region, pais })
}
