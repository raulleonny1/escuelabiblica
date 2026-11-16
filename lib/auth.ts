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

/** UID de Firebase Auth si hay sesión real (no el fallback local). */
export function getFirebaseAuthUid(): string | null {
  if (!isFirebaseConfigured()) return null
  try {
    return authInstance().currentUser?.uid ?? null
  } catch {
    return null
  }
}

/** Sesión persistente en este dispositivo (Firebase anónimo o ID local si no hay Firebase). */
export function ensureUsuarioAuth(): Promise<string> {
  // Si ya hay usuario Firebase, siempre preferirlo (evita UID local cacheado sin auth).
  const authUid = getFirebaseAuthUid()
  if (authUid) {
    cachedUid = authUid
    return Promise.resolve(authUid)
  }
  if (cachedUid && !isFirebaseConfigured()) return Promise.resolve(cachedUid)

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
          // Sin auth de Firebase las reglas de analytics bloquean escrituras:
          // no cachear un UID local como si fuera válido para Firestore.
          console.warn("Auth anónimo no disponible; analytics puede fallar.", err)
          let id = safeLocalGet(LOCAL_UID_KEY)
          if (!id) {
            id = nuevoIdSesion()
            safeLocalSet(LOCAL_UID_KEY, id)
          }
          cachedUid = id
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
