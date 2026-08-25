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

export type PanelMenu = "biblia" | "notas" | "chat"

type MenuNavegacionContextValue = {
  menuAbierto: boolean
  abrirMenu: () => void
  cerrarMenu: () => void
  panel: PanelMenu | null
  abrirPanel: (panel: PanelMenu) => void
  cerrarPanel: () => void
  chatNoLeidos: number
  setChatNoLeidos: (n: number) => void
}

const MenuNavegacionContext = createContext<MenuNavegacionContextValue | null>(null)

export function MenuNavegacionProvider({ children }: { children: ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [panel, setPanel] = useState<PanelMenu | null>(null)
  const [chatNoLeidos, setChatNoLeidos] = useState(0)

  const abrirMenu = useCallback(() => setMenuAbierto(true), [])
  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])
  const abrirPanel = useCallback((p: PanelMenu) => {
    setPanel(p)
    setMenuAbierto(false)
  }, [])
  const cerrarPanel = useCallback(() => setPanel(null), [])

  const value = useMemo(
    () => ({
      menuAbierto,
      abrirMenu,
      cerrarMenu,
      panel,
      abrirPanel,
      cerrarPanel,
      chatNoLeidos,
      setChatNoLeidos,
    }),
    [
      menuAbierto,
      abrirMenu,
      cerrarMenu,
      panel,
      abrirPanel,
      cerrarPanel,
      chatNoLeidos,
    ]
  )

  return (
    <MenuNavegacionContext.Provider value={value}>{children}</MenuNavegacionContext.Provider>
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
  const { menuAbierto, cerrarMenu, abrirPanel, chatNoLeidos } = useMenuNavegacion()

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
        </nav>

        <p className="border-t border-border px-4 py-3 text-xs text-muted">
          Iglesia El Buen Pastor · IERE
        </p>
      </aside>
    </div>
  )
}
