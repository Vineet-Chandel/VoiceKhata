"use client"

import { useTheme } from "next-themes"
import { Card, SectionLabel } from "./settings-ui"
import { Moon, Sun, CheckCircle2 } from "lucide-react"

export function AppearancePanel() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Theme</SectionLabel>
        <Card className="p-6">
          <p className="text-sm font-medium text-text-primary mb-1">Customize how VoiceKhata looks</p>
          <p className="text-xs text-text-secondary mb-6">Choose your preferred appearance for the entire workspace.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Dark Mode Option */}
            <button
              onClick={() => setTheme("dark")}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl border transition-all cursor-pointer
                ${theme === "dark" 
                  ? "bg-surface-elevated border-primary text-primary" 
                  : "bg-surface border-border hover:border-text-muted text-text-secondary hover:text-text-primary"}`}
            >
              <Moon className="size-8 mb-4 opacity-80" />
              <span className="font-medium text-sm">Dark</span>
              
              {theme === "dark" && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  <CheckCircle2 className="size-3" /> Selected
                </div>
              )}
            </button>

            {/* Light Mode Option */}
            <button
              onClick={() => setTheme("light")}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl border transition-all cursor-pointer
                ${theme === "light" 
                  ? "bg-surface-elevated border-primary text-primary" 
                  : "bg-surface border-border hover:border-text-muted text-text-secondary hover:text-text-primary"}`}
            >
              <Sun className="size-8 mb-4 opacity-80" />
              <span className="font-medium text-sm">Light</span>
              
              {theme === "light" && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  <CheckCircle2 className="size-3" /> Selected
                </div>
              )}
            </button>
            
          </div>
        </Card>
      </div>
    </div>
  )
}
