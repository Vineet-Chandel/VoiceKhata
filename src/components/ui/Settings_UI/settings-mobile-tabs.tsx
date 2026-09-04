// src/components/ui/Settings_UI/settings-mobile-tabs.tsx
"use client"

import { NAV_ITEMS, type TabId } from "./settings-sidebar"

interface SettingsMobileTabsProps {
  activeTab:   TabId
  onTabChange: (id: TabId) => void
}

export function SettingsMobileTabs({ activeTab, onTabChange }: SettingsMobileTabsProps) {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border
      bg-bg-primary/95 backdrop-blur-xl">
      <div className="flex">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button key={id} onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 cursor-pointer transition-all">
              <div className={`p-1.5 rounded-lg transition-all ${active ? "bg-surface-secondary" : ""}`}>
                <Icon className={`size-4 ${active ? "text-text-primary" : "text-text-muted"}`} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wide
                ${active ? "text-text-primary" : "text-text-muted"}`}>
                {label.split(" ")[0]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}