"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import HojaDominicalBoton from "@/components/HojaDominicalBoton"
import PedidoOracionBoton from "@/components/PedidoOracionBoton"
import { useEstudio } from "@/components/EstudioContext"

export type PanelMenu = "biblia" | "notas" | "chat" | "configuracion"

type MenuNavegacionContextValue = {
  menuAbierto: boolean
  abrirMenu: () => void
  cerrarMenu: () => void
  panel: PanelMenu | null
  abrirPanel: (panel: PanelMenu) => void
  cerrarPanel: () => void
  irAInicio: () => void
  chatNoLeidos: number
  setChatNoLeidos: (n: number) => void
  pedidoSinLeer: number
  setPedidoSinLeer: (n: number) => void
  abrirHojaDominical: () => void
  abrirPedidoOracion: () => void
}

const MenuNavegacionContext = createContext<MenuNavegacionContextValue | null>(null)

export function MenuNavegacionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [panel, setPanel] = useState<PanelMenu | null>(null)
  const [chatNoLeidos, setChatNoLeidos] = useState(0)
  const [pedidoSinLeer, setPedidoSinLeer] = useState(0)
  const [hojaAbierta, setHojaAbierta] = useState(false)
  const [pedidoAbierto, setPedidoAbierto] = useState(false)

  const abrirMenu = useCallback(() => setMenuAbierto(true), [])
  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])
  const cerrarPanel = useCallback(() => setPanel(null), [])

  const abrirPanel = useCallback(
    (p: PanelMenu) => {
      setPanel(p)
      setMenuAbierto(false)
      if (pathname !== "/") {
        router.push("/")
      }
    },
    [pathname, router]
  )

  const irAInicio = useCallback(() => {
    setPanel(null)
    setMenuAbierto(false)
    if (pathname !== "/") {
      router.push("/")
    }
  }, [pathname, router])

  const abrirHojaDominical = useCallback(() => {
    setMenuAbierto(false)
    setHojaAbierta(true)
  }, [])

  const abrirPedidoOracion = useCallback(() => {
    setMenuAbierto(false)
    setPedidoAbierto(true)
  }, [])

  const value = useMemo(
    () => ({
      menuAbierto,
      abrirMenu,
      cerrarMenu,
      panel,
      abrirPanel,
      cerrarPanel,
      irAInicio,
      chatNoLeidos,
      setChatNoLeidos,
      pedidoSinLeer,
      setPedidoSinLeer,
      abrirHojaDominical,
      abrirPedidoOracion,
    }),
    [
      menuAbierto,
      abrirMenu,
      cerrarMenu,
      panel,
      abrirPanel,
      cerrarPanel,
      irAInicio,
      chatNoLeidos,
      pedidoSinLeer,
      abrirHojaDominical,
      abrirPedidoOracion,
    ]
  )

  return (
    <MenuNavegacionContext.Provider value={value}>
      {children}
      <ModalesMenuGlobales
        hojaAbierta={hojaAbierta}
        pedidoAbierto={pedidoAbierto}
        onCerrarHoja={() => setHojaAbierta(false)}
        onCerrarPedido={() => setPedidoAbierto(false)}
      />
    </MenuNavegacionContext.Provider>
  )
}

function ModalesMenuGlobales({
  hojaAbierta,
  pedidoAbierto,
  onCerrarHoja,
  onCerrarPedido,
}: {
  hojaAbierta: boolean
  pedidoAbierto: boolean
  onCerrarHoja: () => void
  onCerrarPedido: () => void
}) {
  const { estudio } = useEstudio()
  const semana = estudio?.semana ?? 1
  const { setPedidoSinLeer } = useMenuNavegacion()

  return (
    <>
      <HojaDominicalBoton
        semana={semana}
        abierto={hojaAbierta}
        onAbiertoChange={(v) => {
          if (!v) onCerrarHoja()
        }}
        ocultarBoton
      />
      <PedidoOracionBoton
        abierto={pedidoAbierto}
        onAbiertoChange={(v) => {
          if (!v) onCerrarPedido()
        }}
        onSinLeerChange={setPedidoSinLeer}
        ocultarBoton
      />
    </>
  )
}

export function useMenuNavegacion() {
  const ctx = useContext(MenuNavegacionContext)
  if (!ctx) {
    throw new Error("useMenuNavegacion debe usarse dentro de MenuNavegacionProvider")
  }
  return ctx
}

const FACEBOOK_IGLESIA = "https://www.facebook.com/elbuenpastoriere"

const ITEMS: { id: PanelMenu; label: string; icon: string }[] = [
  { id: "biblia", label: "Biblia", icon: "📖" },
  { id: "notas", label: "Notas", icon: "📝" },
  { id: "chat", label: "Chat", icon: "💬" },
]

export function BotonMenuHamburguesa() {
  const { abrirMenu, chatNoLeidos } = useMenuNavegacion()

  return (
    <button
      type="button"
      onClick={abrirMenu}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/15 active:bg-white/25"
      aria-label="Abrir menú"
    >
      <span className="flex flex-col gap-[5px]" aria-hidden>
        <span className="block h-0.5 w-5 rounded-full bg-white" />
        <span className="block h-0.5 w-5 rounded-full bg-white" />
        <span className="block h-0.5 w-5 rounded-full bg-white" />
      </span>
      {chatNoLeidos > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.625rem] font-bold leading-none text-white">
          {chatNoLeidos > 9 ? "9+" : chatNoLeidos}
        </span>
      )}
    </button>
  )
}

export function DrawerMenuLateral() {
  const {
    menuAbierto,
    cerrarMenu,
    abrirPanel,
    irAInicio,
    chatNoLeidos,
    pedidoSinLeer,
    abrirHojaDominical,
    abrirPedidoOracion,
  } = useMenuNavegacion()

  useEffect(() => {
    if (!menuAbierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuAbierto])

  if (!menuAbierto) return null

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menú">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45"
        aria-label="Cerrar menú"
        onClick={cerrarMenu}
      />
      <aside
        className="absolute left-0 top-0 flex h-full w-[min(19rem,88vw)] max-w-sm flex-col bg-card shadow-2xl sm:w-80"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
        }}
      >
        <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-white">
          <p className="font-display text-base font-semibold">Menú</p>
          <button
            type="button"
            onClick={cerrarMenu}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl leading-none hover:bg-white/25"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3 [-webkit-overflow-scrolling:touch]"
          aria-label="Secciones"
        >
          <button
            type="button"
            onClick={irAInicio}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-800 transition hover:bg-primary/8 active:bg-primary/12"
          >
            <span className="text-xl" aria-hidden>
              🏠
            </span>
            Inicio / Lección
          </button>

          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => abrirPanel(item.id)}
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-800 transition hover:bg-primary/8 active:bg-primary/12"
            >
              <span className="relative text-xl" aria-hidden>
                {item.icon}
                {item.id === "chat" && chatNoLeidos > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.625rem] font-bold text-white">
                    {chatNoLeidos > 9 ? "9+" : chatNoLeidos}
                  </span>
                )}
              </span>
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={abrirHojaDominical}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-800 transition hover:bg-primary/8 active:bg-primary/12"
          >
            <span className="text-xl" aria-hidden>
              📄
            </span>
            Hoja dominical
          </button>

          <button
            type="button"
            onClick={abrirPedidoOracion}
            className="relative flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-800 transition hover:bg-primary/8 active:bg-primary/12"
          >
            <span className="relative text-xl" aria-hidden>
              🙏
              {pedidoSinLeer > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-white">
                  {pedidoSinLeer > 9 ? "9+" : pedidoSinLeer}
                </span>
              )}
            </span>
            Pedido de oración
          </button>

          <a
            href={FACEBOOK_IGLESIA}
            target="_blank"
            rel="noopener noreferrer"
            onClick={cerrarMenu}
            className="mt-1 flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-slate-800 transition hover:bg-primary/8 active:bg-primary/12"
          >
            <span className="text-xl" aria-hidden>
              📘
            </span>
            Facebook
          </a>

          <button
            type="button"
            onClick={() => abrirPanel("configuracion")}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-800 transition hover:bg-primary/8 active:bg-primary/12"
          >
            <span className="text-xl" aria-hidden>
              ⚙️
            </span>
            Configuración
          </button>
        </nav>

        <p className="border-t border-border px-4 py-3 text-xs text-muted">
          Iglesia El Buen Pastor · IERE
        </p>
      </aside>
    </div>
  )
}
