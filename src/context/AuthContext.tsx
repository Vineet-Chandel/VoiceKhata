// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "@/firebase/firebase"
import {
  clearScopedSupabase,
  getScopedSupabase,
  startSupabaseKeepAlive,
} from "@/lib/supabase"
import { ensureUserProfile, getUserProfile, type UserProfile } from "@/firebase/user"

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  loggingOut: boolean
  supabaseReady: boolean
  isDemoMode: boolean
  enableDemoMode: () => void
  refreshProfile: () => Promise<void>
  logOut: () => Promise<void>
}

const DEMO_USER: any = {
  uid: "demo-shopkeeper-uid",
  email: "sharma.store@voicekhata.in",
  displayName: "Sharma Kirana Store",
  emailVerified: true,
  isAnonymous: true,
  providerData: [{ providerId: "password" }],
}

const DEMO_PROFILE: UserProfile = {
  firebase_uid: "demo-shopkeeper-uid",
  business_name: "Sharma Kirana Store",
  email: "sharma.store@voicekhata.in",
  display_name: "Sharma Kirana Store",
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loggingOut: false,
  supabaseReady: false,
  isDemoMode: false,
  enableDemoMode: () => {},
  refreshProfile: async () => {},
  logOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    try {
      return (
        typeof window !== "undefined" &&
        (localStorage.getItem("voicekhata_demo_user") === "true" ||
          new URLSearchParams(window.location.search).get("demo") === "true")
      )
    } catch {
      return false
    }
  })

  const [user, setUser] = useState<User | null>(() => {
    if (auth.currentUser) return auth.currentUser
    if (typeof window !== "undefined" && (localStorage.getItem("voicekhata_demo_user") === "true" || new URLSearchParams(window.location.search).get("demo") === "true")) {
      return DEMO_USER
    }
    return null
  })

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined" && (localStorage.getItem("voicekhata_demo_user") === "true" || new URLSearchParams(window.location.search).get("demo") === "true")) {
      return DEMO_PROFILE
    }
    return null
  })

  const [loading, setLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [supabaseReady, setSupabaseReady] = useState(() => isDemo)

  const enableDemoMode = useCallback(() => {
    try {
      localStorage.setItem("voicekhata_demo_user", "true")
    } catch {}
    setIsDemo(true)
    setUser(DEMO_USER)
    setProfile(DEMO_PROFILE)
    setSupabaseReady(true)
    setLoading(false)
  }, [])

  const syncUserData = useCallback(async (firebaseUser: User) => {
    try {
      startSupabaseKeepAlive()
      await getScopedSupabase(firebaseUser.uid, { force: true })

      // Sync or create user profile in Supabase
      const userProf = await ensureUserProfile(
        firebaseUser.uid,
        firebaseUser.displayName,
        firebaseUser.email
      )
      setProfile(userProf)
      setSupabaseReady(true)
    } catch (err) {
      console.warn("Notice during Supabase sync:", err)
      // Keep app responsive
      setSupabaseReady(true)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return
    const prof = await getUserProfile(auth.currentUser.uid)
    if (prof) setProfile(prof)
  }, [])

  useEffect(() => {
    let unsubscribe = () => {}
    try {
      if (auth && typeof onAuthStateChanged === "function") {
        unsubscribe = onAuthStateChanged(
          auth,
          async (firebaseUser) => {
            if (firebaseUser) {
              setUser(firebaseUser)
              setSupabaseReady(false)
              await syncUserData(firebaseUser)
            } else {
              clearScopedSupabase()
              setUser(null)
              setProfile(null)
              setSupabaseReady(false)
            }

            setLoading(false)
            setLoggingOut(false)
          },
          (error) => {
            console.warn("Auth state observer error:", error)
            setLoading(false)
            setLoggingOut(false)
          }
        )
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.warn("Auth initialization error caught:", err)
      setLoading(false)
    }

    return () => {
      try {
        unsubscribe()
      } catch (e) {}
    }
  }, [syncUserData])

  const logOut = async () => {
    setLoggingOut(true)
    setSupabaseReady(false)
    try {
      try {
        localStorage.removeItem("voicekhata_demo_user")
      } catch {}
      setIsDemo(false)
      clearScopedSupabase()
      await signOut(auth)
      setUser(null)
      setProfile(null)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loggingOut,
        supabaseReady,
        isDemoMode: isDemo,
        enableDemoMode,
        refreshProfile,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
