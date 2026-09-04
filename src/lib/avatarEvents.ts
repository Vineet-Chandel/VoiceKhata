// src/lib/avatarEvents.ts
//
// Tiny pub/sub so the sidebar re-fetches the avatar immediately
// after Settings saves — without a page reload.
//
// Usage:
//   emit  → avatarEvents.emit()         (call after successful upload)
//   listen → avatarEvents.on(callback)  (call in sidebar hook)

type Listener = () => void

const listeners = new Set<Listener>()

export const avatarEvents = {
  /** Fire after a successful avatar upload */
  emit() {
    listeners.forEach((fn) => fn())
  },

  /** Subscribe to avatar-updated events. Returns an unsubscribe function. */
  on(fn: Listener): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}