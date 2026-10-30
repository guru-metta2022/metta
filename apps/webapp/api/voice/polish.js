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

    // Heuristic speech-to-text semantic & acoustic purifier fallback
    let polished = raw;

    // 1. Remove speech disfluencies
    polished = polished.replace(/\b(um|uh|er|ah|like|you know|basically|so yeah|i mean)\b/gi, '');

    // 2. Fix multi-word acoustic misrecognitions first
    polished = polished
      .replace(/\bmore Campbell them\b/gi, 'more capable than them')
      .replace(/\bCampbell them\b/gi, 'capable than them')
      .replace(/\bhere the intelligence\b/gi, 'is the intelligence')
      .replace(/\bhear the intelligence\b/gi, 'is the intelligence')
      .replace(/\bHi intelligence\b/gi, 'Higher intelligence')
      .replace(/\bhi intelligence\b/gi, 'higher intelligence')
      .replace(/\bsuper intelligence\b/gi, 'superintelligence')
      .replace(/\bmeta learn\b/gi, 'meta-learn')
      // 3. Fix single-word acoustic misrecognitions
      .replace(/\bsimilarity\b/gi, 'singularity')
      .replace(/\bCampbell\b/gi, 'capable')
      .replace(/\bintellelgence\b/gi, 'intelligence')
      .replace(/\bintellegence\b/gi, 'intelligence')
      .replace(/\bservive\b/gi, 'survive')
      .replace(/\bcompsaniate\b/gi, 'compassionate')
      .replace(/\bharmoniusolyu\b/gi, 'harmoniously')
      .replace(/\bmetalearn\b/gi, 'meta-learn')
      .replace(/\bbackpropaghate\b/gi, 'backpropagate');

    // 4. Clean spacing and capitalize
    polished = polished.replace(/\s+/g, ' ').trim();
    if (polished.length > 0) {
      polished = polished.charAt(0).toUpperCase() + polished.slice(1);
      if (polished.endsWith('.')) {
        if (/\b(is|can|will|should|how|what|why|would|could|singularity)\b/i.test(polished)) {
          polished = polished.slice(0, -1) + '?';
        }
      } else if (!polished.endsWith('?') && !polished.endsWith('!')) {
        if (/\b(is|can|will|should|how|what|why|would|could|singularity)\b/i.test(polished)) {
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
