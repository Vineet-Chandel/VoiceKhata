// src/firebase/user.ts
import { auth } from "./firebase"
import { onAuthStateChanged } from "firebase/auth"
import type { User } from "firebase/auth"
import { supabase, getScopedSupabase } from "@/lib/supabase"

// ─────────────────────────────────────────────
// Firebase helpers
// ─────────────────────────────────────────────

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      return resolve(auth.currentUser)
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export const getUserUID = async (): Promise<string | null> => {
  const user = await getCurrentUser()
  return user ? user.uid : null
}

// ─────────────────────────────────────────────
// Supabase profile helpers
// ─────────────────────────────────────────────

export type UserProfile = {
  firebase_uid:         string
  full_name:            string | null
  country:              string | null
  currency:             string | null
  monthly_income:       number | null
  income_source:        string | null
  savings_goal:         number | null
  financial_experience: string | null
  dob:                  string | null
  created_at:           string
  profile_pic:          string | null
}

/** Fetch the Supabase profile for the current or specified Firebase user */
export const getUserProfile = async (specificUid?: string | null): Promise<UserProfile | null> => {
  const uid = specificUid || (await getUserUID())
  if (!uid) return null

  // Ensure scoped supabase context
  await getScopedSupabase(uid)

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("firebase_uid", uid)
    .maybeSingle()

  if (error) {
    console.warn("getUserProfile notice:", error.message)
    return null
  }
  return data
}

/**
 * Ensure a user profile exists in Supabase for the authenticated user.
 * Attempts the upsert RPC, with fallback to direct table upsert.
 */
export const ensureUserProfile = async (
  uid: string,
  fullName?: string | null,
  email?: string | null
): Promise<UserProfile | null> => {
  if (!uid) return null
  await getScopedSupabase(uid)

  const nameToUse = fullName?.trim() || email?.split("@")[0] || "User"

  // 1. Try RPC upsert_user_profile
  try {
    const { error: rpcError } = await supabase.rpc("upsert_user_profile", {
      p_uid: uid,
      p_full_name: nameToUse,
    })
    if (!rpcError) {
      return await getUserProfile(uid)
    }
  } catch {
    // Fall back to direct upsert
  }

  // 2. Direct table upsert fallback
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        firebase_uid: uid,
        full_name: nameToUse,
      },
      { onConflict: "firebase_uid" }
    )
    .select()
    .maybeSingle()

  if (error) {
    console.warn("ensureUserProfile notice:", error.message)
  }

  return data
}

/** Update profile fields for the current Firebase user */
export const updateUserProfile = async (
  updates: Partial<Omit<UserProfile, "firebase_uid" | "created_at">>
): Promise<UserProfile | null> => {
  const uid = await getUserUID()
  if (!uid) throw new Error("User not logged in")

  await getScopedSupabase(uid)

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        firebase_uid: uid,
        ...updates,
      },
      { onConflict: "firebase_uid" }
    )
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}