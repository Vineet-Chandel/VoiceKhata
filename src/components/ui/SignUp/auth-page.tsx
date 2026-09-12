import { useState } from "react"
import Logo from "@/components/ui/logo"
import { Button } from "@/components/ui/SignUp/button"
import { ChevronLeft, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { signUp, signInWithGoogle } from "@/firebase/auth"

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
      if (err.code === "auth/email-already-in-use") {
        setError("email-exists")
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.")
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
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-12 bg-[#0F172A]">
      {/* Back Button */}
      <Button asChild className="absolute top-6 left-6 text-[#94A3B8] hover:text-[#F8FAFC]" variant="ghost">
        <Link to="/">
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Home
        </Link>
      </Button>

      <div className="w-full max-w-sm rounded-[12px] border border-[#334155] bg-[#1E293B] p-7 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-center">
          <Logo size="md" />
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Create an Account
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Start managing your business ledger with VoiceKhata
          </p>
        </div>

        {/* Error Alert */}
        {error && error !== "email-exists" && (
          <div className="flex items-start gap-2.5 p-3 rounded-[8px] bg-[#7F1D1D]/30 border border-[#EF4444]/30 text-[#F87171] text-xs leading-relaxed">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {error === "email-exists" && (
          <div className="flex items-start gap-2.5 p-3 rounded-[8px] bg-[#7F1D1D]/30 border border-[#EF4444]/30 text-[#F87171] text-xs leading-relaxed">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              An account with this email already exists.{" "}
              <button
                type="button"
                className="font-semibold underline hover:text-white cursor-pointer ml-1"
                onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
              >
                Log in here
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {message && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-[8px] bg-[#064E3B]/30 border border-[#10B981]/30 text-[#34D399] text-xs leading-relaxed">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p>{message}</p>
              <Button
                asChild
                size="sm"
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-medium cursor-pointer"
              >
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full rounded-[8px] border border-[#334155] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#5C6BC0]"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-[8px] border border-[#334155] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#5C6BC0]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  className="w-full rounded-[8px] border border-[#334155] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#5C6BC0]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  required
                  className="w-full rounded-[8px] border border-[#334155] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#5C6BC0]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-9 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] text-white text-xs font-semibold cursor-pointer mt-1 shadow-xs"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        )}

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
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#818CF8] hover:underline font-semibold inline-flex items-center gap-1 ml-1"
          >
            Log in
            <ArrowRight className="size-3" />
          </Link>
        </p>
      </div>
    </div>
  )
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M21.35 11.1h-9.17v2.92h5.27c-.23 1.5-1.73 4.41-5.27 4.41-3.17 0-5.75-2.63-5.75-5.88s2.58-5.88 5.75-5.88c1.8 0 3.01.77 3.7 1.44l2.52-2.44C17.24 3.5 14.94 2.5 12.18 2.5 6.99 2.5 2.75 6.74 2.75 12s4.24 9.5 9.43 9.5c5.44 0 9.05-3.82 9.05-9.2 0-.62-.07-1.1-.15-1.2z" />
  </svg>
)