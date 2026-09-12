import { useState } from "react"
import logoImg from "@/assets/logo.png"
import { Button } from "@/components/ui/SignUp/button"
import { ChevronLeft, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { signUp, signInWithGoogle } from "@/firebase/auth"
import ThemeToggle from "@/components/ui/ThemeToggle"

export function AuthPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#0B0F19] text-text-primary dark:text-slate-100 px-4 py-8 sm:px-6 sm:py-12 flex flex-col justify-center transition-colors duration-300">
      {/* Ambient background light */}
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

      <div className="relative z-10 mx-auto w-full max-w-lg my-auto pt-6 sm:pt-0">
        <div className="w-full rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#0E1322]/95 p-6 sm:p-10 shadow-2xl shadow-slate-300/40 dark:shadow-blue-950/20 backdrop-blur-md transition-all duration-300">
          
          {/* Header Logo */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700/60 p-2 shadow-xs">
              <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain dark:invert dark:brightness-125" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Voice<span className="text-blue-600 dark:text-sky-400">Khata</span>
            </span>
          </div>

          <div className="space-y-1.5 text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary dark:text-slate-400">
              Start managing your business ledger with VoiceKhata
            </p>
          </div>

          {/* Error Alert */}
          {error && error !== "email-exists" && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs leading-relaxed">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {error === "email-exists" && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs leading-relaxed">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                An account with this email already exists.{" "}
                <button
                  type="button"
                  className="font-semibold underline hover:opacity-80 cursor-pointer ml-1"
                  onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
                >
                  Log in here
                </button>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {message && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs leading-relaxed">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <div className="space-y-3 w-full">
                <p>{message}</p>
                <Button
                  asChild
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer rounded-xl"
                >
                  <Link to="/login">Go to Login</Link>
                </Button>
              </div>
            </div>
          )}

          {!message && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary dark:text-slate-400">Full Name</label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-3.5 size-4 text-text-muted dark:text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19] pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary dark:text-slate-400">Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 size-4 text-text-muted dark:text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19] pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary dark:text-slate-400">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 size-4 text-text-muted dark:text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="Repeat your password"
                    required
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19] pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-amber-500/20 dark:shadow-amber-500/15 transition-all flex items-center justify-center gap-2 mt-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                disabled={isLoading}
              >
                <span>{isLoading ? "Creating account..." : "Create Account"}</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </Button>
            </form>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-text-muted dark:text-slate-500 font-medium">or continue with</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

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

          <p className="text-text-secondary dark:text-slate-400 text-xs text-center pt-6 font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 dark:text-sky-400 hover:underline font-semibold inline-flex items-center gap-1 ml-1"
            >
              Log in
              <ArrowRight className="size-3" />
            </Link>
          </p>
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