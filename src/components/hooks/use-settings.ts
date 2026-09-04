"use client"

import * as React from "react"
import { useAuth } from "@/components/hooks/use-auth"
import {
    updateUserName,
    updatePhotoURL,
    deleteAccount,
    logout,
    changePassword,
    reauthenticate,
} from "@/firebase/auth"
import { supabase } from "@/lib/supabase"
import { updateUserProfile, getUserProfile } from "@/firebase/user"
import { uploadProfilePic } from "@/lib/avatar"
import { avatarEvents } from "@/lib/avatarEvents"

export type StatusMsg = { type: "success" | "error"; text: string } | null

export type ProfileForm = {
    full_name: string
    country: string
    currency: string
    dob: string
    monthly_income: string
    income_source: string
    savings_goal: string
    financial_experience: string
}

export const DEFAULT_FORM: ProfileForm = {
    full_name: "",
    country: "India",
    currency: "INR",
    dob: "",
    monthly_income: "",
    income_source: "Salary",
    savings_goal: "",
    financial_experience: "Beginner",
}

export function useSettings() {
    const { user } = useAuth()

    const avatarInputRef = React.useRef<HTMLInputElement>(null)
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
    const [avatarSaving, setAvatarSaving] = React.useState(false)
    const [avatarLoading, setAvatarLoading] = React.useState(true)
    const [avatarMsg, setAvatarMsg] = React.useState<StatusMsg>(null)

    const [displayName, setDisplayName] = React.useState("")
    const [nameSaving, setNameSaving] = React.useState(false)
    const [nameMsg, setNameMsg] = React.useState<StatusMsg>(null)

    const [currentPassword, setCurrentPassword] = React.useState("")
    const [newPassword, setNewPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [passwordSaving, setPasswordSaving] = React.useState(false)
    const [passwordMsg, setPasswordMsg] = React.useState<StatusMsg>(null)

    const [form, setForm] = React.useState<ProfileForm>(DEFAULT_FORM)
    const [profileSaving, setProfileSaving] = React.useState(false)
    const [profileLoading, setProfileLoading] = React.useState(true)
    const [profileMsg, setProfileMsg] = React.useState<StatusMsg>(null)

    // ✅ FIXED: ONLY DB SOURCE
    React.useEffect(() => {
        if (!user) return
        setDisplayName(user.displayName ?? "")

            ; (async () => {
                setAvatarLoading(true)
                try {
                    const profile = await getUserProfile()

                    if (profile?.profile_pic) {
                        setAvatarPreview(profile.profile_pic)
                    } else {
                        setAvatarPreview(null)
                    }

                    if (profile) {
                        setForm({
                            full_name: profile.full_name ?? "",
                            country: profile.country ?? "India",
                            currency: profile.currency ?? "INR",
                            dob: profile.dob ?? "",
                            monthly_income:
                                profile.monthly_income != null
                                    ? String(profile.monthly_income)
                                    : "",
                            income_source: profile.income_source ?? "Salary",
                            savings_goal:
                                profile.savings_goal != null
                                    ? String(profile.savings_goal)
                                    : "",
                            financial_experience:
                                profile.financial_experience ?? "Beginner",
                        })
                    }

                    setProfileLoading(false)
                } catch {
                    setAvatarPreview(null)
                    setProfileLoading(false)
                } finally {
                    setAvatarLoading(false)
                }
            })()
    }, [user])

    const initials = (user?.displayName ?? user?.email ?? "?")
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

    const setField = (key: keyof ProfileForm) => (val: string) =>
        setForm((p) => ({ ...p, [key]: val }))

    const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"]

        if (!allowed.includes(file.type)) {
            setAvatarMsg({
                type: "error",
                text: "Only JPG, PNG, GIF, or WebP allowed.",
            })
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setAvatarMsg({ type: "error", text: "File too large. Max 2 MB." })
            return
        }

        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
        setAvatarMsg(null)

        if (avatarInputRef.current) avatarInputRef.current.value = ""
    }

    const handleSaveAvatar = async () => {
        if (!avatarFile || !user) return

        setAvatarSaving(true)
        setAvatarMsg(null)

        try {
            const publicUrl = await uploadProfilePic(avatarFile)

            await updateUserProfile({ profile_pic: publicUrl })

            await updatePhotoURL(publicUrl)

            setAvatarPreview(publicUrl)
            setAvatarFile(null)

            setAvatarMsg({ type: "success", text: "Profile photo updated!" })

            avatarEvents.emit()
        } catch (err: any) {
            console.error(err)
            setAvatarMsg({
                type: "error",
                text: err?.message ?? "Upload failed.",
            })
        } finally {
            setAvatarSaving(false)
        }
    }

    const handleCancelAvatar = () => {
        setAvatarFile(null)
        setAvatarPreview(null)
        setAvatarMsg(null)

        if (avatarInputRef.current) avatarInputRef.current.value = ""
    }

    const handleRemoveAvatar = async () => {
        if (!user) return

        try {
            setAvatarSaving(true)
            setAvatarMsg(null)

            const uid = user.uid

            // 🔥 1. Delete ALL possible avatar files
            await supabase.storage.from("avatars").remove([
                `${uid}/avatar.jpg`,
                `${uid}/avatar.png`,
                `${uid}/avatar.webp`,
                `${uid}/avatar.gif`,
            ])

            // 🔥 2. Remove from DB
            await updateUserProfile({ profile_pic: null })

            // 🔥 3. Remove from Firebase
            await updatePhotoURL("")

            // 🔥 4. Reset UI
            setAvatarPreview(null)
            setAvatarFile(null)

            // 🔥 5. Notify sidebar
            avatarEvents.emit()

            setAvatarMsg({
                type: "success",
                text: "Profile photo removed!",
            })
        } catch (err) {
            console.error(err)
            setAvatarMsg({
                type: "error",
                text: "Failed to remove photo.",
            })
        } finally {
            setAvatarSaving(false)
        }
    }

    const handleSaveName = async () => {
        if (!displayName.trim()) return

        setNameSaving(true)
        setNameMsg(null)

        try {
            await updateUserName(displayName.trim())
            setNameMsg({ type: "success", text: "Name updated!" })
        } catch {
            setNameMsg({ type: "error", text: "Failed to update name." })
        } finally {
            setNameSaving(false)
        }
    }

    const handleSavePassword = async () => {
        setPasswordMsg(null)

        if (!currentPassword) {
            setPasswordMsg({
                type: "error",
                text: "Enter current password.",
            })
            return
        }

        if (newPassword.length < 6) {
            setPasswordMsg({
                type: "error",
                text: "Min 6 characters required.",
            })
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordMsg({
                type: "error",
                text: "Passwords do not match.",
            })
            return
        }

        setPasswordSaving(true)

        try {
            await reauthenticate(currentPassword)
            await changePassword(newPassword)

            setPasswordMsg({
                type: "success",
                text: "Password updated!",
            })

            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            setPasswordMsg({
                type: "error",
                text: "Failed to update password.",
            })
        } finally {
            setPasswordSaving(false)
        }
    }

    const handleSaveProfile = async () => {
        setProfileSaving(true)
        setProfileMsg(null)

        try {
            await updateUserProfile({
                full_name: form.full_name || null,
                country: form.country || null,
                currency: form.currency || null,
                dob: form.dob || null,
                monthly_income: form.monthly_income
                    ? parseFloat(form.monthly_income)
                    : null,
                income_source: form.income_source || null,
                savings_goal: form.savings_goal
                    ? parseFloat(form.savings_goal)
                    : null,
                financial_experience:
                    form.financial_experience || null,
            })

            setProfileMsg({ type: "success", text: "Profile saved!" })
        } catch {
            setProfileMsg({
                type: "error",
                text: "Failed to save profile.",
            })
        } finally {
            setProfileSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount()
        } catch {
            alert("Error deleting account.")
        }
    }

    const handleLogout = () => logout()

    return {
        user,
        initials,

        avatarInputRef,
        avatarFile,
        avatarPreview,
        avatarLoading,
        avatarSaving,
        avatarMsg,

        handleAvatarPick,
        handleSaveAvatar,
        handleCancelAvatar,
        handleRemoveAvatar,

        displayName,
        setDisplayName,
        nameSaving,
        nameMsg,
        setNameMsg,
        handleSaveName,

        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        passwordSaving,
        passwordMsg,
        setPasswordMsg,
        handleSavePassword,

        form,
        setField,
        profileSaving,
        profileLoading,
        profileMsg,
        handleSaveProfile,

        handleDeleteAccount,
        handleLogout,
    }
}