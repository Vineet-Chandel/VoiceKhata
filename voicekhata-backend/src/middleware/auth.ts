import { Request, Response, NextFunction } from "express"
import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import dotenv from "dotenv"

dotenv.config()

let firebaseApp: App | undefined

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      })
      console.log("✅ [Firebase Admin] Initialized with FIREBASE_SERVICE_ACCOUNT_KEY")
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      })
      console.log("✅ [Firebase Admin] Initialized with individual credentials")
    } else {
      firebaseApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "voicekhata-23i23",
      })
      console.log("ℹ️ [Firebase Admin] Initialized with project ID:", process.env.FIREBASE_PROJECT_ID || "voicekhata-23i23")
    }
  } catch (err: any) {
    console.error("❌ [Firebase Admin] Initialization error:", err.message)
  }
} else {
  firebaseApp = getApps()[0]
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string
    email?: string
    name?: string
  }
}

export async function requireFirebaseAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized: Missing or malformed Authorization header (Bearer token required)",
      code: "AUTH_MISSING_TOKEN",
    })
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim()

  if (!idToken) {
    return res.status(401).json({
      error: "Unauthorized: Empty Bearer token",
      code: "AUTH_EMPTY_TOKEN",
    })
  }

  try {
    const auth = getAuth(firebaseApp)
    const decodedToken = await auth.verifyIdToken(idToken)
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    }
    return next()
  } catch (err: any) {
    console.error("[Auth Middleware] Firebase ID Token verification failed:", err.message)
    return res.status(401).json({
      error: "Unauthorized: Invalid or expired Firebase ID token",
      code: "AUTH_INVALID_TOKEN",
      details: err.message,
    })
  }
}
