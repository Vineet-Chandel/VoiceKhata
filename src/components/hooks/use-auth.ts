import { useAuth as useAuthContext } from "@/context/AuthContext"

export function useAuth() {
  return useAuthContext()
}
