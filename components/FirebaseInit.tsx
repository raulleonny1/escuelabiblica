"use client"

import type { FirebaseOptions } from "firebase/app"
import { setFirebaseRuntimeConfig } from "@/lib/firebase"

type Props = {
  config: FirebaseOptions | null
}

/** Inyecta la config de Firebase desde el servidor (Vercel lee env en cada petición). */
export default function FirebaseInit({ config }: Props) {
  setFirebaseRuntimeConfig(config)
  return null
}
