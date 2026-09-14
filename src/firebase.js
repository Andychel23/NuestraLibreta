// Configuración de Firebase — los valores vienen de variables de entorno (.env)
// Ver README.md para cómo obtenerlos desde la consola de Firebase.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k)
if (missing.length) {
  // eslint-disable-next-line no-console
  console.warn(
    `[Firebase] Faltan variables de entorno: ${missing.join(', ')}. ` +
    `Copia .env.example a .env y completa los valores de tu proyecto de Firebase.`
  )
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Nombre de la "libreta" compartida — permite, si algún día quieren, tener varias
// libretas distintas en el mismo proyecto de Firebase cambiando este valor.
export const LIBRETA_ID = import.meta.env.VITE_LIBRETA_ID || 'andy-marjorie'
