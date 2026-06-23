// Vercel serverless function — POST /api/voice
// Body: { text: string }
// Calls ElevenLabs Text-to-Speech with Dr. Sneha Jain's cloned voice and
// returns the audio as base64, so the frontend can play it without a
// second round trip or temporary file storage.
//
// Required env vars (set in Vercel dashboard, see README):
//   ELEVENLABS_API_KEY   — from elevenlabs.io account settings
//   ELEVENLABS_VOICE_ID  — the Voice ID created via Instant Voice Cloning
//                          using a sample of Dr. Sneha Jain's voice

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

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    res.status(500).json({
      error: "Server is missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID",
    });
    return;
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: "ElevenLabs API error", detail: errText });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    res.status(200).json({ audio: base64Audio, mime: "audio/mpeg" });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate voice", detail: String(err) });
  }
}
