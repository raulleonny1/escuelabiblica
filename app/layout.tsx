import type { Viewport } from "next"
import { Lora, Source_Sans_3 } from "next/font/google"
import AppHeader from "@/components/AppHeader"
import { EstudioProvider } from "@/components/EstudioContext"
import FirebaseInit from "@/components/FirebaseInit"
import FontScaleInit from "@/components/FontScaleInit"
import PwaInstallPrompt from "@/components/PwaInstallPrompt"
import { readFirebaseConfigFromEnv } from "@/lib/firebaseEnv"
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
  title: "Escuela Bíblica",
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
    title: "Escuela Bíblica",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

/** Lee variables de entorno en cada visita (no cachear layout sin Firebase). */
export const dynamic = "force-dynamic"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const firebaseConfig = readFirebaseConfigFromEnv()

  return (
    <html lang="es" data-font-scale="0" className={`${lora.variable} ${sourceSans.variable}`}>
      <body className="m-0 p-0 antialiased">
        <FirebaseInit config={firebaseConfig} />
        <FontScaleInit />
        <EstudioProvider>
          <div className="flex h-dvh flex-col overflow-hidden">
            <AppHeader />

            <main className="flex min-h-0 flex-1 overflow-hidden bg-surface p-0 lg:p-4">
              <div className="flex h-full min-h-0 w-full max-w-[1800px] mx-auto overflow-hidden bg-card lg:rounded-2xl lg:border lg:border-border lg:shadow-xl">
                {children}
              </div>
            </main>
          </div>
        </EstudioProvider>
        <PwaInstallPrompt />
      </body>
    </html>
  )
}
