import type { CSSProperties } from "react"
import type { Viewport } from "next"
import { Lora, Source_Sans_3 } from "next/font/google"
import AppHeader from "@/components/AppHeader"
import { EstudioProvider } from "@/components/EstudioContext"
import { MenuNavegacionProvider, DrawerMenuLateral } from "@/components/MenuNavegacion"
import { AudioEstudioProvider } from "@/components/AudioEstudioProvider"
import LecturaAudioMiniBar from "@/components/LecturaAudioMiniBar"
import { SesionProvider } from "@/components/SesionProvider"
import FirebaseInit from "@/components/FirebaseInit"
import FontScaleInit from "@/components/FontScaleInit"
import TemaVisualInit from "@/components/TemaVisualInit"
import SintesisVozInit from "@/components/SintesisVozInit"
import { readFirebaseConfigFromEnv } from "@/lib/firebaseEnv"
import { getPaletaTema } from "@/lib/temaVisual"
import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata = {
  title: "Estudio diario",
  description: "Lección del trimestre | Estudio de la Palabra",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/loges.jpg", sizes: "512x512", type: "image/jpeg" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Estudio diario",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

/** Lee variables de entorno en cada visita (no cachear layout sin Firebase). */
export const dynamic = "force-dynamic"

export function generateViewport(): Viewport {
  const paleta = getPaletaTema()
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
    themeColor: paleta.primary,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const firebaseConfig = readFirebaseConfigFromEnv()
  const paleta = getPaletaTema()

  return (
    <html
      lang="es"
      data-font-scale="0"
      data-tema={paleta.id}
      className={`${lora.variable} ${sourceSans.variable}`}
      style={
        {
          ["--tema-primary" as string]: paleta.primary,
          ["--tema-primary-dark" as string]: paleta.primaryDark,
          ["--tema-primary-light" as string]: paleta.primaryLight,
          ["--tema-accent" as string]: paleta.accent,
          ["--tema-accent-soft" as string]: paleta.accentSoft,
          ["--tema-surface" as string]: paleta.surface,
          ["--tema-muted" as string]: paleta.muted,
          ["--tema-border" as string]: paleta.border,
          ["--tema-ink" as string]: paleta.ink,
          ["--tema-hub-card" as string]: paleta.hubCard,
          ["--tema-hub-inner" as string]: paleta.hubInner,
          ["--color-primary" as string]: paleta.primary,
          ["--color-primary-dark" as string]: paleta.primaryDark,
          ["--color-primary-light" as string]: paleta.primaryLight,
          ["--color-accent" as string]: paleta.accent,
          ["--color-accent-soft" as string]: paleta.accentSoft,
          ["--color-surface" as string]: paleta.surface,
          ["--color-muted" as string]: paleta.muted,
          ["--color-border" as string]: paleta.border,
          ["--color-ink" as string]: paleta.ink,
          ["--color-hub-card" as string]: paleta.hubCard,
          ["--color-hub-inner" as string]: paleta.hubInner,
        } as CSSProperties
      }
    >
      <body className="m-0 p-0 antialiased">
        <FirebaseInit config={firebaseConfig} />
        <FontScaleInit />
        <TemaVisualInit />
        <SintesisVozInit />
        <EstudioProvider>
          <SesionProvider>
            <MenuNavegacionProvider>
              <AudioEstudioProvider>
                <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
                  <AppHeader />
                  <DrawerMenuLateral />

                  <main
                    className="flex min-h-0 flex-1 overflow-hidden bg-surface p-0 lg:p-4"
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                  >
                    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-col overflow-hidden bg-card lg:rounded-2xl lg:border lg:border-border lg:shadow-xl">
                      {children}
                    </div>
                  </main>
                </div>
                <LecturaAudioMiniBar />
              </AudioEstudioProvider>
            </MenuNavegacionProvider>
          </SesionProvider>
        </EstudioProvider>
      </body>
    </html>
  )
}
