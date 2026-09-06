import { useState } from "react"
import Logo from "@/components/ui/Navbar/logo"
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
    <div className="relative w-full min-h-screen flex items-center justify-center px-6 py-12">
      {/* Back Button */}
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
            Create an Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Start managing your personal finances with VoiceKhata
          </p>
        </div>

        {/* Error Alert */}
        {error && error !== "email-exists" && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {error === "email-exists" && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              An account with this email already exists.{" "}
              <button
                type="button"
                className="font-semibold underline hover:text-text-primary cursor-pointer ml-1"
                onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
              >
                Log in here
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {message && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p>{message}</p>
              <Button
                asChild
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-text-primary font-medium cursor-pointer"
              >
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

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
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  required
                  className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer hover:bg-primary/90 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        )}

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
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
          {isLoading ? "Please wait..." : "Continue with Google"}
        </Button>

        <p className="text-muted-foreground text-xs text-center pt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="underline underline-offset-4 hover:text-primary font-medium text-foreground cursor-pointer inline-flex items-center gap-1"
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