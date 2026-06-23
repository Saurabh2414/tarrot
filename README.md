# Arcana Sessions — Tarot Reading Prototype

A standalone web app: ask a question, draw 3 cards from a fanned deck, get an
AI-personalized tarot reading — now read aloud by Dr. Sneha Jain's cloned
voice — and responsive across mobile and desktop. First reading is free;
second+ is gated behind a paywall stub (no payment wired up yet).

## What's built

- Visual deck: tap to shuffle, pick 3 cards from a fanned spread
- AI reading via Claude API, grounded in actual card meanings + orientation
- Voice avatar: a short spoken intro/outro in Dr. Sneha Jain's cloned voice
  (ElevenLabs), played around the written reading
- Return-user memory: if someone has read before, their last few readings are
  folded into the prompt so the AI can reference their pattern
- Free-reading gate: after reading #1, a "Continue to payment" screen appears
  with a disabled button (payment intentionally not connected yet)
- Responsive: mobile keeps the original single-column flow; desktop (900px+)
  switches the reading screen to a two-pane layout (cards left, reading +
  voice right) and scales up the question/deck steps

## Local setup

```bash
npm install
cp .env.example .env.local
# edit .env.local with your real keys (see below)
npm run dev
```

The frontend runs on Vite. `/api/reading` and `/api/voice` are Vercel
serverless functions — to test them locally you need the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

(Vanilla `npm run dev` will serve the frontend but the `/api/*` calls will
404 — expected until you run `vercel dev` or deploy.)

## Environment variables

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `ELEVENLABS_API_KEY` | elevenlabs.io → Profile → API Keys |
| `ELEVENLABS_VOICE_ID` | elevenlabs.io → Voices → Instant Voice Cloning. Upload a clean ~1-2 min sample of Dr. Sneha Jain's voice (no background noise) to create the clone, then copy the Voice ID it generates. |

Set all three in Vercel: dashboard → your project → Settings → Environment
Variables, then redeploy.

## Deploying to Vercel

1. Push this folder to a GitHub repo (or run `vercel` directly from this folder)
2. Add the three env vars above in the Vercel dashboard
3. Deploy. Vercel auto-detects `api/reading.js` and `api/voice.js` as
   serverless functions — no extra config needed.

## Where user data lives right now

Each user's history and "have they used their free reading" flag live in
**localStorage** in their own browser. There's no real backend database yet,
and no login — a user_id is auto-generated and stored locally.

This is fine for testing the experience, but it will not survive across
devices, and clearing browser data resets their free reading. Before a real
launch, this needs to move to a proper database (Supabase is a good fit) keyed
by phone number or Instagram handle.

## File structure

```
api/reading.js          - serverless function, calls Claude API for the
                           written reading + spoken intro/outro
api/voice.js              - serverless function, calls ElevenLabs TTS with
                             Dr. Sneha Jain's cloned voice
src/data/deck.js         - full 78-card tarot deck + draw logic
src/data/store.js        - localStorage-backed history/gate state
src/components/
  QuestionStep.jsx        - step 1: ask a question
  DeckStep.jsx             - step 2: shuffle + pick 3 cards
  ReadingStep.jsx          - step 3: reveal cards, fetch + show AI reading
                             (two-pane on desktop)
  VoiceAvatar.jsx           - audio player for the cloned-voice intro/outro
  GateStep.jsx             - paywall stub shown after free reading
src/App.jsx              - flow/state machine wiring the steps together
src/index.css            - design tokens + all component styles, including
                           the 900px+ desktop layout
```

## Known gaps to decide on before real launch

- Payment: not connected. Decide pay-per-question vs. credit packs
  before wiring up Razorpay/Stripe. Right now "Start over" lets anyone
  loop back to a free question — that's intentional for testing, but
  needs to be gated for real once payment exists.
- Identity: localStorage only. Move to phone/IG-handle-based accounts.
- Voice cost: ElevenLabs charges per character generated. Every free
  reading currently generates a voice intro/outro at no extra gate —
  worth deciding if voice should be a paid-tier perk before this scales
  to many free users.
- Spread size: currently fixed at 3 cards (past/present/emerging).

