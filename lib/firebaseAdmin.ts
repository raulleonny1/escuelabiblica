import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminDb: Firestore | null = null

function initAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0]!

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (!raw) return null

  try {
    const serviceAccount = JSON.parse(raw) as ServiceAccount
    return initializeApp({
      credential: cert(serviceAccount),
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

export function adminFirestoreDisponible(): boolean {
  return getAdminDb() !== null
}
