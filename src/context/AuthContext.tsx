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
  const [user, setUser] = useState<User | null>(() => auth.currentUser)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [supabaseReady, setSupabaseReady] = useState(false)

  // Clean any old demo state from browser storage
  useEffect(() => {
    try {
      localStorage.removeItem("voicekhata_demo_user")
      localStorage.removeItem("voicekhata_demo_txs")
    } catch {}
  }, [])

  const syncUserData = useCallback(async (firebaseUser: User) => {
    try {
      startSupabaseKeepAlive()
      await getScopedSupabase(firebaseUser.uid, { force: true })

      try {
        await ensureUserProfile({
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        })
      } catch (err) {
        console.warn("Could not ensure profile:", err)
      }

      try {
        const p = await getUserProfile()
        setProfile(p)
      } catch (err) {
        console.warn("Could not fetch profile:", err)
      }

      setSupabaseReady(true)
    } catch (err) {
      console.warn("Scoped Supabase client failed:", err)
      setSupabaseReady(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    try {
      const p = await getUserProfile()
      setProfile(p)
    } catch (err) {
      console.warn("Failed to refresh profile:", err)
    }
  }, [user])

  useEffect(() => {
    let unsubscribe = () => {}

    try {
      if (auth && typeof onAuthStateChanged === "function") {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser)

          if (firebaseUser) {
            await syncUserData(firebaseUser)
          } else {
            clearScopedSupabase()
            setProfile(null)
            setSupabaseReady(false)
          }

          setLoading(false)
        })
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
        isDemoMode: false,
        enableDemoMode: () => {},
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
