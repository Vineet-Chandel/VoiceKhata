// src/firebase/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { auth } from "./firebase"

const storage = getStorage()

export async function uploadAvatar(file: File): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error("User not logged in")

  // Unique path per user — overwrites previous avatar automatically
  const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`)

  // Upload
  const snapshot = await uploadBytes(storageRef, file)

  // Get public URL
  const url = await getDownloadURL(snapshot.ref)

  // Save to Firebase Auth profile so it persists across reloads
  await updateProfile(user, { photoURL: url })

  return url
}