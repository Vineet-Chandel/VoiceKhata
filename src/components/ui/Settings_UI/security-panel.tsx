// src/components/ui/Settings_UI/security-panel.tsx
"use client"

import { Lock, LogOut, AlertTriangle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, FieldRow, PasswordInput, PasswordStrength, Toast, type StatusMsg } from "./settings-ui"
import { useLanguage } from "@/context/LanguageContext"

interface SecurityPanelProps {
    currentPassword: string
    newPassword: string
    confirmPassword: string
    setCurrentPassword: (v: string) => void
    setNewPassword: (v: string) => void
    setConfirmPassword: (v: string) => void
    setPasswordMsg: (v: StatusMsg) => void
    passwordSaving: boolean
    passwordMsg: StatusMsg
    onSavePassword: () => void
    onLogout: () => void
}

export function SecurityPanel({
    currentPassword, newPassword, confirmPassword,
    setCurrentPassword, setNewPassword, setConfirmPassword, setPasswordMsg,
    passwordSaving, passwordMsg, onSavePassword, onLogout,
}: SecurityPanelProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-4">

            {/* Change password */}
            <Card>
                <div className="px-5 pt-5 pb-4 border-b border-border">
                    <p className="text-sm font-semibold text-text-primary">{t("settings.changePassword")}</p>
                    <p className="text-xs text-text-muted mt-1">{t("settings.passwordHelp")}</p>
                </div>

                <div className="p-5 space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                {t("settings.currentPassword")}
                            </label>
                            <PasswordInput
                                value={currentPassword}
                                onChange={(v) => { setCurrentPassword(v); setPasswordMsg(null) }}
                                placeholder={t("settings.enterCurrentPassword")}
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                {t("settings.newPassword")}
                            </label>
                            <PasswordInput
                                value={newPassword}
                                onChange={(v) => { setNewPassword(v); setPasswordMsg(null) }}
                                placeholder={t("settings.enterNewPassword")}
                            />
                            <PasswordStrength password={newPassword} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                {t("settings.confirmPassword")}
                            </label>
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(v) => { setConfirmPassword(v); setPasswordMsg(null) }}
                                placeholder={t("settings.repeatNewPassword")}
                            />

                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
                                    <AlertTriangle className="size-3" /> {t("settings.passwordsDoNotMatch")}
                                </p>
                            )}

                            {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                                <p className="text-[11px] text-text-secondary flex items-center gap-1 mt-1">
                                    <Check className="size-3" /> {t("settings.passwordsMatch")}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Submit */}
                    <div className="pt-1 flex items-center gap-3">
                        <Button onClick={onSavePassword}
                            disabled={passwordSaving || !newPassword || !currentPassword}
                            className="cursor-pointer h-10 px-6 bg-text-primary text-bg-primary hover:opacity-90 border-0 font-semibold">
                            {passwordSaving
                                ? <><span className="size-4 rounded-full border-2 border-bg-primary/20 border-t-bg-primary animate-spin mr-2" />{t("settings.updating")}</>
                                : <><Lock className="size-4 mr-2" />{t("settings.updatePassword")}</>
                            }
                        </Button>
                        <Toast msg={passwordMsg} />
                    </div>

                </div>
            </Card>

            {/* Sign out */}
            <div className="flex justify-end">
                <Card className="w-full">
                    <FieldRow
                        icon={LogOut}
                        label={t("settings.signOut")}
                        description={t("settings.signOutDesc")}
                    >
                        <Button variant="outline" onClick={onLogout}
                            className="cursor-pointer gap-2 h-10 bg-surface-secondary border-border
                hover:bg-surface-secondary hover:border-border-secondary text-text-secondary w-full sm:w-auto">
                            <LogOut className="size-4" /> {t("settings.signOut")}
                        </Button>
                    </FieldRow>
                </Card>
            </div>

        </div>
    )
}