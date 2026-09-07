// src/firebase/auth.ts
import { auth } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth"

/**
 * Sign up with email & password
 * Optionally sets display name, sends verification email, and signs out so the user must verify first.
 */
export const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  if (displayName?.trim()) {
    try {
      await updateProfile(user, { displayName: displayName.trim() })
    } catch (e) {
      console.warn("Could not set display name during sign up:", e)
    }
  }

  try {
    await sendEmailVerification(user)
  } catch (e) {
    console.warn("Verification email send error:", e)
  }

  // Sign out immediately so unverified session is not held in local state
  await signOut(auth)

  return user
}

/**
 * Sign in with email & password.
 * Checks email verification and signs out immediately if unverified.
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  await user.reload()

  if (!user.emailVerified) {
    await signOut(auth)
    const err: any = new Error("Please verify your email before logging in.")
    err.code = "auth/email-not-verified"
    err.user = user
    throw err
  }

  return user
}

/**
 * Resend verification email to a given user or current user
 */
export const sendVerification = async (user?: User | null): Promise<void> => {
  const targetUser = user || auth.currentUser
  if (!targetUser) throw new Error("No user to send verification email to.")
  await sendEmailVerification(targetUser)
}

/**
 * Resend verification email by temporarily signing in using credentials
 */
export const resendVerificationEmailWithCredentials = async (email: string, password: string): Promise<void> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  await sendEmailVerification(user)
  await signOut(auth)
}

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!email || !email.trim()) throw new Error("Email is required.")
  await sendPasswordResetEmail(auth, email.trim())
}

/**
 * Google login with popup
 */
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  const result = await signInWithPopup(auth, provider)
  return result.user
}

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  await signOut(auth)
}

/**
 * Update display name
 */
export const updateUserName = async (name: string): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not logged in")
  await updateProfile(user, { displayName: name })
}

/**
 * Sync an avatar URL back to Firebase Auth's photoURL.
 */
export const updatePhotoURL = async (url: string): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not logged in")
  await updateProfile(user, { photoURL: url })
}

/**
 * Re-authenticate before sensitive operations (password change, delete)
 */
export const reauthenticate = async (currentPassword: string): Promise<void> => {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error("User not logged in")
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
}

/**
 * Change password
 */
export const changePassword = async (newPassword: string): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not logged in")
  await updatePassword(user, newPassword)
}

/**
 * Delete account
 */
export const deleteAccount = async (): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not logged in")
  await deleteUser(user)
}