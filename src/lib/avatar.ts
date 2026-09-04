// src/lib/avatar.ts
//
// Avatar upload → Supabase Storage
//
// File path: avatars/{firebaseUid}/avatar.{ext}
//
// Why a STABLE path (no Date.now())?
//   → Supabase upsert (overwrite: true) replaces the same file in-place.
//   → No orphaned files accumulate in the bucket.
//   → We always know exactly where to find the avatar: avatars/{uid}/avatar.*
//
// Flow:
//   uploadProfilePic()
//     1. Upload to Supabase Storage  (stable path, overwrite)
//     2. Return cache-busted public URL
//   Then the CALLER writes that URL to:
//     - user_profiles.profile_pic  (Supabase DB)
//     - Firebase Auth photoURL     (so user.photoURL stays in sync)

import { supabase } from "@/lib/supabase"
import { getUserUID } from "@/firebase/user"

const BUCKET = "avatars"

const ALLOWED_TYPES   = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_SIZE_BYTES  = 2 * 1024 * 1024 // 2 MB

// ── Upload ────────────────────────────────────────────────────────────────────
export async function uploadProfilePic(file: File): Promise<string> {
  // Client-side validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, GIF, or WebP files are allowed.")
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("File too large. Maximum size is 2 MB.")
  }

  const uid = await getUserUID()
  if (!uid) throw new Error("User not logged in")

  // Derive extension from MIME type for reliability
  const ext      = file.type.split("/")[1].replace("jpeg", "jpg")
  const filePath = `${uid}/avatar.${ext}` // stable — always the same path

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert      : true,       // overwrite existing file
      contentType : file.type,
      cacheControl: "3600",
    })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  return getAvatarPublicUrl(uid, ext)
}

// ── Public URL ────────────────────────────────────────────────────────────────
/**
 * Returns the public URL for a user's avatar.
 * Adds a cache-bust query param so browsers always show the latest version.
 */
export function getAvatarPublicUrl(uid: string, ext = "jpg"): string {
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(`${uid}/avatar.${ext}`)

  return `${data.publicUrl}?t=${Date.now()}`
}

// ── Check existence ───────────────────────────────────────────────────────────
/**
 * Returns true if the user has ever uploaded a custom avatar to Supabase.
 * Uses a lightweight list() call — no file download.
 */
export async function hasCustomAvatar(uid: string): Promise<boolean> {
  const { data } = await supabase.storage
    .from(BUCKET)
    .list(uid, { limit: 1, search: "avatar" })

  return Array.isArray(data) && data.length > 0
}