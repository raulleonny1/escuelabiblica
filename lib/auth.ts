import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  type Auth,
} from "firebase/auth"
import { getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase"
import { nuevoIdSesion, safeLocalGet, safeLocalSet } from "@/lib/storage"

const LOCAL_UID_KEY = "estudianteUsuarioId"

let cachedUid: string | null = null

export function getUsuarioId(): string | null {
  return cachedUid
}

function authInstance(): Auth {
  return getAuth(getFirebaseApp())
}

/** Sesión persistente en este dispositivo (Firebase anónimo o ID local si no hay Firebase). */
export function ensureUsuarioAuth(): Promise<string> {
  if (cachedUid) return Promise.resolve(cachedUid)

  if (!isFirebaseConfigured()) {
    let id = safeLocalGet(LOCAL_UID_KEY)
    if (!id) {
      id = nuevoIdSesion()
      safeLocalSet(LOCAL_UID_KEY, id)
    }
    cachedUid = id
    return Promise.resolve(id)
  }

  const auth = authInstance()

  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          cachedUid = user.uid
          unsub()
          resolve(user.uid)
          return
        }
        try {
          const cred = await signInAnonymously(auth)
          cachedUid = cred.user.uid
          unsub()
          resolve(cred.user.uid)
        } catch (err) {
          unsub()
          let id = safeLocalGet(LOCAL_UID_KEY)
          if (!id) {
            id = nuevoIdSesion()
            safeLocalSet(LOCAL_UID_KEY, id)
          }
          cachedUid = id
          console.warn("Auth anónimo no disponible; usando sesión local.", err)
          resolve(id)
        }
      },
      (err) => {
        unsub()
        reject(err)
      }
    )
  })
}
