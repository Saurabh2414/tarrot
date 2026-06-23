import { useState } from "react";
import QuestionStep from "./components/QuestionStep";
import DeckStep from "./components/DeckStep";
import ReadingStep from "./components/ReadingStep";
import GateStep from "./components/GateStep";
import {
  getHistory,
  addReading,
  hasUsedFreeReading,
  markFreeReadingUsed,
} from "./data/store";

// Flow: question -> deck (shuffle/draw) -> reading -> gate (if free already used) -> question again
export default function App() {
  const [stage, setStage] = useState(() =>
    hasUsedFreeReading() ? "gate" : "question"
  );
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState([]);
  const history = getHistory();

  function handleQuestionSubmit(q) {
    setQuestion(q);
    setStage("deck");
  }

  function handleDeckComplete(drawnCards) {
    setCards(drawnCards);
    setStage("reading");
  }

  function handleReadingDone(readingText) {
    addReading({ question, cards, reading: readingText });
    if (!hasUsedFreeReading()) {
      markFreeReadingUsed();
    }
    setStage("gate");
  }

  function handleRestart() {
    setQuestion("");
    setCards([]);
    // Free reading is already used by the time this is reachable —
    // restarting always lands back on the gate, not a fresh free reading.
    setStage("gate");
  }

  return (
    <div className="app-shell">
      <header className="brand-mark">
        <span className="brand-glyph">✦</span>
        <span className="brand-name">Arcana Sessions</span>
      </header>

      {stage === "question" && (
        <QuestionStep onSubmit={handleQuestionSubmit} isReturning={history.length > 0} />
      )}

      {stage === "deck" && <DeckStep onComplete={handleDeckComplete} />}

      {stage === "reading" && (
        <ReadingStep
          question={question}
          cards={cards}
          history={history}
          onDone={handleReadingDone}
        />
      )}

      {stage === "gate" && <GateStep onRestart={handleRestart} />}
    </div>
  );
}
