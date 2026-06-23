// Vercel serverless function — POST /api/voice
// Body: { text: string }
// TEMPORARY: calls Sarvam AI's Text-to-Speech API (free tier, Indian voices)
// to test the voice pipeline end-to-end before switching back to Fish
// Audio for Dr. Sneha Jain's actual cloned voice once API credit is topped
// up there. This is a stand-in voice, not a clone of her — see README.
//
// Required env var (set in Vercel dashboard, see README):
//   SARVAM_API_KEY — from dashboard.sarvam.ai -> API Keys
//
// Sarvam's TTS endpoint is POST https://api.sarvam.ai/text-to-speech,
// authenticated with the api-subscription-key header. Response contains
// a base64-encoded "audios" array (WAV), not raw binary — must decode
// before sending back to the frontend (we just relay the base64 through).

const FEMALE_SPEAKER = "shreya"; // bulbul:v3 female voice, clear/authoritative tone

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

  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "Server is missing SARVAM_API_KEY" });
    return;
  }

  try {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        text: text.trim(),
        target_language_code: "en-IN",
        speaker: FEMALE_SPEAKER,
        model: "bulbul:v3",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: "Sarvam API error", detail: errText });
      return;
    }

    const data = await response.json();
    const audioBase64 = data.audios && data.audios[0];

    if (!audioBase64) {
      res.status(502).json({ error: "Sarvam API returned no audio", detail: JSON.stringify(data) });
      return;
    }

    // Sarvam already returns base64 WAV — pass it straight through with
    // the matching mime type so the frontend audio player can use it as-is.
    res.status(200).json({ audio: audioBase64, mime: "audio/wav" });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate voice", detail: String(err) });
  }
}
