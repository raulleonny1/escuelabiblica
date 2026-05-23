import { initializeApp, getApps, type FirebaseOptions } from "firebase/app"
import { getFirestore } from "firebase/firestore"

function env(name: string): string {
  const value = process.env[name]
  if (!value?.trim()) {
    throw new Error(
      `Falta ${name}. Copia .env.example a .env.local y completa los valores de Firebase.`
    )
  }
  return value.trim()
}

const firebaseConfig: FirebaseOptions = {
  apiKey: env("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: env("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: env("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: env("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("NEXT_PUBLIC_FIREBASE_APP_ID"),
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
