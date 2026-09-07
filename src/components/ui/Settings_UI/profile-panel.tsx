// src/components/ui/Settings_UI/profile-panel.tsx
"use client"

import * as React from "react"
import { Camera, Sparkles, User, Calendar as CalendarIcon, Download, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, FieldRow, DateField, Toast, type StatusMsg } from "./settings-ui"
import { useInstallPrompt } from "./settings-sidebar"

interface ProfilePanelProps {
    displayName: string
    email: string
    avatarPreview: string | null
    initials: string
    avatarFile: File | null
    avatarSaving: boolean
    avatarLoading: boolean
    avatarMsg: StatusMsg
    avatarInputRef: React.RefObject<HTMLInputElement | null>
    onAvatarPick: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSaveAvatar: () => void
    onCancelAvatar: () => void
    onRemoveAvatar: () => void
    nameSaving: boolean
    nameMsg: StatusMsg
    setDisplayName: (v: string) => void
    setNameMsg: (v: StatusMsg) => void
    onSaveName: () => void
    dob: string
    onDobChange: (v: string) => void
    onSaveProfile: () => void
    profileSaving: boolean
    profileMsg: StatusMsg
}

export function ProfilePanel({
    displayName, email, avatarPreview, initials,
    avatarFile, avatarSaving, avatarLoading, avatarMsg,
    avatarInputRef, onAvatarPick, onSaveAvatar, onCancelAvatar,
    onRemoveAvatar,
    nameSaving, nameMsg, setDisplayName, setNameMsg, onSaveName,
    dob, onDobChange, onSaveProfile, profileSaving, profileMsg,
}: ProfilePanelProps) {

    const [showToast, setShowToast] = React.useState(false)
    const { canInstall, installed, isIOS, showButton, install } = useInstallPrompt()

    React.useEffect(() => {
        if (avatarMsg) {
            setShowToast(true)
            const t1 = setTimeout(() => setShowToast(false), 1800)
            return () => clearTimeout(t1)
        }
    }, [avatarMsg])

    return (
        <div className="space-y-4 w-full">

            {/* ── Avatar Card ── */}
            <Card className="relative overflow-hidden">

                {/* Banner */}
                <div className="relative h-20 bg-surface overflow-hidden rounded-t-xl">
                    <svg className="absolute inset-0 w-full h-full opacity-10 text-text-primary">
                        <defs>
                            <pattern id="pg" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.6" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#pg)" />
                    </svg>
                </div>

                {avatarMsg && (
                    <div className={`
                        absolute top-4 left-1/2 -translate-x-1/2 z-50
                        transition-all duration-300
                        ${showToast
                            ? "animate-in fade-in slide-in-from-top-2"
                            : "animate-out fade-out slide-out-to-top-2"}
                    `}>
                        <Toast msg={avatarMsg} />
                    </div>
                )}

                {/* Content */}
                <div className="px-4 sm:px-6 py-5 flex items-center gap-4 sm:gap-5">

                    {/* Avatar */}
                    <div className="relative group shrink-0">
                        <div className="size-[68px] sm:size-[78px] rounded-2xl overflow-hidden
                            ring-2 ring-white/[0.10] ring-offset-2 ring-offset-[#111] shadow-md">
                            {avatarLoading ? (
                                <div className="size-full bg-surface-secondary animate-pulse flex items-center justify-center">
                                    <Camera className="size-5 text-text-muted" />
                                </div>
                            ) : avatarPreview ? (
                                <img src={avatarPreview} className="size-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="size-full bg-surface flex items-center justify-center text-2xl font-black text-text-muted">
                                    {initials}
                                </div>
                            )}
                        </div>

                        <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-[#111]" />

                        {!avatarSaving && !avatarLoading && (
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute inset-0 rounded-2xl bg-bg-primary/60 opacity-0 group-hover:opacity-100
                                    transition flex items-center justify-center cursor-pointer"
                            >
                                <Camera className="size-5 text-text-primary" />
                            </button>
                        )}
                    </div>

                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden cursor-pointer"
                        onChange={onAvatarPick}
                    />

                    {/* Info */}
                    <div className="flex flex-col justify-center min-w-0 flex-1 py-1">
                        <p className="text-[18px] sm:text-[22px] font-extrabold tracking-tight leading-snug truncate text-text-primary">
                            {displayName || "Your Name"}
                        </p>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[12px] sm:text-[13px] text-text-secondary truncate font-medium">{email}</span>
                            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                            <span className="text-[11px] sm:text-[12px] text-emerald-400 font-semibold">Verified</span>
                        </div>

                        <div className="flex gap-2 mt-3 flex-wrap items-center">
                            {!avatarFile && !avatarSaving && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="h-8 px-3 sm:px-4 rounded-lg text-[12px] sm:text-[12.5px] font-medium
                                            bg-surface-secondary border border-border-secondary
                                            text-text-primary hover:bg-surface-secondary hover:border-white/[0.25]
                                            hover:text-text-primary active:scale-[0.97] transition-all duration-150 shadow-sm cursor-pointer"
                                    >
                                        Change photo
                                    </Button>

                                    {avatarPreview && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onRemoveAvatar}
                                            className="h-8 px-3 sm:px-4 rounded-lg text-[12px] sm:text-[12.5px] font-medium
                                                bg-red-500/[0.08] border border-red-500/[0.25]
                                                text-red-400 hover:bg-red-500/[0.18]
                                                hover:border-red-500/[0.4] hover:text-red-300
                                                active:scale-[0.97] transition-all duration-150 shadow-sm cursor-pointer"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </>
                            )}

                            {avatarFile && (
                                <div className="flex gap-2 items-center">
                                    <Button
                                        size="sm"
                                        onClick={onSaveAvatar}
                                        disabled={avatarSaving}
                                        className="h-8 px-4 rounded-lg text-[12.5px] font-semibold
                                            bg-text-primary text-bg-primary shadow-sm hover:opacity-90
                                            active:scale-[0.97] transition-all duration-150
                                            disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {avatarSaving ? "Uploading..." : "Save photo"}
                                    </Button>

                                    {!avatarSaving && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onCancelAvatar}
                                            className="h-8 px-4 rounded-lg text-[12.5px] font-medium
                                                bg-surface-secondary border border-border-secondary
                                                text-text-secondary hover:bg-surface-secondary
                                                hover:text-text-primary active:scale-[0.97]
                                                transition-all duration-150 cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <p className="text-[11px] text-text-muted mt-2 font-medium tracking-wide">
                            JPG · PNG · GIF · WebP · Max 2 MB
                        </p>
                    </div>
                </div>
            </Card>

            {/* ── Install App Card — mobile only (sidebar shows it on desktop) ── */}
            <div className="lg:hidden">
                {installed ? (
                    <Card>
                        <div className="px-5 py-4 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/[0.10] shrink-0">
                                <CheckCircle className="size-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-text-primary">App Installed</p>
                                <p className="text-[11px] text-text-muted">VoiceKhata is on your home screen</p>
                            </div>
                        </div>
                    </Card>
                ) : canInstall ? (
                    /* Chrome/Android: native prompt */
                    <Card>
                        <button
                            onClick={install}
                            className="w-full px-5 py-4 flex items-center gap-3 cursor-pointer
                                hover:bg-surface-secondary transition-colors rounded-xl text-left"
                        >
                            <div className="p-2 rounded-xl bg-surface-secondary shrink-0">
                                <Download className="size-4 text-text-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-text-primary">Install VoiceKhata</p>
                                <p className="text-[11px] text-text-muted">Add to home screen for quick access</p>
                            </div>
                            <div className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-secondary border border-border">
                                <span className="text-[11px] font-semibold text-text-secondary">Install</span>
                            </div>
                        </button>
                    </Card>
                ) : isIOS ? (
                    /* iOS Safari: manual steps */
                    <Card>
                        <div className="px-5 py-4 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-surface-secondary shrink-0">
                                <Download className="size-4 text-text-muted" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-text-secondary">Install VoiceKhata</p>
                                <p className="text-[11px] text-text-muted leading-snug mt-0.5">
                                    Tap the Share button, then choose<br />"Add to Home Screen"
                                </p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    /* Chrome: prompt not triggered yet — show hint */
                    <Card>
                        <button
                            onClick={() => alert("To install: look for the install icon (⊕) in your browser address bar, or go to browser menu → Install VoiceKhata")}
                            className="w-full px-5 py-4 flex items-center gap-3 cursor-pointer
                                hover:bg-surface-secondary transition-colors rounded-xl text-left"
                        >
                            <div className="p-2 rounded-xl bg-surface-secondary shrink-0">
                                <Download className="size-4 text-text-muted" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-text-secondary">Install VoiceKhata</p>
                                <p className="text-[11px] text-text-muted leading-snug">
                                    Tap ⊕ in your browser address bar
                                </p>
                            </div>
                        </button>
                    </Card>
                )}
            </div>

            {/* ── Name + Email + DOB Card ── */}
            <Card>
                <FieldRow icon={Sparkles} label="Display Name" description="Shown across the entire app. 32 characters max.">
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                value={displayName}
                                onChange={(e) => {
                                    setDisplayName(e.target.value)
                                    setNameMsg(null)
                                }}
                                maxLength={32}
                                className="h-10 text-[14px] font-semibold bg-surface-secondary border-border text-text-primary rounded-lg"
                            />
                            <Button size="sm" onClick={onSaveName} disabled={nameSaving || !displayName.trim()}
                                className="h-10 px-5 text-[13px] font-bold rounded-lg bg-text-primary text-bg-primary hover:opacity-90">
                                {nameSaving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                        <Toast msg={nameMsg} />
                    </div>
                </FieldRow>

                <div className="h-px bg-surface-secondary mx-6" />

                <FieldRow icon={User} label="Email Address" description="Your login email.">
                    <Input value={email} disabled className="h-10 text-[14px] font-medium opacity-30 bg-surface-secondary rounded-lg" />
                </FieldRow>

                <div className="h-px bg-surface-secondary mx-6" />

                <FieldRow
                    icon={CalendarIcon}
                    label="Date of Birth"
                    description="Private — used for age-based insights only."
                >
                    <DateField value={dob} onChange={onDobChange} />
                </FieldRow>
            </Card>

            {/* Save profile button */}
            {dob && (
                <div className="flex items-center gap-3 pt-1">
                    <Button
                        onClick={onSaveProfile}
                        disabled={profileSaving}
                        className="cursor-pointer h-10 px-8 bg-text-primary text-bg-primary hover:opacity-90 border-0 font-semibold"
                    >
                        {profileSaving
                            ? <><span className="size-4 rounded-full border-2 border-bg-primary/20 border-t-bg-primary animate-spin mr-2" />Saving…</>
                            : <>Save Profile</>
                        }
                    </Button>
                    <Toast msg={profileMsg} />
                </div>
            )}

        </div>
    )
}