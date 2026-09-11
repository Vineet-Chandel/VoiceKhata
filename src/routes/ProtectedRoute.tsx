import { Navigate } from "react-router-dom"
import { useAuth } from "@/components/hooks/use-auth"
import { MorphingSquare } from "@/routes/morphingsquare"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, loggingOut, enableDemoMode, isDemoMode } = useAuth()

  if (typeof window !== "undefined") {
    const isDemoStored = localStorage.getItem("voicekhata_demo_user") === "true"
    const hasDemoParam = new URLSearchParams(window.location.search).get("demo") === "true"
    if ((isDemoStored || hasDemoParam) && !user) {
      enableDemoMode?.()
    }
  }

  if (loading || loggingOut) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <MorphingSquare message="Checking authentication..." />
      </div>
    )
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />
  }

  // If email/password user is not verified, redirect to login (demo users are exempt)
  const isGoogle = user?.providerData?.some((p) => p.providerId === "google.com")
  if (user && !user.emailVerified && !isGoogle && !user.isAnonymous) {
    return <Navigate to="/login?unverified=true" replace />
  }

  return <>{children}</>
}