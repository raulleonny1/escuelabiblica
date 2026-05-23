import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? ""
}

export function getFirebaseConfig(): FirebaseOptions | null {
  const apiKey = readEnv("NEXT_PUBLIC_FIREBASE_API_KEY")
  const projectId = readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID")
  if (!apiKey || !projectId) return null

  return {
    apiKey,
    authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId,
    storageBucket: readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  }
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null
}

let appInstance: FirebaseApp | undefined
let dbInstance: Firestore | undefined

export function getFirebaseApp(): FirebaseApp {
  const config = getFirebaseConfig()
  if (!config) {
    throw new Error(
      "Firebase no está configurado. Añade las variables NEXT_PUBLIC_FIREBASE_* en Vercel y vuelve a desplegar."
    )
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
