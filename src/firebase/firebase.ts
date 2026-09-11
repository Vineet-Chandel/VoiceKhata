import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "voicekhata-23i23"
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyDevApiKeyForLocalhost39",
  authDomain: envAuthDomain || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:dummydevappid",
}

let app: any
let auth: any
let storage: any

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  storage = getStorage(app)
} catch (e) {
  console.warn("Firebase initialized in fallback dev mode:", e)
  app = {}
  auth = { currentUser: null, onAuthStateChanged: (_cb: any) => () => {} }
  storage = {}
}

export { auth, storage }
export default app