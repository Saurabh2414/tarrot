# Arcana Sessions — Tarot Reading Prototype

A standalone web app: ask a question, draw 3 cards from a fanned deck, get an
AI-personalized tarot reading. First reading is free; second+ is gated behind
a paywall stub (no payment wired up yet — that's intentional for this phase).

## What's built (Phase 1–3 of the roadmap)

- Visual deck: tap to shuffle, pick 3 cards from a fanned spread
- AI reading via Claude API, grounded in actual card meanings + orientation
- Return-user memory: if someone has read before, their last few readings are
  folded into the prompt so the AI can reference their pattern
- Free-reading gate: after reading #1, a "Continue to payment" screen appears
  with a disabled button (payment intentionally not connected yet)

## Local setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your real ANTHROPIC_API_KEY
npm run dev
```

The frontend runs on Vite. The `/api/reading` endpoint is a Vercel serverless
function — to test it locally you need the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

(Vanilla `npm run dev` will serve the frontend but the `/api/reading` calls
will 404 — that's expected until you either run `vercel dev` or deploy.)

## Deploying to Vercel

1. Push this folder to a GitHub repo (or run `vercel` directly from this folder)
2. In the Vercel dashboard -> your project -> Settings -> Environment Variables,
   add `ANTHROPIC_API_KEY` with your real key
3. Deploy. Vercel auto-detects `/api/reading.js` as a serverless function —
   no extra config needed.

## Where user data lives right now

This is intentionally simple for the prototype phase: each user's history and
"have they used their free reading" flag live in **localStorage** in their own
browser. There's no real backend database yet, and no login — a user_id is
auto-generated and stored locally.

This is fine for testing the experience, but it will not survive across
devices, and clearing browser data resets their free reading. Before a real
launch, this needs to move to a proper database (Supabase is a good fit) keyed
by phone number or Instagram handle, so:
- the free-reading gate can't be bypassed by clearing localStorage
- history and "intelligence" memory persists across devices

## File structure

```
api/reading.js          - serverless function, calls Claude API
src/data/deck.js         - full 78-card tarot deck + draw logic
src/data/store.js        - localStorage-backed history/gate state
src/components/
  QuestionStep.jsx        - step 1: ask a question
  DeckStep.jsx             - step 2: shuffle + pick 3 cards
  ReadingStep.jsx          - step 3: reveal cards, fetch + show AI reading
  GateStep.jsx             - paywall stub shown after free reading
src/App.jsx              - flow/state machine wiring the steps together
src/index.css            - design tokens + all component styles
```

## Known gaps to decide on before real launch

- Payment: not connected. Decide pay-per-question vs. credit packs
  before wiring up Razorpay/Stripe.
- Identity: localStorage only. Move to phone/IG-handle-based accounts
  so the free-reading gate is real, not bypassable.
- Spread size: currently fixed at 3 cards (past/present/emerging). The
  original roadmap floated letting users choose spread type (1-card daily
  vs. 3-card) — easy to add as a step before "Shuffle the deck."
