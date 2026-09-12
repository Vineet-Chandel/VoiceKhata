import * as React from "react"
import { useAuth } from "@/components/hooks/use-auth"
import { getUserProfile } from "@/firebase/user"
import { hasCustomAvatar, getAvatarPublicUrl } from "@/lib/avatar"
import { avatarEvents } from "@/lib/avatarEvents"

export function useResolvedAvatar() {
  const { user } = useAuth()

  const fallback = user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.displayName || user?.email || "U"
    )}&background=000&color=fff`

  const [avatar, setAvatar] = React.useState<string>(fallback)

  const fetchAvatar = React.useCallback(async () => {
    if (!user) return
    try {
      const profile = await getUserProfile()
      if (profile?.profile_pic) {
        setAvatar(`${profile.profile_pic}?t=${Date.now()}`)
        return
      }

      const hasOwn = await hasCustomAvatar(user.uid)
      if (hasOwn) {
        setAvatar(getAvatarPublicUrl(user.uid))
        return
      }

      if (user.photoURL) {
        setAvatar(user.photoURL)
        return
      }

      setAvatar(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.displayName || user.email || "U"
        )}&background=000&color=fff`
      )
    } catch {
      // Keep whatever is currently shown on failure
    }
  }, [user?.uid, user?.photoURL])

  React.useEffect(() => {
    fetchAvatar()
  }, [fetchAvatar])

  React.useEffect(() => {
    return avatarEvents.on(fetchAvatar)
  }, [fetchAvatar])

  return avatar
}
