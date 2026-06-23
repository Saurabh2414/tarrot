export default function GateStep({ onRestart }) {
  return (
    <div className="step gate-step">
      <p className="eyebrow">Your free reading is complete</p>
      <h1 className="display-title">
        Ready for your <em>next</em> question?
      </h1>
      <p className="subtext">
        Every question deserves its own spread. Continuing unlocks another reading —
        personalized to you, remembering what the cards have already shown.
      </p>

      <div className="gate-card">
        <div className="gate-row">
          <span>Next reading</span>
          <strong>₹49</strong>
        </div>
        <button className="primary-btn" disabled title="Payment not wired up yet">
          Continue to payment
        </button>
        <p className="gate-note">Payment isn't connected yet — this button is a placeholder.</p>
      </div>

      <button className="ghost-btn" onClick={onRestart}>
        Start over
      </button>
    </div>
  );
}
