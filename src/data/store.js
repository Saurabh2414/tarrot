// Lightweight client-side "memory" for the prototype phase.
// In production this becomes a real DB row keyed by phone/IG handle —
// for now it's enough to prove out the "remembers your journey" UX
// and the free-reading gate without standing up a backend database.

const USER_KEY = "tarot_user_id";
const HISTORY_KEY = "tarot_history";
const FREE_USED_KEY = "tarot_free_used";

function uid() {
  return "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getUserId() {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = uid();
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addReading({ question, cards, reading }) {
  const history = getHistory();
  history.push({
    date: new Date().toISOString(),
    question,
    cards: cards.map((c) => ({ name: c.name, reversed: c.reversed })),
    reading,
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function hasUsedFreeReading() {
  return localStorage.getItem(FREE_USED_KEY) === "true";
}

export function markFreeReadingUsed() {
  localStorage.setItem(FREE_USED_KEY, "true");
}

// Dev helper — lets you reset state while testing without clearing
// all of localStorage / devtools.
export function resetAll() {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(FREE_USED_KEY);
  localStorage.removeItem(USER_KEY);
}
