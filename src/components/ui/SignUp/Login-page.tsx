import { useState, useEffect } from "react"
import { Navigate, Link, useNavigate, useSearchParams } from "react-router-dom"
import logoImg from "@/assets/logo.png"
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
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-12 bg-[#0F172A]">
      <Button asChild className="absolute top-6 left-6 text-[#94A3B8] hover:text-[#F8FAFC]" variant="ghost">
        <Link to="/">
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Home
        </Link>
      </Button>

      <div className="w-full max-w-sm rounded-[12px] border border-[#334155] bg-[#1E293B] p-7 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-[8px] bg-[#1E293B] border border-[#5C6BC0]/30 p-1.5 shadow-xs">
            <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
          </div>
          <span className="text-lg font-bold text-[#F8FAFC]">Voice<span className="text-[#818CF8]">Khata</span></span>
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            {showForgot ? "Reset Password" : "Your ledger is ready when you are."}
          </h1>
          <p className="text-[#94A3B8] text-xs">
            {showForgot
              ? "Enter your email to receive a password reset link"
              : "Sign in to access your business khata"}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-[8px] bg-[#7F1D1D]/30 border border-[#EF4444]/30 text-[#F87171] text-xs leading-relaxed">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p>{error}</p>
              {showResendVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="font-medium underline hover:text-[#F87171]/80 block pt-1 cursor-pointer"
                >
                  {resending ? "Sending..." : "Resend verification instructions"}
                </button>
              )}
            </div>
          </div>
        )}

        {infoMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-[8px] bg-[#064E3B]/30 border border-[#10B981]/30 text-[#34D399] text-xs">
            <CheckCircle2 className="size-4 shrink-0" />
            <p>{infoMsg}</p>
          </div>
        )}

        {showForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#94A3B8]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-[8px] border border-[#334155] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5C6BC0]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full h-9 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] text-white text-xs font-semibold cursor-pointer shadow-xs"
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
              className="w-full text-xs text-[#94A3B8] hover:text-[#F8FAFC] text-center pt-1 cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-[8px] border border-[#334155] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5C6BC0]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#94A3B8]">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true)
                    setError("")
                    setInfoMsg("")
                  }}
                  className="text-xs text-[#818CF8] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-[8px] border border-[#334155] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5C6BC0]"
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
                className="size-3.5 rounded border-[#334155] accent-[#5C6BC0] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-[#94A3B8] cursor-pointer select-none"
              >
                Remember me on this device
              </label>
            </div>

            <Button
              className="w-full h-9 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] text-white text-xs font-semibold cursor-pointer mt-1 shadow-xs"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {!showForgot && (
          <>
            <div className="flex items-center gap-3 my-3">
              <div className="h-px flex-1 bg-[#334155]" />
              <span className="text-[11px] text-[#94A3B8]">or continue with</span>
              <div className="h-px flex-1 bg-[#334155]" />
            </div>

            <Button
              className="w-full h-9 rounded-[8px] border border-[#334155] bg-[#0F172A] hover:bg-[#253349] text-xs font-semibold text-[#F8FAFC] cursor-pointer transition-colors"
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Please wait..." : "Continue with Google"}
            </Button>

            <p className="text-[#94A3B8] text-xs text-center pt-2">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#818CF8] hover:underline font-semibold inline-flex items-center gap-1 ml-1"
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