"use client"

import { User, Wallet, Shield, AlertTriangle, Download, CheckCircle, Loader2, Eye } from "lucide-react"
import { useState, useEffect, useRef } from "react"

// ─── Nav items ────────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: "profile",    label: "Profile",      icon: User          },
  { id: "appearance", label: "Appearance",   icon: Eye           },
  { id: "financial",  label: "Financial",    icon: Wallet        },
  { id: "security",   label: "Security",     icon: Shield        },
  { id: "danger",     label: "Danger Zone",  icon: AlertTriangle },
] as const

export type TabId = (typeof NAV_ITEMS)[number]["id"]

// ─── Install prompt hook ──────────────────────────────────────────────────────

export function useInstallPrompt() {
  const [prompt, setPrompt]       = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS]         = useState(false)
  const [waiting, setWaiting]     = useState(false)
  // Ref so the retry interval callback always sees the latest prompt value
  const promptRef = useRef<any>(null)

  useEffect(() => {
    // Already running as installed PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setInstalled(true)
      return
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      promptRef.current = e
      setPrompt(e)
      setWaiting(false)
    }

    const onAppInstalled = () => {
      setInstalled(true)
      setPrompt(null)
      promptRef.current = null
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  const install = async () => {
    // ── Path A: prompt already captured — fire native dialog immediately ──
    if (promptRef.current) {
      await triggerPrompt()
      return
    }

    // ── Path B: prompt not fired yet — wait up to 3 s then retry ──
    // This covers the case where the user clicks Install before Chrome has
    // fired beforeinstallprompt (common on first page load).
    setWaiting(true)
    let attempts = 0
    const MAX = 15 // 15 × 200 ms = 3 s

    const interval = setInterval(async () => {
      attempts++

      if (promptRef.current) {
        clearInterval(interval)
        setWaiting(false)
        await triggerPrompt()
        return
      }

      if (attempts >= MAX) {
        clearInterval(interval)
        setWaiting(false)
        // Non-blocking toast — only reached on truly unsupported browsers
        showToast("Use the browser menu → Install FinEase")
      }
    }, 200)
  }

  async function triggerPrompt() {
    const p = promptRef.current
    if (!p) return
    try {
      p.prompt()
      const { outcome } = await p.userChoice
      if (outcome === "accepted") setInstalled(true)
    } catch {
      // prompt already consumed — browser will re-fire beforeinstallprompt
    }
    promptRef.current = null
    setPrompt(null)
  }

  function showToast(message: string) {
    const el = document.createElement("div")
    el.textContent = message
    el.style.cssText = [
      "position:fixed", "bottom:24px", "left:50%", "transform:translateX(-50%)",
      "background:#1f2937", "color:#f9fafb", "padding:12px 20px",
      "border-radius:12px", "font-size:13px", "z-index:9999",
      "box-shadow:0 4px 24px rgba(0,0,0,0.5)",
      "border:1px solid rgba(255,255,255,0.08)", "pointer-events:none",
    ].join(";")
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 4000)
  }

  return {
    canInstall:  !!prompt && !installed, // native prompt ready
    installed,
    isIOS,
    showButton:  !installed,
    waiting,
    install,
  }
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SettingsSidebarProps {
  activeTab:    TabId
  onTabChange:  (id: TabId) => void
  displayName?: string
  email?:       string
  avatarUrl?:   string
  initials?:    string
}

export function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  const { installed, isIOS, showButton, waiting, install } = useInstallPrompt()

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border py-8 px-3 gap-0.5">

      {/* Section label */}
      <div className="px-3 mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Account</p>
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active   = activeTab === id
        const isDanger = id === "danger"

        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
              transition-all cursor-pointer w-full text-left
              ${active
                ? isDanger
                  ? "bg-red-500/10 text-red-400"
                  : "bg-sidebar-active text-sidebar-active-foreground shadow-md"
                : isDanger
                  ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.05]"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-secondary"
              }`}
          >
            <div className={`p-1.5 rounded-lg transition-all shrink-0
              ${active
                ? isDanger ? "bg-red-500/20" : "bg-surface-secondary"
                : isDanger ? "bg-transparent group-hover:bg-red-500/[0.08]" : "bg-transparent group-hover:bg-surface-secondary"
              }`}
            >
              <Icon className={`size-3.5
                ${active
                  ? isDanger ? "text-red-400" : "text-text-primary"
                  : isDanger ? "text-red-400/60 group-hover:text-red-400" : "text-text-muted"
                }`}
              />
            </div>

            <span className="font-medium">{label}</span>

            {active && (
              <div className={`ml-auto size-1.5 rounded-full ${isDanger ? "bg-red-400" : "bg-text-primary/40"}`} />
            )}
          </button>
        )
      })}

      {/* Install / installed footer */}
      {showButton && (
        <div className="mt-auto pt-6 px-1">
          <div className="h-px bg-surface-secondary mb-4" />

          {installed ? (
            /* ── Already installed ── */
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
              bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
              <CheckCircle className="size-3.5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-emerald-400">App Installed</p>
                <p className="text-[10px] text-text-muted leading-tight">FinEase is on your device</p>
              </div>
            </div>

          ) : isIOS ? (
            /* ── iOS Safari: tap Share → Add to Home Screen ── */
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl
              bg-surface-secondary border border-border">
              <Download className="size-3.5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-text-secondary">Install App</p>
                <p className="text-[10px] text-text-muted leading-snug mt-0.5">
                  Tap the Share icon<br />then "Add to Home Screen"
                </p>
              </div>
            </div>

          ) : (
            /* ── Chrome / Edge / Android / Desktop ──
               Clicking always results in the browser's native
               "Install app" dialog (FinEase · Install · Cancel).
               If beforeinstallprompt hasn't fired yet the button
               waits up to 3 s and retries — no alert() fallback.
            ── */
            <button
              onClick={install}
              disabled={waiting}
              className="group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                bg-surface-secondary border border-border
                hover:bg-surface-secondary hover:border-border-secondary
                disabled:opacity-60 disabled:cursor-wait
                transition-all duration-150 cursor-pointer text-left"
            >
              <div className="p-1.5 rounded-lg bg-surface-secondary group-hover:bg-surface-elevated transition-all shrink-0">
                {waiting
                  ? <Loader2 className="size-3.5 text-text-secondary animate-spin" />
                  : <Download className="size-3.5 text-text-secondary group-hover:text-text-primary transition-colors" />
                }
              </div>
              <div>
                <p className="text-[12px] font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                  {waiting ? "Preparing…" : "Install App"}
                </p>
                <p className="text-[10px] text-text-muted leading-tight">
                  {waiting ? "Just a moment" : "Add to home screen"}
                </p>
              </div>
            </button>
          )}
        </div>
      )}

    </aside>
  )
}