import { useEffect, useState } from "react";

// onDone(readingText) is called once the reading is generated, so the parent
// can persist the actual text to history (not a placeholder).
export default function ReadingStep({ question, cards, history, onDone }) {
  const [status, setStatus] = useState("loading"); // loading | done | error
  const [reading, setReading] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchReading() {
      try {
        const payload = {
          question,
          cards: cards.map((c) => ({
            name: c.name,
            reversed: c.reversed,
            upright_meaning: c.upright,
            reversed_meaning: c.reversed,
          })),
          history,
        };

        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        if (!cancelled) {
          setReading(data.reading || "");
          setStatus("done");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    fetchReading();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="step reading-step">
      <p className="eyebrow">Your spread</p>
      <h1 className="display-title">Past, present, and what's forming</h1>

      <div className="drawn-row">
        {cards.map((c, i) => (
          <div className="drawn-card" key={c.id}>
            <div className={`drawn-card-face ${c.reversed ? "reversed" : ""}`}>
              <span className="drawn-card-glyph">✦</span>
              <span className="drawn-card-name">{c.name}</span>
              {c.reversed && <span className="drawn-card-tag">Reversed</span>}
            </div>
            <span className="drawn-card-label">{["Past", "Present", "Emerging"][i]}</span>
          </div>
        ))}
      </div>

      <div className="reading-card">
        {status === "loading" && (
          <div className="reading-loading">
            <span className="spinner" />
            Reading the cards…
          </div>
        )}
        {status === "error" && (
          <div className="reading-error">
            <p>The reading didn't come through. Your question and cards are still saved.</p>
            <button className="ghost-btn" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}
        {status === "done" && (
          <>
            <p className="reading-question">"{question}"</p>
            <p className="reading-text">{reading}</p>
          </>
        )}
      </div>

      {status === "done" && (
        <button className="primary-btn" onClick={() => onDone(reading)}>
          Continue
        </button>
      )}
    </div>
  );
}
