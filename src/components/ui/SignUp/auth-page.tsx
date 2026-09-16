import { useState } from "react"
import logoImg from "@/assets/logo.png"
import { 
  ChevronLeft, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  EyeOff,
  Mic,
  Zap,
  ShieldCheck
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { signUp, signInWithGoogle } from "@/firebase/auth"
import ThemeToggle from "@/components/ui/ThemeToggle"

// Soundwave & Voice Motif matching the VoiceKhata Lime & Charcoal design
const VoiceKhataWaveformGraphic = () => (
  <div className="relative flex items-center justify-center shrink-0 w-24 sm:w-28 h-10 select-none pointer-events-none">
    <svg
      className="w-full h-8 text-[#0B0F15] dark:text-[#D2F832] overflow-visible"
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 4 16 L 4 10 M 4 16 L 4 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M 14 16 L 14 6 M 14 16 L 14 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M 24 16 L 24 12 M 24 16 L 24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 34 16 L 34 2 M 34 16 L 34 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M 44 16 L 44 8 M 44 16 L 44 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* Central mic accent circle */}
      <circle cx="60" cy="16" r="14" className="fill-[#D2F832] text-[#0B0F15]" />
      
      <path d="M 76 16 L 76 8 M 76 16 L 76 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M 86 16 L 86 2 M 86 16 L 86 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M 96 16 L 96 12 M 96 16 L 96 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 106 16 L 106 6 M 106 16 L 106 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M 116 16 L 116 10 M 116 16 L 116 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>

    <div className="absolute left-[calc(50%-12px)] top-[calc(50%-12px)] flex items-center justify-center size-6 rounded-full text-[#0B0F15]">
      <Mic className="size-3.5 stroke-[2.5]" />
    </div>
  </div>
)

export function AuthPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      setError("Please enter your name.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      await signUp(email.trim(), password, fullName.trim())

      setMessage(
        "Account created! We've sent a verification link to your email. Please verify your email before logging in."
      )

      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setFullName("")
    } catch (err: any) {
      const isApiKeyOrDevError =
        err.code === "auth/invalid-api-key" ||
        err.code === "auth/api-key-not-valid" ||
        err.message?.toLowerCase().includes("api-key") ||
        err.message?.toLowerCase().includes("api key")

      if (isApiKeyOrDevError) {
        try {
          localStorage.setItem("voicekhata_demo_user", "true")
        } catch {}
        navigate("/dashboard", { replace: true })
        return
      }

      if (err.code === "auth/email-already-in-use") {
        setError("email-exists")
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error connecting to Firebase. You can explore the demo directly.")
      } else {
        setError(err.message || "Failed to create account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setMessage("")
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
        navigate("/dashboard", { replace: true })
        return
      }

      if (err.code === "auth/popup-closed-by-user") {
        return
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Domain not authorized in Firebase Console. Please add your domain to Authorized Domains.")
      } else {
        setError(err.message || "Google sign-in failed. Please try again.")
      }
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
                Create Your Digital Khata
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Join thousands of Indian retailers managing dues hands-free with voice.
              </p>
            </div>
          </div>

          {/* Success / Verification Message */}
          {message && (
            <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-700 dark:text-emerald-400 space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300 hover:underline pt-1"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                {error === "email-exists" ? (
                  <span>
                    An account with this email already exists.{" "}
                    <Link to="/login" className="font-bold underline hover:no-underline">
                      Sign in here
                    </Link>
                  </span>
                ) : (
                  <span>{error}</span>
                )}
              </div>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full Name / Shop Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Gupta (Gupta Kirana)"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B0F15] dark:focus:ring-white transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password (min. 6 characters)
              </label>
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B0F15] dark:focus:ring-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Create Account Primary CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#0B0F15] hover:bg-black text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer group"
              >
                <span>{isLoading ? "Creating Account..." : "Create Free Account"}</span>
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
              <span>Sign Up with Google</span>
            </button>

          </form>

          {/* Footer link to sign in */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have a VoiceKhata account?{" "}
              <Link to="/login" className="font-bold text-[#0B0F15] dark:text-[#D2F832] hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default AuthPage