import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBxPLXykDiCUwKEEM5kijhf0ntoZEquwI4",
  authDomain: "escuelabiblica-a1177.firebaseapp.com",
  projectId: "escuelabiblica-a1177",
  storageBucket: "escuelabiblica-a1177.firebasestorage.app",
  messagingSenderId: "790642850953",
  appId: "1:790642850953:web:5ce85e91ad71bc003dda58",
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
