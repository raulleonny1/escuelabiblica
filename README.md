# Escuela Bíblica

App Next.js (PWA) para lecciones del trimestre, notas, biblia RVR1909 y chat en línea. Datos en Firebase Firestore.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
# Completa .env.local con los valores de Firebase Console
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno (Firebase)

Obtén los valores en [Firebase Console](https://console.firebase.google.com/) → tu proyecto → **Project settings** → **Your apps** → configuración del SDK web.

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | projectId |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | appId |

En **Vercel**: Settings → Environment Variables → añade las mismas variables para Production (y Preview si quieres).

## Si GitHub alertó por una API key expuesta

1. **Este repo ya no debe llevar claves en el código** — solo en `.env.local` / Vercel.
2. **Rota la clave** (la del primer commit sigue en el historial de Git):
   - [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials**
   - Localiza la API key del proyecto `escuelabiblica-a1177` → **Regenerate key** o crea una nueva y borra la antigua.
   - Actualiza `NEXT_PUBLIC_FIREBASE_API_KEY` en `.env.local` y en Vercel.
3. **Restringe la clave**: en la misma pantalla, limita por **HTTP referrers** (`localhost:3000`, `*.vercel.app`, tu dominio).
4. En Firebase → **Firestore** → publica las reglas de `firestore.rules` si aún no lo hiciste.

> La API key de Firebase en apps web no es un secreto de servidor (va en el navegador), pero no debe estar en Git; la restricción por dominio es lo que protege el abuso.

## Despliegue en Vercel

Importa el repo desde GitHub. Framework: **Next.js**. Añade las variables `NEXT_PUBLIC_FIREBASE_*` antes del deploy.

## Estructura breve

- `lib/lecciones/` — contenido de las 13 semanas
- `lib/anotaciones.ts`, `lib/comentarios.ts` — Firestore
- `public/portada.png` — portada del trimestre
- `firestore.rules` — reglas de seguridad
