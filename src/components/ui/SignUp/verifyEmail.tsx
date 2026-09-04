import { useEffect, useState } from "react"
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/firebase/firebase"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import Logo from "@/components/ui/Navbar/logo"
import { Button } from "@/components/ui/SignUp/button"
import { CheckCircle2, XCircle, Loader2, Lock, ArrowRight } from "lucide-react"

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const mode = params.get("mode") // verifyEmail | resetPassword | recoverEmail
  const oobCode = params.get("oobCode")

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<"loading" | "success" | "error" | "reset_form">("loading")
  const [message, setMessage] = useState("Verifying your request...")

  // Password reset state (if accessed through reset link)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (!oobCode) {
      setStatus("error")
      setMessage("Invalid or missing verification code in link.")
      setLoading(false)
      return
    }

    if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => {
          setStatus("reset_form")
          setLoading(false)
        })
        .catch(() => {
          setStatus("error")
          setMessage("Password reset link is invalid or has expired.")
          setLoading(false)
        })
      return
    }

    // Default or mode === 'verifyEmail'
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("success")
        setMessage("Your email has been verified successfully! You can now log in.")
      })
      .catch((err) => {
        setStatus("error")
        if (err.code === "auth/invalid-action-code") {
          setMessage("This verification link is invalid or has already been used.")
        } else if (err.code === "auth/expired-action-code") {
          setMessage("This verification link has expired. Please log in to request a new link.")
        } else {
          setMessage("Verification failed. Please try again or request a new link.")
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [mode, oobCode])

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.")
      return
    }

    if (!oobCode) return
    setResetting(true)
    setResetError("")

    try {
      await confirmPasswordReset(auth, oobCode, newPassword)
      setStatus("success")
      setMessage("Your password has been reset successfully! You can now log in.")
    } catch (err: any) {
      setResetError(err.message || "Failed to reset password.")
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 sm:p-10 text-center space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <Logo className="h-7" />
        </div>

        {status === "loading" && (
          <div className="space-y-4 py-6">
            <Loader2 className="size-10 text-primary animate-spin mx-auto" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Verifying Email
            </h1>
            <p className="text-muted-foreground text-sm">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4">
            <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Verification Successful
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {message}
            </p>
            <Button
              asChild
              className="w-full cursor-pointer hover:bg-primary/90 mt-4"
            >
              <Link to="/login">
                Proceed to Login
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4">
            <XCircle className="size-12 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Verification Failed
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {message}
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full cursor-pointer mt-4"
            >
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>
        )}

        {status === "reset_form" && (
          <div className="space-y-4 text-left">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Set New Password
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your new password below.
              </p>
            </div>

            {resetError && (
              <p className="text-red-400 text-xs bg-red-500/10 p-2.5 rounded-md border border-red-500/20">
                {resetError}
              </p>
            )}

            <form onSubmit={handlePasswordResetSubmit} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    required
                    className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer mt-4"
                disabled={resetting}
              >
                {resetting ? "Updating password..." : "Update Password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}