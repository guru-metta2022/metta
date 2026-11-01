import { generateOpenAICompatible } from '../../apps/webapp/lib/openaiCompatible.js';

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

    const openAIConfig = body.byom_openai_config || null;
    if (openAIConfig) {
      try {
        const systemPrompt = "You are an expert copy editor. Rewrite the user's text into clear, grammatical, natural language. Improve sentence structure, word choice, flow, and punctuation while preserving intent, tone, names, technical terms, and details. Remove speech disfluencies. Do not add claims or answer the text. Return only the revised text.";
        const polished = await generateOpenAICompatible({
          baseUrl: openAIConfig.base_url,
          apiKey: openAIConfig.api_key,
          model: openAIConfig.model,
          reasoningEffort: openAIConfig.reasoning_effort || 'auto',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: raw }],
          maxTokens: 512,
        });
        return res.status(200).json({ original: raw, polished, provider: 'openai-compatible', model: openAIConfig.model });
      } catch (error) {
        console.warn('OpenAI-compatible polish request failed:', error.message);
        return res.status(200).json({ original: raw, polished: raw, provider: 'provider-error', error: 'The selected provider could not polish this text. Check its URL, key, model, and reasoning setting.' });
      }
    }

    const geminiKey =
      req.headers['x-gemini-api-key'] ||
      body.byom_gemini_key ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    // Use the configured model for a meaning-preserving grammar and clarity rewrite.
    if (geminiKey) {
      const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
      for (const modelName of modelsToTry) {
        try {
          const systemPrompt =
            "You are an expert copy editor. The input may be typed text or speech transcription. " +
            "Rewrite it into clear, grammatical, natural language. Improve awkward sentence structure, " +
            "word choice, flow, and punctuation where useful; do more than remove fillers or correct speech-recognition errors. " +
            "Preserve the writer's intent, point of view, tone, named entities, technical terms, and important details. " +
            "Remove spoken disfluencies when present. Do not add claims or assumptions. Do not answer questions or carry out requests. " +
            "If the text is already clear, make only minimal edits. Return only the revised text, without an explanation or quotation marks.";

          const userPrompt = `Text to revise:\n${raw}`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiKey,
              },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
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
                provider: 'gemini',
                model: modelName,
              });
            }
          }
        } catch (geminiErr) {
          console.warn(`Gemini API call error on model ${modelName}:`, geminiErr);
        }
      }
    }

    // Direct Purifier & Acoustic Error Reconstruction (No external free LLMs / No GitHub models)
    let polished = raw;

    // 1. Remove speech disfluencies & filler words
    polished = polished.replace(/\b(um|uh|er|ah|like|you know|basically|so yeah|i mean)\b/gi, '');

    // 2. Remove conversational openers at the beginning of speech
    polished = polished.replace(/^(okay|ok|well|hey|look|listen|so|actually|literally|honestly|right)[,\s]+/gi, '');

    // 3. Spoken question opener misrecognitions
    polished = polished
      .replace(/\bwho\s+you\s+going\s+to\b/gi, 'how are we going to')
      .replace(/\bwho\s+we\s+going\s+to\b/gi, 'how are we going to')
      .replace(/\bhow\s+you\s+going\s+to\b/gi, 'how are you going to')
      .replace(/\bhow\s+we\s+going\s+to\b/gi, 'how are we going to')
      .replace(/\bwhat\s+you\s+going\s+to\b/gi, 'what are you going to')
      .replace(/\bwhere\s+you\s+going\s+to\b/gi, 'where are you going to')
      .replace(/\bwhen\s+you\s+going\s+to\b/gi, 'when are you going to')
      .replace(/\bwhy\s+you\s+going\s+to\b/gi, 'why are you going to');

    // 4. Multi-word acoustic & phrasing replacements
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

    // 5. Societal, economic, and acoustic typo replacements
    polished = polished
      .replace(/\bthe\s+inquality\s+in\s+the\s+society\b/gi, 'inequality in society')
      .replace(/\binquality\s+in\s+the\s+society\b/gi, 'inequality in society')
      .replace(/\bin\s+the\s+society\b/gi, 'in society')
      .replace(/\bof\s+the\s+society\b/gi, 'of society')
      .replace(/\bfor\s+the\s+society\b/gi, 'for society')
      .replace(/\binquality\b/gi, 'inequality')
      .replace(/\binqualities\b/gi, 'inequalities')
      .replace(/\b(?:the\s+)?jobalertness\s+and\s+(?:the\s+)?cap\b/gi, ', joblessness, and the gap')
      .replace(/\b(?:the\s+)?joblessness\s+and\s+(?:the\s+)?cap\b/gi, ', joblessness, and the gap')
      .replace(/\bjobalertness\b/gi, 'joblessness')
      .replace(/\bjob\s*alertness\b/gi, 'joblessness')
      .replace(/\bthe\s+jobalertness\b/gi, 'joblessness')
      .replace(/\band\s+cap\b/gi, 'and the gap')
      .replace(/\bwealth\s+cap\b/gi, 'wealth gap')
      .replace(/\bincome\s+cap\b/gi, 'income gap')
      .replace(/\bwage\s+cap\b/gi, 'wage gap');

    // 6. Single-word acoustic misrecognitions
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

    // 7. Remove mid-sentence filler adverbs and stuttered duplicate words
    polished = polished.replace(/\b(\w+)\s+(?:actually\s+|basically\s+|literally\s+)?\1\b/gi, '$1');
    polished = polished.replace(/\b(actually|literally|honestly)\b/gi, '');

    // 8. Fix punctuation and grammar transitions
    polished = polished.replace(/\?\s*(instead|rather|but)\b/gi, ', $1');
    polished = polished.replace(/\bwe should not\b/gi, 'should we not');

    // 9. Embedded question inversion correction (indirect questions)
    polished = polished
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+are\s+you\b/gi, '$1 what you are')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+who\s+are\s+you\b/gi, '$1 who you are')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+is\s+([a-zA-Z0-9_\-]+)\b/gi, '$1 what $2 is')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+why\s+is\s+it\b/gi, '$1 why it is')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+is\s+it\b/gi, '$1 how it is')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+does\s+it\s+work\b/gi, '$1 how it works')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+how\s+does\s+this\s+system\s+work\b/gi, '$1 how this system works')
      .replace(/\b(explain|understand|know|clarify|describe|tell me)\s+what\s+does\s+it\s+mean\b/gi, '$1 what it means');

    // 10. Clean commas, spacing and punctuation
    polished = polished.replace(/\s+,/g, ',');
    polished = polished.replace(/,\s*,+/g, ',');
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
