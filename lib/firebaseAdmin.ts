import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getStorage, type Storage } from "firebase-admin/storage"
import { readFirebaseConfigFromEnv } from "@/lib/firebaseEnv"

let adminDb: Firestore | null = null
let adminStorage: Storage | null = null

function initAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0]!

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (!raw) return null

  try {
    const serviceAccount = JSON.parse(raw) as ServiceAccount
    const cfg = readFirebaseConfigFromEnv()
    return initializeApp({
      credential: cert(serviceAccount),
      storageBucket: cfg?.storageBucket || undefined,
    })
  } catch {
    return null
  }
}

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb
  const app = initAdminApp()
  if (!app) return null
  adminDb = getFirestore(app)
  return adminDb
}

export function getAdminStorage(): Storage | null {
  if (adminStorage) return adminStorage
  const app = initAdminApp()
  if (!app) return null
  adminStorage = getStorage(app)
  return adminStorage
}

export function adminFirestoreDisponible(): boolean {
  return getAdminDb() !== null
}

export function adminStorageDisponible(): boolean {
  return getAdminStorage() !== null
}
