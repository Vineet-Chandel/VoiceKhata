"use client"

import * as React from "react"
import { useSettings } from "@/components/hooks/use-settings"
import {
  SettingsSidebar, SettingsMobileTabs,
  ProfilePanel, FinancialPanel, SecurityPanel, DangerPanel, AppearancePanel,
  type TabId,
} from "@/components/ui/Settings_UI"
import { NAV_ITEMS } from "@/components/ui/Settings_UI/settings-sidebar"

export default function SettingsPage() {
  const s = useSettings()
  const [activeTab, setActiveTab] = React.useState<TabId>("profile")

  if (!s.user) return null

  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab)!

  return (
    <div className="flex w-full bg-bg-primary text-text-primary">

      {/* Sidebar */}
      <SettingsSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        displayName={s.user.displayName ?? ""}
        email={s.user.email ?? ""}
        avatarUrl={s.avatarPreview ?? undefined}
        initials={s.initials}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 py-6">

        {/* 🔥 WIDER CONTAINER */}
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-6 sm:px-10 space-y-6">

          {/* Heading */}
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-surface-secondary border border-border">
              <activeNav.icon className="size-5 text-text-secondary" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                {activeNav.label}
              </h1>

              <p className="text-sm text-text-muted mt-1">
                {activeTab === "profile" && "Your identity across the platform."}
                {activeTab === "appearance" && "Customize how Finease looks across your workspace."}
                {activeTab === "financial" && "Keep your financial data accurate for better insights."}
                {activeTab === "security" && "Protect your account with a strong password."}
                {activeTab === "danger" && "Destructive actions — proceed with extreme caution."}
              </p>
            </div>
          </div>

          {/* Panels */}
          {activeTab === "appearance" && <AppearancePanel />}
          
          {activeTab === "profile" && (
            <ProfilePanel
              displayName={s.displayName}
              email={s.user.email ?? ""}
              avatarPreview={s.avatarPreview}
              initials={s.initials}
              avatarFile={s.avatarFile}
              avatarSaving={s.avatarSaving}
              avatarLoading={s.avatarLoading}
              avatarMsg={s.avatarMsg}
              avatarInputRef={s.avatarInputRef}
              onAvatarPick={s.handleAvatarPick}
              onSaveAvatar={s.handleSaveAvatar}
              onCancelAvatar={s.handleCancelAvatar}
              onRemoveAvatar={s.handleRemoveAvatar}
              nameSaving={s.nameSaving}
              nameMsg={s.nameMsg}
              setDisplayName={s.setDisplayName}
              setNameMsg={s.setNameMsg}
              onSaveName={s.handleSaveName}
              dob={s.form.dob}                    // ← NEW
              onDobChange={s.setField("dob")}     // ← NEW
              onSaveProfile={s.handleSaveProfile} // ← NEW
              profileSaving={s.profileSaving}     // ← NEW
              profileMsg={s.profileMsg}           // ← NEW
            />
          )}

          {activeTab === "financial" && (
            <FinancialPanel
              form={s.form}
              setField={s.setField}
              profileLoading={s.profileLoading}
              profileSaving={s.profileSaving}
              profileMsg={s.profileMsg}
              onSave={s.handleSaveProfile}
            />
          )}

          {activeTab === "security" && (
            <SecurityPanel
              currentPassword={s.currentPassword}
              newPassword={s.newPassword}
              confirmPassword={s.confirmPassword}
              setCurrentPassword={s.setCurrentPassword}
              setNewPassword={s.setNewPassword}
              setConfirmPassword={s.setConfirmPassword}
              setPasswordMsg={s.setPasswordMsg}
              passwordSaving={s.passwordSaving}
              passwordMsg={s.passwordMsg}
              onSavePassword={s.handleSavePassword}
              onLogout={s.handleLogout}
            />
          )}

          {activeTab === "danger" && (
            <DangerPanel onDeleteAccount={s.handleDeleteAccount} />
          )}

        </div>
      </main>

      <SettingsMobileTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}