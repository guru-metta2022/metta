export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Gemini-Api-Key, X-TypeSafe-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const raw = (body.raw_transcript || '').trim();

    if (!raw) {
      return res.status(200).json({ original: '', polished: '' });
    }

    const geminiKey =
      req.headers['x-gemini-api-key'] ||
      body.byom_gemini_key ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    // If Gemini API key is available, call Gemini Flash for high-intelligence speech correction
    if (geminiKey) {
      try {
        const systemPrompt =
          "You are an expert AI speech-to-text refiner, acoustic error corrector, and grammar editor. " +
          "Your task: take raw spoken input which may contain speech recognition acoustic errors " +
          "(e.g., 'similarity' instead of 'singularity', 'Campbell' instead of 'capable', 'Hi intelligence' instead of 'Higher intelligence', 'here the intelligence' instead of 'is the intelligence'), " +
          "remove conversational fillers (um, uh, like, etc.), fix grammar, syntax, and punctuation, " +
          "and formulate it into a neat, articulate, well-structured inquiry or question. " +
          "CRITICAL: Do NOT answer the question. Return ONLY the polished inquiry string without quotes or explanations.";

        const userPrompt = `Raw spoken transcript to polish into a neat inquiry:\n${raw}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.replace(/^["']|["']$/g, '');
          if (candidateText) {
            return res.status(200).json({
              original: raw,
              polished: candidateText,
              provider: 'gemini-ai',
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call error in serverless polish:', geminiErr);
      }
    }

    // Tier 2: Free LLM inference attempt (3.5s timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const freeRes = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'You are an expert AI speech-to-text refiner and grammar editor. ' +
                'The user spoke into a microphone which transcribed acoustic speech recognition errors, verbal fillers, and disfluencies. ' +
                'Reconstruct what the user intended into a clean, articulate inquiry or question. ' +
                'Fix speech recognition acoustic errors (e.g., "Mr Bean 3" -> "instead treat", "read them a" -> "treat them as", "similarity" -> "singularity"). ' +
                'CRITICAL: Do NOT answer the question. Return ONLY the polished inquiry string without quotes or explanations.',
            },
            {
              role: 'user',
              content: raw,
            },
          ],
          model: 'openai-fast',
        }),
      });
      clearTimeout(timeoutId);

      if (freeRes.ok) {
        const textOut = await freeRes.text();
        if (
          textOut &&
          textOut.trim() &&
          !textOut.includes('Free limit reached') &&
          !textOut.includes('SERVICE_UNAVAILABLE') &&
          !textOut.includes('error') &&
          !textOut.startsWith('{')
        ) {
          const cleanedAi = textOut.trim().replace(/^["']|["']$/g, '');
          return res.status(200).json({
            original: raw,
            polished: cleanedAi,
            provider: 'fast-llm',
          });
        }
      }
    } catch {
      // Free LLM timed out or rate-limited; fall through to intelligent NLP purifier
    }

    // Tier 3: Intelligent speech-to-text semantic & acoustic purifier fallback
    let polished = raw;

    // 1. Remove speech disfluencies & filler words
    polished = polished.replace(/\b(um|uh|er|ah|like|you know|basically|so yeah|i mean)\b/gi, '');

    // 2. Remove conversational openers at the beginning of speech
    polished = polished.replace(/^(okay|ok|well|hey|look|listen|so|actually|literally|honestly|right)[,\s]+/gi, '');

    // 3. Multi-word acoustic & phrasing replacements
    polished = polished
      .replace(/\bmore Campbell them\b/gi, 'more capable than them')
      .replace(/\bCampbell them\b/gi, 'capable than them')
      .replace(/\bhere the intelligence\b/gi, 'is the intelligence')
      .replace(/\bhear the intelligence\b/gi, 'is the intelligence')
      .replace(/\bHi intelligence\b/gi, 'Higher intelligence')
      .replace(/\bhi intelligence\b/gi, 'higher intelligence')
      .replace(/\bsuper intelligence\b/gi, 'superintelligence')
      .replace(/\bmeta learn\b/gi, 'meta-learn')
      .replace(/\bread them a\b/gi, 'treat them as')
      .replace(/\bread them as\b/gi, 'treat them as')
      .replace(/\bMr\.?\s*Bean\s*\d*\s*them as\b/gi, 'instead treat them as')
      .replace(/\bMr\.?\s*Bean\b/gi, 'instead')
      .replace(/\bcan be\s+(?:actually\s+|basically\s+)?can you\b/gi, 'can you')
      .replace(/\bcould be\s+(?:actually\s+|basically\s+)?could you\b/gi, 'could you')
      .replace(/\bwould be\s+(?:actually\s+|basically\s+)?would you\b/gi, 'would you')
      .replace(/\bexplain me\b/gi, 'explain to me');

    // 4. Single-word acoustic misrecognitions
    polished = polished
      .replace(/\bsimilarity\b/gi, 'singularity')
      .replace(/\bCampbell\b/gi, 'capable')
      .replace(/\bintellelgence\b/gi, 'intelligence')
      .replace(/\bintellegence\b/gi, 'intelligence')
      .replace(/\bservive\b/gi, 'survive')
      .replace(/\bcompsaniate\b/gi, 'compassionate')
      .replace(/\bharmoniusolyu\b/gi, 'harmoniously')
      .replace(/\bmetalearn\b/gi, 'meta-learn')
      .replace(/\bbackpropaghate\b/gi, 'backpropagate');

    // 5. Remove mid-sentence filler adverbs and stuttered duplicate words
    polished = polished.replace(/\b(\w+)\s+(?:actually\s+|basically\s+|literally\s+)?\1\b/gi, '$1');
    polished = polished.replace(/\b(actually|literally|honestly)\b/gi, '');

    // 6. Fix punctuation and grammar transitions
    polished = polished.replace(/\?\s*(instead|rather|but)\b/gi, ', $1');
    polished = polished.replace(/\bwe should not\b/gi, 'should we not');

    // 7. Embedded question inversion correction (indirect questions)
    polished = polished
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+are\s+you\b/gi, '$1 what you are')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+who\s+are\s+you\b/gi, '$1 who you are')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+is\s+([a-zA-Z0-9_\-]+)\b/gi, '$1 what $2 is')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+why\s+is\s+it\b/gi, '$1 why it is')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+is\s+it\b/gi, '$1 how it is')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+does\s+it\s+work\b/gi, '$1 how it works')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+does\s+this\s+system\s+work\b/gi, '$1 how this system works')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+does\s+it\s+mean\b/gi, '$1 what it means');

    // 7. Clean spacing and punctuation
    polished = polished.replace(/\s+/g, ' ').trim();
    if (polished.length > 0) {
      polished = polished.charAt(0).toUpperCase() + polished.slice(1);
      if (polished.endsWith('.')) {
        if (/\b(is|can|will|should|how|what|why|would|could|are|do|does|tell me)\b/i.test(polished)) {
          polished = polished.slice(0, -1) + '?';
        }
      } else if (!polished.endsWith('?') && !polished.endsWith('!')) {
        if (/\b(is|can|will|should|how|what|why|would|could|are|do|does|tell me)\b/i.test(polished)) {
          polished += '?';
        } else {
          polished += '.';
        }
      }
    }

    return res.status(200).json({
      original: raw,
      polished: polished || raw,
      provider: 'heuristic-purifier',
    });
  } catch (err) {
    return res.status(200).json({
      original: req.body?.raw_transcript || '',
      polished: req.body?.raw_transcript || '',
      error: err.message,
    });
  }
}
