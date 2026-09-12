import { useState, useEffect } from "react"
import { Navigate, Link, useNavigate, useSearchParams } from "react-router-dom"
import logoImg from "@/assets/logo.png"
import { Button } from "@/components/ui/SignUp/button"
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
  Mic
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

// Soundwave & Glowing Mic Hero Graphic matching the prototype design
const SoundwaveHeroGraphic = () => (
  <div className="relative flex items-center justify-center shrink-0 w-24 sm:w-28 h-12 select-none pointer-events-none">
    <svg
      className="w-full h-10 text-blue-600 dark:text-sky-400 overflow-visible"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Animated waveform lines left */}
      <path
        d="M 2 20 Q 8 10, 14 20 T 26 20 T 38 20 T 50 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-75 dark:opacity-90"
      />
      <path d="M 6 20 L 6 12 M 6 20 L 6 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 16 20 L 16 6 M 16 20 L 16 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M 26 20 L 26 14 M 26 20 L 26 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M 36 20 L 36 3 M 36 20 L 36 37" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

      {/* Central mic glow ring background */}
      <circle cx="60" cy="20" r="16" className="fill-blue-500/10 dark:fill-sky-400/15 stroke-blue-500/30 dark:stroke-sky-400/40" strokeWidth="1.5" />
      <circle cx="60" cy="20" r="11" className="fill-blue-600/15 dark:fill-sky-400/25" />

      {/* Animated waveform lines right */}
      <path
        d="M 70 20 Q 76 10, 82 20 T 94 20 T 106 20 T 118 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-75 dark:opacity-90"
      />
      <path d="M 84 20 L 84 3 M 84 20 L 84 37" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M 94 20 L 94 14 M 94 20 L 94 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M 104 20 L 104 6 M 104 20 L 104 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M 114 20 L 114 12 M 114 20 L 114 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>

    {/* Center Microphone Badge */}
    <div className="absolute left-[calc(50%-14px)] top-[calc(50%-14px)] flex items-center justify-center size-7 rounded-full bg-blue-600 dark:bg-sky-400 text-white dark:text-slate-950 shadow-md shadow-blue-500/30 dark:shadow-sky-400/40">
      <Mic className="size-4 stroke-[2.5]" />
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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#0B0F19] text-text-primary dark:text-slate-100 px-4 py-8 sm:px-6 sm:py-12 flex flex-col justify-center transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40 [background:radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.12),transparent_30%),radial-gradient(circle_at_82%_78%,rgba(56,189,248,0.10),transparent_30%)]" />

      {/* Top Bar Navigation */}
      <div className="absolute top-5 left-4 right-4 sm:left-8 sm:right-8 z-20 flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          className="text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-slate-100 font-medium hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
        >
          <Link to="/">
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Home
          </Link>
        </Button>
        <ThemeToggle />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 mx-auto w-full max-w-lg my-auto pt-6 sm:pt-0">
        <div className="w-full rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#0E1322]/95 p-6 sm:p-10 shadow-2xl shadow-slate-300/40 dark:shadow-blue-950/20 backdrop-blur-md transition-all duration-300">
          
          {/* Header Logo */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700/60 p-2 shadow-xs">
              <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain dark:invert dark:brightness-125" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Voice<span className="text-blue-600 dark:text-sky-400">Khata</span>
            </span>
          </div>

          {/* Hero Section with Soundwave Visual */}
          <div className="mb-8 flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight text-slate-900 dark:text-slate-50">
                {showForgot ? (
                  "Reset your password"
                ) : (
                  <>
                    Your ledger is ready<br />
                    when you are.
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-slate-400">
                {showForgot
                  ? "Enter your email to receive a password reset link."
                  : "Sign in to access your business khata."}
              </p>
            </div>

            {/* Soundwave graphic badge on right */}
            {!showForgot && (
              <div className="pt-1">
                <SoundwaveHeroGraphic />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs leading-relaxed">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem("voicekhata_demo_user", "true")
                    } catch {}
                    enableDemoMode?.()
                    navigate("/dashboard", { replace: true })
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  <span>Skip login & enter demo dashboard</span>
                  <ArrowRight className="size-3" />
                </button>
                {showResendVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="font-medium underline hover:opacity-80 block pt-1 cursor-pointer"
                  >
                    {resending ? "Sending..." : "Resend verification instructions"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Info Message */}
          {infoMsg && (
            <div className="mb-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="size-4 shrink-0" />
              <p>{infoMsg}</p>
            </div>
          )}

          {/* Form Content */}
          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary dark:text-slate-400">Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 size-4 text-text-muted dark:text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19] pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-amber-500/20 dark:shadow-amber-500/15 transition-all flex items-center justify-center gap-2 mt-2 hover:scale-[1.01] active:scale-[0.99]"
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? "Sending link..." : "Send Reset Link"}</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false)
                  setError("")
                }}
                className="w-full text-xs text-text-secondary dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-center pt-2 cursor-pointer font-medium"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary dark:text-slate-400">Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 size-4 text-text-muted dark:text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19] pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary dark:text-slate-400">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true)
                      setError("")
                      setInfoMsg("")
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 size-4 text-text-muted dark:text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19] pl-10 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-text-muted dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sky-500 focus:ring-sky-500/20 accent-sky-500 cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-xs font-medium text-text-secondary dark:text-slate-400 cursor-pointer select-none"
                >
                  Remember me on this device
                </label>
              </div>

              {/* Primary Golden CTA Button */}
              <Button
                className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-amber-500/20 dark:shadow-amber-500/15 transition-all flex items-center justify-center gap-2 mt-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? "Signing in..." : "Sign In"}</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </Button>
            </form>
          )}

          {!showForgot && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs text-text-muted dark:text-slate-500 font-medium">or continue with</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Secondary Buttons Stack */}
              <div className="space-y-3">
                {/* Google Sign-In */}
                <Button
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2.5"
                  variant="outline"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <GoogleIcon className="size-4" />
                  <span>{isLoading ? "Please wait..." : "Continue with Google"}</span>
                </Button>

                {/* Explore Demo */}
                <Button
                  asChild
                  className="w-full h-11 rounded-xl border border-sky-500/30 dark:border-sky-500/30 bg-sky-50/50 dark:bg-[#0E1322] hover:bg-sky-100/50 dark:hover:bg-slate-800/80 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem("voicekhata_demo_user", "true")
                    } catch {}
                    enableDemoMode?.()
                  }}
                >
                  <Link to="/dashboard">
                    <Sparkles className="size-4 text-sky-500" />
                    <span>Explore Demo</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              {/* Footer Account Link */}
              <p className="text-text-secondary dark:text-slate-400 text-xs text-center pt-6 font-medium">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 dark:text-sky-400 hover:underline font-semibold inline-flex items-center gap-1 ml-1"
                >
                  Create account
                  <ArrowRight className="size-3" />
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" {...props}>
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
)
