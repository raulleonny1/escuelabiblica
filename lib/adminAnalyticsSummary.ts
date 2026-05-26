export type SesionRow = {
  sessionId: string
  usuarioId: string
  nombre: string
  ip: string
  ciudad: string
  region: string
  pais: string
  dispositivo: string
  inicioEn: string | null
  ultimoAcceso: string | null
  tiempoTotalSeg: number
  ultimaRuta: string
  activo: boolean
}

export type EventoRow = {
  id: string
  sessionId: string
  usuarioId: string
  nombre: string
  tipo: string
  destino: string
  duracionSeg: number
  createdAt: string | null
}

export type ResumenUsuario = {
  usuarioId: string
  nombre: string
  sesiones: number
  tiempoTotalSeg: number
  ultimaCiudad: string
  ultimaIp: string
  ultimoAcceso: string | null
  eventos: EventoRow[]
}

export type ResumenDia = {
  fecha: string
  totalSesiones: number
  totalEventos: number
  totalUsuarios: number
  ingresosConNombre: number
  ipsUnicas: number
  ciudadesUnicas: number
  tiempoTotalSeg: number
  resumen: ResumenUsuario[]
}

export type DashboardData = {
  generadoEn: string
  totalSesiones: number
  totalEventos: number
  totalUsuarios: number
  sesiones: SesionRow[]
  eventos: EventoRow[]
  resumen: ResumenUsuario[]
  porDia: ResumenDia[]
}

function diaDesdeIso(iso: string | null): string | null {
  if (!iso) return null
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(iso)
  return m ? m[1] : null
}

function construirResumenUsuarios(sesiones: SesionRow[], eventos: EventoRow[]): ResumenUsuario[] {
  const porUsuario = new Map<string, ResumenUsuario>()

  for (const s of sesiones) {
    const key = s.usuarioId || s.sessionId
    const prev = porUsuario.get(key) ?? {
      usuarioId: s.usuarioId,
      nombre: s.nombre,
      sesiones: 0,
      tiempoTotalSeg: 0,
      ultimaCiudad: s.ciudad,
      ultimaIp: s.ip,
      ultimoAcceso: s.ultimoAcceso,
      eventos: [],
    }
    prev.sesiones += 1
    prev.tiempoTotalSeg += s.tiempoTotalSeg
    if (s.nombre) prev.nombre = s.nombre
    if (s.ultimoAcceso && (!prev.ultimoAcceso || s.ultimoAcceso > prev.ultimoAcceso)) {
      prev.ultimoAcceso = s.ultimoAcceso
      prev.ultimaCiudad = s.ciudad
      prev.ultimaIp = s.ip
    }
    porUsuario.set(key, prev)
  }

  for (const e of eventos) {
    const key = e.usuarioId || e.sessionId || e.id
    const u = porUsuario.get(key)
    if (u) {
      u.eventos.push(e)
      continue
    }
    porUsuario.set(key, {
      usuarioId: e.usuarioId,
      nombre: e.nombre,
      sesiones: 0,
      tiempoTotalSeg: 0,
      ultimaCiudad: "",
      ultimaIp: "",
      ultimoAcceso: e.createdAt,
      eventos: [e],
    })
  }

  return [...porUsuario.values()].sort((a, b) => (b.ultimoAcceso ?? "").localeCompare(a.ultimoAcceso ?? ""))
}

export function construirDashboardData(sesiones: SesionRow[], eventos: EventoRow[]): DashboardData {
  const resumenGeneral = construirResumenUsuarios(sesiones, eventos)
  const porDiaMap = new Map<
    string,
    {
      sesiones: SesionRow[]
      eventos: EventoRow[]
    }
  >()

  for (const s of sesiones) {
    const dia = diaDesdeIso(s.inicioEn) ?? diaDesdeIso(s.ultimoAcceso)
    if (!dia) continue
    const prev = porDiaMap.get(dia) ?? { sesiones: [], eventos: [] }
    prev.sesiones.push(s)
    porDiaMap.set(dia, prev)
  }

  for (const e of eventos) {
    const dia = diaDesdeIso(e.createdAt)
    if (!dia) continue
    const prev = porDiaMap.get(dia) ?? { sesiones: [], eventos: [] }
    prev.eventos.push(e)
    porDiaMap.set(dia, prev)
  }

  const porDia: ResumenDia[] = [...porDiaMap.entries()]
    .map(([fecha, bloque]) => {
      const resumen = construirResumenUsuarios(bloque.sesiones, bloque.eventos)
      const ipsUnicas = new Set(bloque.sesiones.map((s) => s.ip).filter(Boolean)).size
      const ciudadesUnicas = new Set(bloque.sesiones.map((s) => s.ciudad).filter(Boolean)).size
      const ingresosConNombre = bloque.sesiones.filter((s) => Boolean(s.nombre.trim())).length
      const tiempoTotalSeg = bloque.sesiones.reduce((acc, s) => acc + (s.tiempoTotalSeg || 0), 0)
      return {
        fecha,
        totalSesiones: bloque.sesiones.length,
        totalEventos: bloque.eventos.length,
        totalUsuarios: resumen.length,
        ingresosConNombre,
        ipsUnicas,
        ciudadesUnicas,
        tiempoTotalSeg,
        resumen,
      }
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  return {
    generadoEn: new Date().toISOString(),
    totalSesiones: sesiones.length,
    totalEventos: eventos.length,
    totalUsuarios: resumenGeneral.length,
    sesiones,
    eventos,
    resumen: resumenGeneral,
    porDia,
  }
}
