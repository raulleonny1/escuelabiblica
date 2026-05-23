import type { FirebaseOptions } from "firebase/app"

/** Solo para el servidor (layout). Lee variables en tiempo de ejecución en Vercel. */
function pickEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return ""
}

export function readFirebaseConfigFromEnv(): FirebaseOptions | null {
  const apiKey = pickEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "FIREBASE_API_KEY")
  const projectId = pickEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "FIREBASE_PROJECT_ID")
  if (!apiKey || !projectId) return null

  return {
    apiKey,
    authDomain: pickEnv(
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "FIREBASE_AUTH_DOMAIN"
    ),
    projectId,
    storageBucket: pickEnv(
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "FIREBASE_STORAGE_BUCKET"
    ),
    messagingSenderId: pickEnv(
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "FIREBASE_MESSAGING_SENDER_ID"
    ),
    appId: pickEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "FIREBASE_APP_ID"),
  }
}
