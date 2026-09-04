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
  refreshProfile: () => Promise<void>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loggingOut: false,
  supabaseReady: false,
  refreshProfile: async () => {},
  logOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => auth.currentUser)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [supabaseReady, setSupabaseReady] = useState(false)

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
    })

    return () => unsubscribe()
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
