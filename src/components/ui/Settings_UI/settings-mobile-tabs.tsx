// src/components/ui/Settings_UI/settings-mobile-tabs.tsx
"use client"

import { NAV_ITEMS, type TabId } from "./settings-sidebar"
import { useLanguage } from "@/context/LanguageContext"

interface SettingsMobileTabsProps {
  activeTab:   TabId
  onTabChange: (id: TabId) => void
}

export function SettingsMobileTabs({ activeTab, onTabChange }: SettingsMobileTabsProps) {
  const { t } = useLanguage()

  const getNavLabel = (id: TabId) => {
    switch (id) {
      case "profile": return t("settings.profile")
      case "appearance": return t("settings.appearance")
      case "financial": return t("settings.financial")
      case "security": return t("settings.security")
      case "danger": return t("settings.danger")
      default: return id
    }
  }

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border
      bg-bg-primary/95 backdrop-blur-xl">
      <div className="flex">
        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button key={id} onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 cursor-pointer transition-all">
              <div className={`p-1.5 rounded-lg transition-all ${active ? "bg-surface-secondary" : ""}`}>
                <Icon className={`size-4 ${active ? "text-text-primary" : "text-text-muted"}`} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wide
                ${active ? "text-text-primary" : "text-text-muted"}`}>
                {getNavLabel(id).split(" ")[0]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}