import { useState, useEffect } from "react"
import { Navigate, Link, useNavigate, useSearchParams } from "react-router-dom"
import Logo from "@/components/ui/Navbar/logo"
import { Button } from "@/components/ui/SignUp/button"
import { ChevronLeft, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import {
  signIn,
  signInWithGoogle,
  sendPasswordReset,
  resendVerificationEmailWithCredentials,
} from "@/firebase/auth"
import { useAuth } from "@/components/hooks/use-auth"

const REMEMBER_KEY = "voicekhata_remember"

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [infoMsg, setInfoMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resending, setResending] = useState(false)

  // ── Load saved credentials on mount ────────────────────────────────────────
  useEffect(() => {
    const emailFromURL = searchParams.get("email")
    const unverifiedFromURL = searchParams.get("unverified")

    if (unverifiedFromURL) {
      setError("Please verify your email address to access your dashboard.")
      setShowResendVerification(true)
    }

    if (emailFromURL) {
      setEmail(emailFromURL)
      return
    }

    try {
      const saved = localStorage.getItem(REMEMBER_KEY)
      if (saved) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved)
        if (savedEmail) setEmail(savedEmail)
        if (savedPassword) setPassword(savedPassword)
        setRememberMe(true)
      }
    } catch {
      localStorage.removeItem(REMEMBER_KEY)
    }
  }, [searchParams])

  // Redirect if already logged in and verified (or google user)
  if (!loading && user && (user.emailVerified || user.providerData?.some(p => p.providerId === "google.com"))) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfoMsg("")
    setShowResendVerification(false)
    setIsLoading(true)

    try {
      await signIn(email.trim(), password)

      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email: email.trim(), password }))
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }

      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      setIsLoading(false)
      if (err.code === "auth/email-not-verified") {
        setError("Please verify your email before logging in. Check your inbox and spam folder.")
        setShowResendVerification(true)
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Please check your credentials.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please reset your password or try again later.")
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled. Please contact support.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.")
      } else {
        setError(err.message || "Login failed. Please try again.")
      }
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setInfoMsg("")
    setIsLoading(true)
    try {
      await signInWithGoogle()
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      setIsLoading(false)
      if (err.code === "auth/popup-closed-by-user") {
        // User intentionally closed popup, no harsh error needed
        return
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized in Firebase Console. Please add it under Authentication > Settings > Authorized Domains.")
      } else if (err.code === "auth/popup-blocked") {
        setError("Google sign-in popup was blocked by your browser. Please allow popups for this site.")
      } else {
        setError(err.message || "Google login failed. Please try again.")
      }
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your email address to reset password.")
      return
    }
    setError("")
    setInfoMsg("")
    setIsLoading(true)
    try {
      await sendPasswordReset(email.trim())
      setInfoMsg("Password reset link sent! Check your inbox.")
      setShowForgot(false)
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.")
      } else {
        setError(err.message || "Could not send reset email.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password to resend the verification link.")
      return
    }
    setResending(true)
    setError("")
    setInfoMsg("")
    try {
      await resendVerificationEmailWithCredentials(email.trim(), password)
      setInfoMsg("A new verification email has been sent. Please check your inbox and spam folder.")
      setShowResendVerification(false)
    } catch (e: any) {
      setError(e.message || "Could not resend verification email.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-6 py-12">
      <Button asChild className="absolute top-6 left-6" variant="ghost">
        <Link to="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Home
        </Link>
      </Button>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo className="h-7" />
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {showForgot ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {showForgot
              ? "Enter your email to receive a password reset link"
              : "Sign in to your VoiceKhata account"}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p>{error}</p>
              {showResendVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="font-medium underline hover:text-red-300 block pt-1 cursor-pointer"
                >
                  {resending ? "Sending..." : "Resend verification instructions"}
                </button>
              )}
            </div>
          </div>
        )}

        {infoMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle2 className="size-4 shrink-0" />
            <p>{infoMsg}</p>
          </div>
        )}

        {showForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full cursor-pointer hover:bg-primary/90"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending link..." : "Send Reset Link"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setShowForgot(false)
                setError("")
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground text-center pt-2 cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true)
                    setError("")
                    setInfoMsg("")
                  }}
                  className="text-xs text-muted-foreground hover:text-primary underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                Remember me on this device
              </label>
            </div>

            <Button
              className="w-full cursor-pointer hover:bg-primary/90 mt-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {!showForgot && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              className="w-full cursor-pointer border border-input bg-background/60 hover:bg-accent hover:text-accent-foreground text-foreground"
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Please wait..." : "Google"}
            </Button>

            <p className="text-muted-foreground text-xs text-center pt-2">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="underline underline-offset-4 hover:text-primary font-medium text-foreground cursor-pointer inline-flex items-center gap-1"
              >
                Create account
                <ArrowRight className="size-3" />
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M21.35 11.1h-9.17v2.92h5.27c-.23 1.5-1.73 4.41-5.27 4.41-3.17 0-5.75-2.63-5.75-5.88s2.58-5.88 5.75-5.88c1.8 0 3.01.77 3.7 1.44l2.52-2.44C17.24 3.5 14.94 2.5 12.18 2.5 6.99 2.5 2.75 6.74 2.75 12s4.24 9.5 9.43 9.5c5.44 0 9.05-3.82 9.05-9.2 0-.62-.07-1.1-.15-1.2z" />
  </svg>
)