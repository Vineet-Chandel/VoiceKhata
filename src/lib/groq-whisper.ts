// src/lib/groq-whisper.ts

export async function transcribeAudioBlob(blob: Blob): Promise<string> {
  const apiKey = (import.meta.env.VITE_GROQ_API_KEY as string)?.trim()

  if (!apiKey) {
    console.warn("[GroqWhisper] VITE_GROQ_API_KEY is not defined in environment. Skipping cloud Whisper fallback.")
    return ""
  }

  try {
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
    // Bilingual prompt: signals to Whisper to recognize Hindi, Hinglish, and English financial terms
    formData.append("prompt", "रमेश ने 500 रुपये दिए। Paid 200 for groceries. सुरेश को 300 उधार दिए। UPI, Cash.")

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "")
      console.warn(`[GroqWhisper] API error ${response.status}:`, errorBody)
      return ""
    }

    const data = await response.json()
    const text = (data?.text || "").trim()

    // Reject Urdu/Arabic script output — Whisper sometimes confuses Hindi with Urdu.
    // Arabic Unicode block: \u0600-\u06FF. If majority of non-ASCII chars are Arabic, reject.
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length
    const devanagariChars = (text.match(/[\u0900-\u097F]/g) || []).length
    if (arabicChars > 0 && arabicChars >= devanagariChars) {
      console.warn("[GroqWhisper] Rejected Urdu/Arabic script output, will use WebSpeech fallback:", text)
      return ""
    }

    // Filter out known Whisper silence hallucinations
    const cleaned = text.toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, "").trim()
    const silenceStopwords = new Set([
      "the", "a", "an", "you", "so", "and", "or", "it", "to", "in", "is", "of",
      "bye", "goodbye", "thank you", "thanks", "thank you for watching", "subtitles by",
      "amaraorg", "subscribe", "please subscribe", "watching", "silence", "music"
    ])

    if (silenceStopwords.has(cleaned) || cleaned.length <= 2) {
      console.log("[GroqWhisper] Ignored silence hallucination:", text)
      return ""
    }

    if (text.length < 35 && ["subtitles by", "thank you for watching", "amara.org"].some((h) => text.toLowerCase().includes(h))) {
      console.log("[GroqWhisper] Ignored silence hallucination:", text)
      return ""
    }

    console.log("[GroqWhisper] Transcribed text:", text)
    return text
  } catch (err) {
    console.warn("[GroqWhisper] Network or fetch error:", err)
    return ""
  }
}
