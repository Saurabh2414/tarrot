// Vercel serverless function — POST /api/reading
// Body: { question: string, cards: [{name, reversed, upright, reversed_meaning}], history: [...] }
// Calls the Anthropic API once, with the question + drawn cards + (optionally)
// the user's past readings folded into the prompt, so returning users get a
// reading that references their own pattern over time — not a cold start.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { question, cards, history } = req.body || {};

  if (!question || !Array.isArray(cards) || cards.length === 0) {
    res.status(400).json({ error: "question and cards are required" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
    return;
  }

  const cardLines = cards
    .map((c, i) => {
      const orientation = c.reversed ? "Reversed" : "Upright";
      const meaning = c.reversed ? c.reversed_meaning : c.upright_meaning;
      return `${i + 1}. ${c.name} (${orientation}) — core meaning: ${meaning}`;
    })
    .join("\n");

  let historyBlock = "This is the seeker's first reading. They have no prior history.";
  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-3); // last 3 readings max, keep prompt lean
    historyBlock =
      "The seeker has asked before. Their recent history (oldest to newest):\n" +
      recent
        .map(
          (h, i) =>
            `Reading ${i + 1} (asked: "${h.question}"): cards were ${h.cards
              .map((c) => `${c.name}${c.reversed ? " (reversed)" : ""}`)
              .join(", ")}.`
        )
        .join("\n") +
      "\nWeave a brief, natural thread connecting today's cards to this history where it genuinely fits — do not force a connection if the cards don't support one.";
  }

  const systemPrompt = `You are a warm, perceptive tarot reader. You write personalized readings grounded strictly in the cards given — never invent cards, never contradict a card's stated meaning or orientation.

Rules:
- Address the seeker directly ("you"), warm but not saccharine, no excessive mysticism or clichés like "the universe has a plan."
- Ground every claim in the specific cards and their orientation given below. Do not give generic horoscope text that could apply to any reading.
- Reference the seeker's question directly and specifically.
- If there is reading history, weave in at most one natural callback — only if it truly fits.
- Reading length: 150-220 words. No headers, no bullet points, flowing prose in 2-3 short paragraphs.
- End the written reading with one grounded, actionable line — not a vague platitude.
- Never claim certainty about the future; speak in terms of tendencies, energies, and choices.

You must also write a short SPOKEN intro and outro, as if Dr. Sneha Jain is speaking the words aloud to the seeker before and after they read the full text:
- intro: 1-2 sentences, spoken warmly, said right before the seeker reads the full reading (e.g. acknowledging the question, setting up what the cards showed). Do not repeat the full reading content.
- outro: 1 sentence, spoken warmly, said after the seeker has read the full reading (e.g. a closing thought or gentle encouragement). Do not repeat the actionable line from the reading verbatim.
- Both intro and outro must sound natural when read aloud — contractions are fine, no markdown, no emoji.

Respond ONLY with valid JSON in this exact shape, nothing else, no markdown fences:
{"reading": "...", "intro": "...", "outro": "..."}`;

  const userPrompt = `Seeker's question: "${question}"

Cards drawn (in order):
${cardLines}

${historyBlock}

Write the reading now.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 750,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: "Upstream API error", detail: errText });
      return;
    }

    const data = await response.json();
    const rawText = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    let parsed;
    try {
      // Strip accidental markdown fences just in case the model adds them.
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fall back gracefully: treat the whole thing as the reading body,
      // skip intro/outro rather than failing the whole request.
      parsed = { reading: rawText, intro: "", outro: "" };
    }

    res.status(200).json({
      reading: parsed.reading || "",
      intro: parsed.intro || "",
      outro: parsed.outro || "",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate reading", detail: String(err) });
  }
}
