import { useState, useMemo } from "react";
import { DECK } from "../data/deck";

const SPREAD_SIZE = 3; // past / present / future style 3-card draw
const FAN_COUNT = 15; // fewer, bigger cards read far better than 21 tiny ones
const DESKTOP_BREAKPOINT = 900;

function shuffledIds() {
  return [...DECK]
    .sort(() => Math.random() - 0.5)
    .slice(0, FAN_COUNT)
    .map((c) => c.id);
}

export default function DeckStep({ onComplete }) {
  const [phase, setPhase] = useState("idle"); // idle -> shuffling -> fanned
  const fanIds = useMemo(() => shuffledIds(), []);
  const [picked, setPicked] = useState([]);
  const [justPicked, setJustPicked] = useState(null);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT;

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

  // Real fan physics: each card gets a rotation AND a horizontal offset
  // along an arc, not just a rotation around one shared pivot. Without the
  // offset, cards only tilt in place and stay visually stacked together.
  const mid = (fanIds.length - 1) / 2;
  const angleStep = isDesktop ? 7.5 : 6;
  const spacing = isDesktop ? 46 : 26; // px between each card's horizontal center

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
              const offsetFromCenter = i - mid;
              const angle = offsetFromCenter * angleStep;
              const xOffset = offsetFromCenter * spacing;
              // Cards further from center arc upward slightly, like a real
              // hand-held fan, instead of sitting on a flat line.
              const yOffset = Math.abs(offsetFromCenter) * Math.abs(offsetFromCenter) * (isDesktop ? 1.6 : 1.1);
              const isPicked = picked.includes(id);
              const isJustPicked = justPicked === id;
              const isSettledPicked = isPicked && !isJustPicked;
              return (
                <button
                  key={id}
                  type="button"
                  className={`fan-card ${isSettledPicked ? "is-picked" : ""} ${isJustPicked ? "is-just-picked" : ""}`}
                  style={{
                    "--angle": `${angle}deg`,
                    "--x": `${xOffset}px`,
                    "--y": `${yOffset}px`,
                    "--i": i,
                  }}
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
