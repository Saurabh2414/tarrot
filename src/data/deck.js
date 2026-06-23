// Full 78-card tarot deck with upright/reversed core meanings.
// Used to (a) render card names/art labels, (b) ground the AI prompt so
// readings stay tarot-accurate rather than generic horoscope text.

const majors = [
  ["The Fool", "new beginnings, innocence, a leap of faith", "recklessness, hesitation, missed opportunity"],
  ["The Magician", "willpower, resourcefulness, manifestation", "manipulation, untapped talent, poor planning"],
  ["The High Priestess", "intuition, mystery, the subconscious", "secrets, disconnection from intuition"],
  ["The Empress", "abundance, nurturing, creativity", "neglect, creative block, dependence"],
  ["The Emperor", "structure, authority, stability", "rigidity, control, lack of discipline"],
  ["The Hierophant", "tradition, belief systems, mentorship", "rebellion, breaking convention"],
  ["The Lovers", "union, alignment of values, choice", "imbalance, misaligned values, separation"],
  ["The Chariot", "willpower, determination, victory through control", "lack of direction, aggression, opposition"],
  ["Strength", "courage, patience, quiet resolve", "self-doubt, weakness, insecurity"],
  ["The Hermit", "introspection, solitude, inner guidance", "isolation, withdrawal, loneliness"],
  ["Wheel of Fortune", "cycles, fate, turning points", "resistance to change, bad luck, breaking cycles"],
  ["Justice", "fairness, truth, cause and effect", "unfairness, dishonesty, avoiding accountability"],
  ["The Hanged Man", "surrender, new perspective, pause", "stalling, resistance to letting go"],
  ["Death", "endings, transformation, release", "fear of change, stagnation, resisting transition"],
  ["Temperance", "balance, moderation, patience", "excess, imbalance, impatience"],
  ["The Devil", "attachment, temptation, restriction", "release from bondage, reclaiming power"],
  ["The Tower", "sudden upheaval, revelation, awakening", "avoiding disaster, fear of change"],
  ["The Star", "hope, renewal, inspiration", "discouragement, lack of faith"],
  ["The Moon", "illusion, intuition, the unconscious", "confusion, fear, misreading a situation"],
  ["The Sun", "joy, vitality, success", "temporary setback, lack of clarity"],
  ["Judgement", "reckoning, awakening, inner calling", "self-doubt, refusal to learn from the past"],
  ["The World", "completion, fulfillment, wholeness", "incompletion, delay, shortcuts that backfire"],
];

const suits = [
  { name: "Wands", theme: "passion, action, ambition" },
  { name: "Cups", theme: "emotion, relationships, intuition" },
  { name: "Swords", theme: "thought, conflict, truth" },
  { name: "Pentacles", theme: "material life, work, security" },
];

const courtAndNumber = [
  ["Ace", "a spark, raw potential"],
  ["Two", "a choice or partnership"],
  ["Three", "early growth, collaboration"],
  ["Four", "stability, sometimes stagnation"],
  ["Five", "conflict or loss"],
  ["Six", "recovery, cooperation"],
  ["Seven", "assessment, perseverance"],
  ["Eight", "swift movement or change"],
  ["Nine", "near-completion, resilience"],
  ["Ten", "culmination, an ending or burden"],
  ["Page", "a message, curiosity, a student's energy"],
  ["Knight", "pursuit, momentum, single-minded drive"],
  ["Queen", "mastery turned inward, nurturing command"],
  ["King", "mastery turned outward, authority"],
];

function buildDeck() {
  const deck = majors.map(([name, upright, reversed], i) => ({
    id: `major-${i}`,
    name,
    arcana: "major",
    upright,
    reversed,
  }));

  suits.forEach((suit) => {
    courtAndNumber.forEach(([rank, core]) => {
      deck.push({
        id: `${suit.name.toLowerCase()}-${rank.toLowerCase()}`,
        name: `${rank} of ${suit.name}`,
        arcana: "minor",
        suit: suit.name,
        upright: `${core} — through the lens of ${suit.theme}`,
        reversed: `blocked or inverted ${core.toLowerCase()} — through the lens of ${suit.theme}`,
      });
    });
  });

  return deck;
}

export const DECK = buildDeck();

export function drawCards(count) {
  const shuffled = [...DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card) => ({
    ...card,
    reversed: Math.random() < 0.25, // 25% chance a drawn card is reversed
  }));
}
