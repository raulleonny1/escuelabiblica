import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"

/** Config inyectada desde el layout (servidor → cliente). Evita depender solo del build. */
let runtimeConfig: FirebaseOptions | null = null

export function setFirebaseRuntimeConfig(config: FirebaseOptions | null) {
  const prev = JSON.stringify(runtimeConfig)
  const next = JSON.stringify(config)
  if (prev === next) return
  runtimeConfig = config
  appInstance = undefined
  dbInstance = undefined
}

export function getFirebaseConfig(): FirebaseOptions | null {
  if (runtimeConfig?.apiKey && runtimeConfig?.projectId) {
    return runtimeConfig
  }
  return null
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null
}

/** Mensaje claro para la UI cuando Firebase no responde */
export function mensajeErrorFirebase(error: Error): string {
  if (error.message === "VERCEL_ENV_MISSING" || error.message.includes("no configurado")) {
    return (
      "Variables de Firebase no detectadas. En Vercel → Settings → Environment Variables " +
      "añade las 6 variables NEXT_PUBLIC_FIREBASE_* (las 3 casillas: Production, Preview, Development) " +
      "y pulsa Redeploy. Si ya las tienes, revisa que el nombre no tenga espacios ni comillas."
    )
  }
  if (error.message.includes("permission-denied") || error.message.includes("Permission")) {
    return (
      "Firestore rechazó la conexión (permisos). Publica firestore.rules en Firebase Console " +
      "y revisa que el proyecto sea escuelabiblica-a1177."
    )
  }
  if (esErrorIndiceFirestore(error)) {
    return (
      "Firestore está creando los índices (suele tardar 1–3 min). La app sigue funcionando; " +
      "si el aviso continúa, en Firebase Console → Firestore → Índices comprueba que estén en verde."
    )
  }
  return `Sin conexión a Firebase: ${error.message}. Usando datos guardados en este dispositivo.`
}

export function esErrorIndiceFirestore(error: Error): boolean {
  const msg = error.message ?? ""
  return msg.includes("requires an index") || msg.includes("FAILED_PRECONDITION")
}

let appInstance: FirebaseApp | undefined
let dbInstance: Firestore | undefined

export function getFirebaseApp(): FirebaseApp {
  const config = getFirebaseConfig()
  if (!config) {
    throw new Error("VERCEL_ENV_MISSING")
  }
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApps()[0]! : initializeApp(config)
  }
  return appInstance
}

export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseApp())
  }
  return dbInstance
}
