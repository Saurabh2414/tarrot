import { useState } from "react";

const PROMPTS = [
  "What do I need to know about my career right now?",
  "What's blocking me in love?",
  "What energy should I bring into this month?",
];

export default function QuestionStep({ onSubmit, isReturning }) {
  const [value, setValue] = useState("");

  return (
    <div className="step question-step">
      <div className="reader-credit">
        <img src="/images/dr-sneha-jain.png" alt="Dr. Sneha Jain" className="reader-credit-photo" />
        <span className="reader-credit-text">Readings by Dr. Sneha Jain</span>
      </div>

      <p className="eyebrow">{isReturning ? "Welcome back" : "Begin a reading"}</p>
      <h1 className="display-title">
        What's sitting <em>heavy</em> on your mind?
      </h1>
      <p className="subtext">
        Ask one clear question. The cards answer best when the question is honest.
      </p>

      <textarea
        className="question-input"
        placeholder="Type your question…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={180}
        rows={3}
      />

      <div className="prompt-chips">
        {PROMPTS.map((p) => (
          <button key={p} className="chip" onClick={() => setValue(p)} type="button">
            {p}
          </button>
        ))}
      </div>

      <button
        className="primary-btn"
        disabled={value.trim().length < 4}
        onClick={() => onSubmit(value.trim())}
      >
        Shuffle the deck
      </button>
    </div>
  );
}
