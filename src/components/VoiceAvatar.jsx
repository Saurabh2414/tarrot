import { useState, useRef } from "react";

const READER_NAME = "Dr. Sneha Jain";

// Fetches TTS audio for a line of text from /api/voice and plays it.
// Caches the audio per text string so re-clicking play doesn't re-call the API.
export default function VoiceAvatar({ intro, outro }) {
  const [status, setStatus] = useState("idle"); // idle | loading | playing | error
  const [playingWhich, setPlayingWhich] = useState(null); // "intro" | "outro"
  const [errorDetail, setErrorDetail] = useState("");
  const audioRef = useRef(null);
  const cacheRef = useRef({});

  async function getAudioUrl(text) {
    if (cacheRef.current[text]) return cacheRef.current[text];

    const res = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      let detail = `Request failed (${res.status})`;
      try {
        const errBody = await res.json();
        detail = errBody.error || errBody.detail || detail;
      } catch {
        // response wasn't JSON, keep the generic status message
      }
      throw new Error(detail);
    }

    const data = await res.json();
    if (!data.audio) throw new Error("No audio returned");
    const url = `data:${data.mime};base64,${data.audio}`;
    cacheRef.current[text] = url;
    return url;
  }

  async function handlePlay(which, text) {
    if (!text) return;
    setStatus("loading");
    setPlayingWhich(which);
    setErrorDetail("");
    try {
      const url = await getAudioUrl(text);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setStatus("playing");
      }
    } catch (err) {
      setErrorDetail(err.message || "Unknown error");
      setStatus("error");
    }
  }

  function handleEnded() {
    setStatus("idle");
    setPlayingWhich(null);
  }

  function statusText() {
    if (status === "error") return "Voice unavailable right now";
    if (status === "loading") return "Loading voice…";
    if (status === "playing") return "Speaking…";
    return "Tap to hear her take";
  }

  if (!intro && !outro) return null;

  return (
    <div className="voice-avatar">
      <audio ref={audioRef} onEnded={handleEnded} hidden />
      <div className="voice-avatar-row">
        <div className={`voice-avatar-badge ${status === "playing" ? "is-speaking" : ""}`}>
          <img src="/images/dr-sneha-jain.png" alt="Dr. Sneha Jain" className="voice-avatar-photo" />
        </div>
        <div className="voice-avatar-meta">
          <span className="voice-avatar-name">{READER_NAME}</span>
          <span className="voice-avatar-sub">{statusText()}</span>
        </div>
        <button
          type="button"
          className="voice-play-btn"
          onClick={() => handlePlay("intro", intro)}
          disabled={status === "loading"}
          aria-label="Play voice introduction"
        >
          {status === "loading" && playingWhich === "intro" ? "…" : "▶"}
        </button>
      </div>

      {status === "error" && errorDetail && (
        <p className="voice-error-detail">{errorDetail}</p>
      )}

      {outro && (
        <button
          type="button"
          className="voice-outro-btn"
          onClick={() => handlePlay("outro", outro)}
          disabled={status === "loading"}
        >
          {status === "loading" && playingWhich === "outro"
            ? "Loading…"
            : "▶ Hear her closing thought"}
        </button>
      )}
    </div>
  );
}
