import { useState, useMemo } from "react";
import { DECK } from "../data/deck";

const SPREAD_SIZE = 3; // past / present / future style 3-card draw
const DESKTOP_BREAKPOINT = 900;

function shuffledIds() {
  return [...DECK]
    .sort(() => Math.random() - 0.5)
    .slice(0, 21)
    .map((c) => c.id);
}

export default function DeckStep({ onComplete }) {
  const [phase, setPhase] = useState("idle"); // idle -> shuffling -> fanned
  const fanIds = useMemo(() => shuffledIds(), []);
  const [picked, setPicked] = useState([]);
  const [justPicked, setJustPicked] = useState(null);

  // Wider spread on desktop so bigger cards (set in CSS) don't overlap as
  // heavily — read once per mount, fine since the fan only renders once
  // per shuffle and doesn't need to react to live window resizing.
  const angleStep =
    typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT ? 6.4 : 4.2;

  function handleShuffle() {
    setPhase("shuffling");
    setTimeout(() => setPhase("fanned"), 900);
  }

  function handlePick(id) {
    if (picked.includes(id) || picked.length >= SPREAD_SIZE) return;
    const next = [...picked, id];
    setPicked(next);
    setJustPicked(id);
    setTimeout(() => setJustPicked(null), 500);
    if (next.length === SPREAD_SIZE) {
      const cards = next.map((cardId) => {
        const base = DECK.find((c) => c.id === cardId);
        return { ...base, reversed: Math.random() < 0.25 };
      });
      setTimeout(() => onComplete(cards), 550);
    }
  }

  return (
    <div className="step deck-step">
      <p className="eyebrow">Step 2 of 3</p>
      <h1 className="display-title">Draw three cards</h1>
      <p className="subtext">
        {phase === "idle" && "Shuffle, then choose three cards by feel — not by thinking."}
        {phase === "shuffling" && "Shuffling…"}
        {phase === "fanned" &&
          (picked.length < SPREAD_SIZE
            ? `Choose ${SPREAD_SIZE - picked.length} more`
            : "Reading the cards…")}
      </p>

      {phase === "idle" && (
        <div className="deck-stack" onClick={handleShuffle} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleShuffle()}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div className="deck-card-back" key={i} style={{ "--i": i }} />
          ))}
          <button className="primary-btn shuffle-btn" type="button" onClick={handleShuffle}>
            Tap to shuffle
          </button>
        </div>
      )}

      {phase === "shuffling" && (
        <div className="deck-stack shuffling">
          {[0, 1, 2, 3, 4].map((i) => (
            <div className="deck-card-back shuffle-anim" key={i} style={{ "--i": i }} />
          ))}
        </div>
      )}

      {phase === "fanned" && (
        <div className="fan-wrap">
          <div className="fan">
            {fanIds.map((id, i) => {
              const angle = (i - (fanIds.length - 1) / 2) * angleStep;
              const isPicked = picked.includes(id);
              const isJustPicked = justPicked === id;
              const isSettledPicked = isPicked && !isJustPicked;
              return (
                <button
                  key={id}
                  type="button"
                  className={`fan-card ${isSettledPicked ? "is-picked" : ""} ${isJustPicked ? "is-just-picked" : ""}`}
                  style={{ "--angle": `${angle}deg`, "--i": i }}
                  onClick={() => handlePick(id)}
                  disabled={isPicked}
                  aria-label="Tarot card, face down"
                >
                  <span className="fan-card-glyph">✦</span>
                </button>
              );
            })}
          </div>
          <div className="pick-dots">
            {Array.from({ length: SPREAD_SIZE }).map((_, i) => (
              <span key={i} className={`dot ${i < picked.length ? "filled" : ""}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
