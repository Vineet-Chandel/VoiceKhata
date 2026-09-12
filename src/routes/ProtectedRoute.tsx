import { Navigate } from "react-router-dom"
import { useAuth } from "@/components/hooks/use-auth"
import { MorphingSquare } from "@/routes/morphingsquare"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, loggingOut } = useAuth()

  if (loading || loggingOut) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <MorphingSquare message="Checking authentication..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If email/password user is not verified, redirect to login
  const isGoogle = user?.providerData?.some((p) => p.providerId === "google.com")
  if (!user.emailVerified && !isGoogle && !user.isAnonymous) {
    return <Navigate to="/login?unverified=true" replace />
  }

  return <>{children}</>
}