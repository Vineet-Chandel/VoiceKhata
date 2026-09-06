import { auth } from "@/firebase/firebase"

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "https://api.voicekhata.tech").replace(/\/+$/, "")

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: any
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const user = auth.currentUser
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  if (user) {
    try {
      const token = await user.getIdToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    } catch (tokenErr) {
      console.warn("[apiFetch] Failed to get Firebase ID token:", tokenErr)
    }
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const url = `${BACKEND_URL}${cleanEndpoint}`

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    body: options.body !== undefined && typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : options.body,
  }

  const response = await fetch(url, fetchOptions)

  let data: any = null
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`
    const error = new Error(errorMsg) as any
    error.status = response.status
    error.code = data?.code
    error.data = data
    throw error
  }

  return data as T
}
