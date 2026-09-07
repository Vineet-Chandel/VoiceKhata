// src/components/ui/Settings_UI/financial-panel.tsx
"use client"

import { Check, User, Globe, Mail, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card, FieldRow, SectionLabel, SelectDropdown, Toast, type StatusMsg,
} from "./settings-ui"
import type { ProfileForm } from "@/components/hooks/use-settings"
import { useAuth } from "@/components/hooks/use-auth"
import { useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import React from "react"

const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Other"]
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://voicekhata-tif3.onrender.com"

interface FinancialPanelProps {
  form: ProfileForm
  setField: (key: keyof ProfileForm) => (val: string) => void
  profileLoading: boolean
  profileSaving: boolean
  profileMsg: StatusMsg
  onSave: () => void
}

export function FinancialPanel({
  form, setField, profileLoading, profileSaving, profileMsg, onSave,
}: FinancialPanelProps) {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const gmailStatus = searchParams.get("gmail")
  const [connected, setConnected] = React.useState(false)
  const [checkingGmail, setCheckingGmail] = React.useState(true)

  React.useEffect(() => {
    async function checkGmailToken() {
      if (!user) return
      setCheckingGmail(true)

      try {
        const { data, error } = await supabase
          .from("gmail_tokens")
          .select("firebase_uid")
          .eq("firebase_uid", user.uid)
          .maybeSingle() // ✅ won't throw error if no row found

        if (error) {
          console.error("Gmail token check failed:", error)
          setConnected(false)
          return
        }

        // ✅ Check both DB row AND URL param (just came back from OAuth)
        const params = new URLSearchParams(window.location.search)
        setConnected(!!data || params.get("gmail") === "connected")
      } finally {
        setCheckingGmail(false)
      }
    }

    checkGmailToken()
  }, [user])

  const handleConnectGmail = () => {
    if (!user) return
    window.location.href = `${BACKEND_URL}/auth/gmail?uid=${user.uid}`
  }

  const handleDisconnectGmail = async () => {
    if (!user) return
    setCheckingGmail(true)
    try {
      const { error } = await supabase
        .from("gmail_tokens")
        .delete()
        .eq("firebase_uid", user.uid)

      if (error) {
        console.error("Gmail disconnect failed:", error)
        return
      }

      setConnected(false)
    } finally {
      setCheckingGmail(false)
    }
  }

  if (profileLoading) {
    return (
      <Card className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-text-muted">
          <div className="size-7 rounded-full border-2 border-border border-t-white/40 animate-spin" />
          <p className="text-sm">Loading financial profile…</p>
        </div>
      </Card>
    )
  }

  const inputCls = "h-10 bg-surface-secondary border-border hover:border-border-secondary focus:border-border-secondary text-text-primary placeholder:text-text-muted transition-all"

  return (
    <div className="space-y-4">

      {/* Identity Card */}
      <Card>
        <SectionLabel>Identity</SectionLabel>
        <FieldRow icon={User} label="Full Name" description="Used in reports and exports.">
          <Input
            value={form.full_name}
            onChange={(e) => setField("full_name")(e.target.value)}
            placeholder="Full name"
            className={inputCls}
          />
        </FieldRow>
        <FieldRow icon={Globe} label="Country" description="Localises insights for your region.">
          <SelectDropdown value={form.country} options={COUNTRIES} onChange={setField("country")} />
        </FieldRow>
      </Card>

      {/* Integrations Card */}
      <Card>
        <SectionLabel>Integrations</SectionLabel>
        <FieldRow
          icon={Mail}
          label="Gmail Auto-Import"
          description="Automatically import UPI & bank transactions from your Gmail inbox."
        >
          {checkingGmail ? (
            <div className="size-4 rounded-full border-2 border-border border-t-white/40 animate-spin" />
          ) : connected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircle2 className="size-4" />
                Connected
              </div>
              <Button
                onClick={handleDisconnectGmail}
                size="sm"
                className="h-8 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer text-xs"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={handleConnectGmail}
                size="sm"
                className="h-8 px-4 bg-surface-secondary hover:bg-surface-elevated text-text-primary border border-border-secondary cursor-pointer"
              >
                <Mail className="size-3.5 mr-1.5" />
                Connect Gmail
              </Button>
              {gmailStatus === "error" && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-3" /> Connection failed. Try again.
                </p>
              )}
            </div>
          )}
        </FieldRow>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={onSave}
          disabled={profileSaving}
          className="cursor-pointer h-10 px-8 bg-text-primary text-bg-primary hover:opacity-90 border-0 font-semibold"
        >
          {profileSaving
            ? <><span className="size-4 rounded-full border-2 border-bg-primary/20 border-t-bg-primary animate-spin mr-2" />Saving…</>
            : <><Check className="size-4 mr-2" />Save Changes</>
          }
        </Button>
        <Toast msg={profileMsg} />
      </div>
    </div>
  )
}