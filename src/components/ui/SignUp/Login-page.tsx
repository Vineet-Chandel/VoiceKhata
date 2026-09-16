import { useState, useEffect } from "react"
import { Navigate, Link, useNavigate, useSearchParams } from "react-router-dom"
import logoImg from "@/assets/logo.png"
import {
  ChevronLeft,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Mic,
  Zap
} from "lucide-react"
import {
  signIn,
  signInWithGoogle,
  sendPasswordReset,
  resendVerificationEmailWithCredentials,
} from "@/firebase/auth"
import { useAuth } from "@/components/hooks/use-auth"
import ThemeToggle from "@/components/ui/ThemeToggle"

const REMEMBER_KEY = "voicekhata_remember"

// Soundwave & Voice Motif matching the VoiceKhata Lime & Charcoal design
const VoiceKhataWaveformGraphic = () => (
  <div className="relative flex items-center justify-center shrink-0 w-24 sm:w-28 h-10 select-none pointer-events-none">
    <svg
      className="w-full h-8 text-[#0B0F15] dark:text-[#D2F832] overflow-visible"
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Waveform lines left */}
      <path d="M 4 16 L 4 10 M 4 16 L 4 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M 14 16 L 14 6 M 14 16 L 14 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M 24 16 L 24 12 M 24 16 L 24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 34 16 L 34 2 M 34 16 L 34 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M 44 16 L 44 8 M 44 16 L 44 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* Central mic accent circle */}
      <circle cx="60" cy="16" r="14" className="fill-[#D2F832] text-[#0B0F15]" />
      
      {/* Waveform lines right */}
      <path d="M 76 16 L 76 8 M 76 16 L 76 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M 86 16 L 86 2 M 86 16 L 86 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M 96 16 L 96 12 M 96 16 L 96 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 106 16 L 106 6 M 106 16 L 106 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M 116 16 L 116 10 M 116 16 L 116 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>

    {/* Center Microphone Icon */}
    <div className="absolute left-[calc(50%-12px)] top-[calc(50%-12px)] flex items-center justify-center size-6 rounded-full text-[#0B0F15]">
      <Mic className="size-3.5 stroke-[2.5]" />
    </div>
  </div>
)

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading, enableDemoMode } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [infoMsg, setInfoMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  // Only redirect if already logged in as a real, non-demo, verified user
  const isDemoUser =
    user?.isAnonymous ||
    user?.uid === "demo-guest-user" ||
    (typeof window !== "undefined" && localStorage.getItem("voicekhata_demo_user") === "true")

  if (!loading && user && !isDemoUser && (user.emailVerified || user.providerData?.some(p => p.providerId === "google.com"))) {
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
      const isApiKeyOrDevError =
        err.code === "auth/invalid-api-key" ||
        err.code === "auth/api-key-not-valid" ||
        err.message?.toLowerCase().includes("api-key") ||
        err.message?.toLowerCase().includes("api key")

      if (isApiKeyOrDevError) {
        try {
          localStorage.setItem("voicekhata_demo_user", "true")
        } catch {}
        enableDemoMode?.()
        navigate("/dashboard", { replace: true })
        return
      }

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
        setError("Network error connecting to Firebase. You can continue via Explore Demo below.")
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
      const isApiKeyOrDomainError =
        err.code === "auth/invalid-api-key" ||
        err.code === "auth/api-key-not-valid" ||
        err.code === "auth/unauthorized-domain" ||
        err.message?.toLowerCase().includes("api-key") ||
        err.message?.toLowerCase().includes("api key")

      if (isApiKeyOrDomainError) {
        try {
          localStorage.setItem("voicekhata_demo_user", "true")
        } catch {}
        enableDemoMode?.()
        navigate("/dashboard", { replace: true })
        return
      }

      if (err.code === "auth/popup-closed-by-user") {
        return
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
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#070A11] text-[#0B0F15] dark:text-[#F8FAFC] px-4 py-8 sm:px-6 sm:py-12 flex flex-col justify-center transition-colors font-sans">
      
      {/* Subtle background ambient mesh */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#D2F832]/15 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-slate-200/50 dark:bg-slate-800/20 rounded-full blur-[100px] pointer-events-none -z-0" />

      {/* Top Bar Navigation */}
      <div className="absolute top-5 left-4 right-4 sm:left-8 sm:right-8 z-20 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0E1320]/80 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-white transition-all shadow-2xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md my-auto pt-8 sm:pt-0">
        
        {/* Main Card Container */}
        <div className="w-full rounded-[28px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1320] p-7 sm:p-9 shadow-xl shadow-slate-200/50 dark:shadow-black/60 transition-all">
          
          {/* Header Graphic & Title */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <Link to="/" className="group flex items-center gap-2 mb-1">
              <div className="relative flex size-10 items-center justify-center rounded-xl bg-[#0B0F15] text-white p-2 shadow-xs group-hover:scale-105 transition-transform">
                <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
                <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#D2F832] border-2 border-white dark:border-[#0E1320]" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#0B0F15] dark:text-white">
                Voice<span className="text-[#0B0F15] dark:text-[#D2F832]">Khata</span>
              </span>
            </Link>

            <VoiceKhataWaveformGraphic />

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#0B0F15] dark:text-white tracking-tight">
                {showForgot ? "Reset Password" : "Sign In to Your Khata"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {showForgot
                  ? "Enter your registered email address to receive reset instructions."
                  : "Enter your phone or email credentials to access your voice ledger."}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {showResendVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="block mt-1 font-bold underline hover:no-underline cursor-pointer"
                  >
                    {resending ? "Sending link..." : "Resend Verification Email"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Info Message */}
          {infoMsg && (
            <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ── Forgot Password Form ── */}
          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shopkeeper@example.com"
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B0F15] dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0B0F15] hover:bg-black text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? "Sending Link..." : "Send Password Reset Link"}</span>
                  <ArrowRight className="size-3.5 text-[#D2F832]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false)
                    setError("")
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* ── Sign In Form ── */
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shopkeeper@example.com"
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B0F15] dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true)
                      setError("")
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B0F15] dark:focus:ring-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#0B0F15] focus:ring-[#0B0F15]"
                  />
                  <span>Remember my credentials</span>
                </label>
              </div>

              {/* Sign In Primary CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#0B0F15] hover:bg-black text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer group"
                >
                  <span>{isLoading ? "Signing In..." : "Sign In to Khata"}</span>
                  <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-3 stroke-[2.5]" />
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                <span className="absolute bg-white dark:bg-[#0E1320] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Or continue with
                </span>
              </div>

              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070A11] hover:bg-white dark:hover:bg-[#131928] text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 py-3 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Account</span>
              </button>

              {/* Demo Mode Quick Access Button */}
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem("voicekhata_demo_user", "true")
                  } catch {}
                  enableDemoMode?.()
                  navigate("/dashboard", { replace: true })
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <Zap className="size-3.5 text-[#D2F832]" />
                <span>Explore Interactive Demo Mode</span>
              </button>

            </form>
          )}

          {/* Footer link to sign up */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have a VoiceKhata account?{" "}
              <Link to="/signup" className="font-bold text-[#0B0F15] dark:text-[#D2F832] hover:underline">
                Create Account
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default LoginPage
