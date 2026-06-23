// Vercel serverless function — POST /api/voice
// Body: { text: string }
// Calls Fish Audio's Text-to-Speech API with Dr. Sneha Jain's cloned voice
// and returns the audio as base64, so the frontend can play it without a
// second round trip or temporary file storage.
//
// Required env vars (set in Vercel dashboard, see README):
//   FISH_AUDIO_API_KEY     — from fish.audio account -> API Keys
//   FISH_AUDIO_REFERENCE_ID — the voice's reference/model ID. Either:
//     (a) a voice you created at fish.audio/voice-clone using a sample of
//         Dr. Sneha Jain's voice (the dashboard gives you this ID), or
//     (b) one you created via POST /v1/references/add yourself.
//
// Fish Audio's TTS endpoint is POST https://api.fish.audio/v1/tts,
// authenticated with a Bearer token, referencing a previously-created
// voice via "reference_id" in the request body.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body || {};

  if (!text || typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const apiKey = process.env.FISH_AUDIO_API_KEY;
  const referenceId = process.env.FISH_AUDIO_REFERENCE_ID;

  if (!apiKey || !referenceId) {
    res.status(500).json({
      error: "Server is missing FISH_AUDIO_API_KEY or FISH_AUDIO_REFERENCE_ID",
    });
    return;
  }

  try {
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: text.trim(),
        reference_id: referenceId,
        format: "mp3",
        // s2-pro per Fish Audio's recommended default model for quality.
        model: "s2-pro",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: "Fish Audio API error", detail: errText });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    res.status(200).json({ audio: base64Audio, mime: "audio/mpeg" });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate voice", detail: String(err) });
  }
}
