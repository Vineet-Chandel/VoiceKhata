// src/lib/groq-whisper.ts

export async function transcribeAudioBlob(blob: Blob): Promise<string> {
  const apiKey = (import.meta.env.VITE_GROQ_API_KEY as string)?.trim()

  if (!apiKey) {
    console.error("[GroqWhisper] VITE_GROQ_API_KEY is not defined in environment.")
    throw new Error("Voice AI transcription is unconfigured (missing GROQ API key).")
  }

  // Ensure blob has a valid extension for Whisper API
  const extension = blob.type.includes("webm")
    ? "webm"
    : blob.type.includes("mp4")
    ? "mp4"
    : blob.type.includes("ogg")
    ? "ogg"
    : "wav"

  const file = new File([blob], `audio.${extension}`, {
    type: blob.type || `audio/${extension}`,
  })

  const formData = new FormData()
  formData.append("file", file)
  formData.append("model", "whisper-large-v3-turbo")
  formData.append("response_format", "json")
  formData.append("temperature", "0")
  // Bilingual prompt conditioning trained on avksr/VoiceKhata ledger patterns
  formData.append(
    "prompt",
    "VoiceKhata khata ledger entries: Ramesh ne 500 rupaye diye, Suresh ko 1200 udhar diya, Gupta Kirana 2000 jama, Sunil ne 350 ka samaan liya, रमेश को 500 रुपये उधार दिए, सुरेश ने 1200 जमा किया, ₹, Rs, rupees, paid, received, diya, mila, liye, UPI, Cash, Bank Transfer, GPay, Paytm, PhonePe, kharcha, udhar, jama, balance."
  )

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    console.error(`[GroqWhisper] API error ${response.status}:`, errorBody)
    throw new Error(`Whisper transcription failed: ${response.statusText}`)
  }

  const data = await response.json()
  const text = (data?.text || "").trim()
  console.log("[GroqWhisper] Transcribed text:", text)
  return text
}
