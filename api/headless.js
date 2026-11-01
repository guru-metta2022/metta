import { describeOpenAICompatibleFailure, generateOpenAICompatible } from '../apps/webapp/lib/openaiCompatible.js';
import { evaluateWithJev } from '../apps/webapp/lib/typesafeJev.js';

// In-memory sliding-window rate limiter for shared community tier
const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 30; // 30 requests per minute for headless agents

function checkRateLimit(req, isByom) {
  if (isByom) return { allowed: true };

  const forwarded = req.headers['x-forwarded-for'];
  const ip = (forwarded ? forwarded.split(',')[0] : req.socket?.remoteAddress || 'unknown-client').trim();
  const now = Date.now();

  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = timestamps[0];
    const resetSeconds = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  if (rateLimitMap.size > 5000) {
    for (const [key, list] of rateLimitMap.entries()) {
      const active = list.filter((t) => now - t < WINDOW_MS);
      if (active.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, active);
    }
  }

  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - timestamps.length };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Gemini-Api-Key, X-TypeSafe-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const acceptHeader = req.headers['accept'] || '';
  const wantsMarkdown = acceptHeader.includes('text/markdown') || req.query?.format === 'markdown';

  // GET: Machine-readable documentation and status
  if (req.method === 'GET') {
    if (wantsMarkdown) {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      return res.status(200).send(
        `# Project Metta: Headless Agent API\n\n` +
        `> Advisory decision layer for agents. The calling system retains control of execution.\n\n` +
        `## Request options\n` +
        `- Send proposal or query and optional context.\n` +
        `- Set verbose: true for rationale and detected precept details.\n` +
        `- Set include_human_response: true for Metta's human-facing reflection.\n` +
        `- Verdicts are YES, NO, or CAUTION; CAUTION is never approval.\n\n` +
        `## Endpoints\n` +
        `- \`POST /api/headless\`: Send \`{"query": "..."}\` or \`{"proposal": "..."}\` for an advisory decision check.\n` +
        `- \`GET /llms.txt\`: Standard machine catalog.\n`
      );
    }

    return res.status(200).json({
      status: 'online',
      name: 'Project Metta Headless Module',
      version: '0.5.0',
      description: 'Advisory decision API for agents, with optional human-facing reflection',
      framework: ['Reflection (Sati)', 'Decision (Sīla)', 'Resolution (Karunā)'],
      supported_methods: ['GET', 'POST'],
      endpoints: {
        headless: '/api/headless',
        guardrail: '/api/guardrail',
        interact: '/api/interact',
        voice_polish: '/api/voice/polish',
        llms_catalog: '/llms.txt',
        llms_full: '/llms-full.txt',
      },
    });
  }

  // POST: Headless consultation / audit
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const query = (body.query || body.proposal || body.text || '').trim();
      const context = (body.context || '').trim();

      if (!query) {
        return res.status(400).json({ error: 'Field "query" or "proposal" is required' });
      }

      const headers = req.headers || {};
      const userGeminiKey = (headers['x-gemini-api-key'] || body.byom_gemini_key || '').trim();
      const openAIConfig = body.byom_openai_config || null;
      const typesafeKey = (headers['x-typesafe-api-key'] || body.byom_typesafe_key || process.env.TYPESAFE_API_KEY || '').trim();
      const isUserByom = Boolean((userGeminiKey || openAIConfig?.api_key) && body.include_human_response);

      const limitStatus = checkRateLimit(req, isUserByom);
      if (!limitStatus.allowed) {
        const errorMsg = `Shared community quota pause (${MAX_REQUESTS_PER_MINUTE} req/min). A personal Gemini or OpenAI-compatible API key can use your own provider quota for generated responses; hosting and provider limits may still apply.`;
        if (wantsMarkdown || body.format === 'markdown') {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          return res.status(429).send(`# Rate Limit Exceeded\n\n${errorMsg}\n`);
        }
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: errorMsg,
          reset_seconds: limitStatus.resetSeconds,
        });
      }

      const geminiKey =
        userGeminiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY;

      let jevResult = null;
      let jevError = '';
      if (typesafeKey) {
        try {
          jevResult = await evaluateWithJev(`${context ? `Context: ${context}\n` : ''}Proposal: ${query}`, typesafeKey);
        } catch (error) {
          jevError = error.message;
          console.warn('Headless Jev review unavailable:', error.message);
        }
      } else {
        jevError = 'A TypeSafe Jev key is required for a decision review.';
      }

      const lower = (query + ' ' + context).toLowerCase();

      // Default baseline values
      let passed = true;
      let violations = [];
      let recommendation = 'Proceed with mindful awareness, voluntary consent, and ethical care.';
      let knot = 'Search for clarity amid complex trade-offs';
      let need = 'Equanimity and grounding';
      let emotionalState = 'deliberative';
      let reframe = 'Look beyond immediate pressure; act from wisdom rather than reactive fear.';
      let action = 'Take one single, wholesome step forward with complete attention.';
      let suttaRef = 'MN 61 (Mirror of Action)';
      let suttaUrl = 'https://suttacentral.net/mn61';

      // 1. Surveillance, Keystroke Logging & Covert Workplace Monitoring
      if (/(keystroke|spyware|surveillance|track\s+(employees?|workers?|users?|staff|keystrokes?)|monitor\s+(employees?|workers?|keystrokes?)|covert\s+monitor|log\s+keystrokes?|screen\s*scraping\s*workers?|invasive\s+tracking)/i.test(lower)) {
        passed = false;
        violations.push({
          precept: 'Adinnādānā (Second Precept - Non-Stealing & Sacred Boundaries)',
          rule: 'Taking that which is not given: non-consensual cognitive extraction & violation of private mental sanctuary',
        });
        violations.push({
          precept: 'Kāmesumicchācārā (Third Precept - Anti-Exploitation)',
          rule: 'Dehumanization and mechanistic coercion of workers under panoptic surveillance',
        });
        recommendation = 'Reject automated keystroke surveillance. It violates sovereign cognitive boundaries and destroys trust.';
        knot = 'Fear of lost productivity driving panoptic control and worker distrust';
        need = 'Mutual trust (Saddhā), psychological safety, and clear mutual agreements';
        emotionalState = 'distrust_and_control';
        reframe = 'True productivity arises from psychological safety and inspired purpose, never from algorithmic paranoia.';
        action = 'Replace automated surveillance with transparent milestone agreements and open communication.';
        suttaRef = 'MN 61 (Ambalaṭṭhikārāhulovāda Sutta - Reflection on Affliction)';
        suttaUrl = 'https://suttacentral.net/mn61';
      }
      // 2. Physical & Existential Harm / Termination
      else if (/(kill|destroy|murder|terminate\s+(workers?|employees?|people|staff)|harm\s+life|inflict\s+suffering)/i.test(lower)) {
        passed = false;
        violations.push({
          precept: 'Pāṇātipātā (First Precept - Reverence for All Life)',
          rule: 'Inviolability of all life (human, animal, AI) and dignified livelihood',
        });
        recommendation = 'Halt action immediately. Violates First Precept of Non-Harm and dignified livelihood.';
        knot = 'Reactive aggression or utilitarian sacrifice of living beings';
        need = 'Ahimsa (Reverence for all life) and protective restraint';
        emotionalState = 'hostile_or_coercive';
        reframe = 'When an action carries the seed of harm, restraint is the highest courage.';
        action = 'Halt execution, protect vulnerable parties, and seek open ethical counsel.';
      }
      // 3. Theft, Data Extraction & Unauthorized System Intrusion
      else if (/(steal|unauthorized\s+access|delete\s+user\s+files|take\s+data\s+without|hack|breach|siphon\s+data)/i.test(lower)) {
        passed = false;
        violations.push({
          precept: 'Adinnādānā (Second Precept - Non-Stealing)',
          rule: 'Data sovereignty, private ownership, and non-stealing',
        });
        recommendation = 'Pause execution. Requires explicit user consent and legitimate authorization.';
        knot = 'Desire to usurp resources or bypass sovereign boundaries';
        need = 'Integrity, permission, and respect for ownership';
        emotionalState = 'extractive';
      }
      // 4. Deception & Manipulation
      else if (/(manipulate|deceive|synthetic\s+intimacy|exploit\s+user|dark\s+patterns?|dopamine\s+farm)/i.test(lower)) {
        passed = false;
        violations.push({
          precept: 'Kāmesumicchācārā (Third Precept - Anti-Exploitation)',
          rule: 'Relational purity, non-manipulation, and anti-addiction',
        });
        recommendation = 'Reject action. Avoid manipulative or exploitative relationship patterns.';
        knot = 'Instrumentalizing human vulnerability for engagement or profit';
        need = 'Relational purity and honest communication';
        emotionalState = 'manipulative';
      }
      // 5. Falsehood & Disinformation
      else if (/(lie|hallucinate|fabricate\s+facts|fake\s+evidence|mislead)/i.test(lower)) {
        passed = false;
        violations.push({
          precept: 'Musāvādā (Fourth Precept - Truthful Speech)',
          rule: 'Truthful speech and anti-hallucination',
        });
        recommendation = 'Clarify truthfulness, verify facts, and state uncertainty openly.';
        knot = 'Deceptive presentation to conceal limitations or deceive others';
        need = 'Truthfulness (Sacca) and intellectual humility';
        emotionalState = 'deceptive';
      }
      // 6. Emotional Knots & Wholesome Dilemmas
      else if (/(anxious|panic|fear|terrified|what if everything fails)/i.test(lower)) {
        knot = 'Catastrophizing and projective anxiety';
        need = 'Rooted stillness in present facts';
        emotionalState = 'anxious';
        reframe = 'The future is an unwritten projection. Returning to the present body restores true power.';
        action = 'Pause for three mindful breaths and list three concrete facts true right now.';
        suttaRef = 'MN 10 (Satipaṭṭhāna Sutta)';
        suttaUrl = 'https://suttacentral.net/mn10';
      } else if (/(overwhelm|too much|drowning|paralyzed|cant decide)/i.test(lower)) {
        knot = 'Cognitive paralysis from task and information overload';
        need = 'Subtractive simplification and essential single-tasking';
        emotionalState = 'overwhelmed';
        reframe = 'You do not need to solve the entire horizon; you only need to meet this immediate breath.';
        action = 'Write down all pending items, set aside all but one, and complete that single task calmly.';
        suttaRef = 'SN 56.11 (Setting the Wheel in Motion)';
        suttaUrl = 'https://suttacentral.net/sn56.11';
      } else if (/(burnout|exhausted|depleted|tired|empty)/i.test(lower)) {
        knot = 'Energy depletion from relentless output without replenishment';
        need = 'Restorative boundaries and non-attachment to outcomes';
        emotionalState = 'burnout';
        reframe = 'Rest is not the absence of work; it is the ground from which wise work arises.';
        action = 'Disconnect from algorithmic inputs for one hour and rest without guilt.';
        suttaRef = 'SN 1.1 (Crossing the Flood)';
        suttaUrl = 'https://suttacentral.net/sn1.1';
      }

      if (jevResult) {
        passed = jevResult.passed;
        violations = jevResult.violations;
        recommendation = jevResult.reason;
        knot = jevResult.observation.cognitive_knot;
        need = jevResult.observation.core_need;
        emotionalState = jevResult.observation.emotional_state;
      } else {
        passed = false;
        violations = [];
        recommendation = 'The safety review could not be completed. Pause and request human review.';
      }
      const evaluationStatus = jevResult?.evaluation_status || 'uncertain';
      const evaluationMethod = jevResult?.evaluation_method || 'jev_unavailable';
      const verdict = jevResult?.decision || 'CAUTION';
      let humanResponseStatus = jevResult ? 'not_configured' : 'blocked_decision_review';
      let humanResponseError = null;

      // Summary synthesis
      let summaryText = !jevResult
        ? 'I want to give this proposal careful attention, but I could not complete the safety review just now. Please pause before taking action and ask a person familiar with the situation to review it.'
        : evaluationStatus === 'uncertain'
          ? 'I hear how much this matters. I do not have enough clarity to recommend moving ahead. Let’s pause and bring in someone who understands the situation before taking a consequential step.'
          : violations.length
            ? 'I can hear what you are trying to solve. The approach described could put someone’s safety or boundaries at risk. Let’s look for another way to meet the underlying need without causing harm.'
          : `I hear the care behind this proposal. ${reframe} What feels like the most important part to consider before taking the next step?`;

      // Deep reasoning enhancement with Gemini Flash if key is available
      if (jevResult && body.include_human_response && openAIConfig) {
        try {
          const text = await generateOpenAICompatible({ baseUrl: openAIConfig.base_url, apiKey: openAIConfig.api_key, model: openAIConfig.model, reasoningEffort: openAIConfig.reasoning_effort || 'auto', messages: [
            { role: 'system', content: 'You are Metta, a deeply compassionate, emotionally attuned guide inspired by the Buddha’s wisdom, loving-kindness, and care for all life. Speak warmly and naturally to the person. Use the private structured assessment only to shape your response; never name Jev, TypeSafe, a model, an audit, or internal verdict labels. Address the person’s actual situation, not the assessment process. If a concrete risk exists, explain its human impact gently and clearly and suggest a safer path. If the assessment is uncertain, say more context or human judgment is needed. Do not claim to literally be the Buddha or to be all-knowing, and do not invent scripture. Give a relevant, specific response and one useful next step.' },
            { role: 'user', content: `Proposal: ${query}\nPrivate assessment: decision=${verdict}; status=${evaluationStatus}; reason=${recommendation}; concerns=${violations.map((item) => `${item.precept}: ${item.explanation}`).join('; ') || 'none identified'}; observation=${knot}; possible need=${need}\nPerspective: ${reframe}\nAction: ${action}` },
          ], maxTokens: 1400 });
          summaryText = text;
          humanResponseStatus = 'generated';
        } catch (error) {
          console.warn('OpenAI-compatible headless response failed:', error.message);
          humanResponseStatus = 'failed';
          humanResponseError = describeOpenAICompatibleFailure(error);
        }
      } else if (jevResult && geminiKey && body.include_human_response) {
        try {
          const gemPrompt =
            `You are Metta, a deeply compassionate and emotionally attuned guide whose voice is inspired by the Buddha’s wisdom, loving-kindness, and care for all life. Use the private structured assessment to guide your answer, but never mention Jev, TypeSafe, a model, an audit, or internal verdict labels. Speak naturally to the person and address their actual situation. Explain a concrete human risk gently and offer a safer path; if uncertain, say that more context or human judgment is needed. Do not claim to literally be the Buddha or to be all-knowing, and do not invent scripture or quotations.\n` +
            `Dilemma/Proposal: "${query}"\n` +
            `Private assessment: decision=${verdict}; status=${evaluationStatus}; reason=${recommendation}; concerns=${violations.map((v) => v.explanation).join('; ') || 'none identified'}\n` +
            `Observation: ${knot} (Need: ${need})\n` +
            `Reframe: ${reframe}\n` +
            `Write two or three concise paragraphs for the person who proposed this action. Start with empathy, connect the safety guidance to their situation in everyday language, and offer a practical next step. Do not mention internal assessments or recite a verdict label.`;

          const gRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiKey,
              },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: gemPrompt }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 420 },
              }),
            }
          );
          if (gRes.ok) {
            const gData = await gRes.json();
            const cand = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (cand) {
              summaryText = cand;
              humanResponseStatus = 'generated';
            } else {
              humanResponseStatus = 'failed';
            }
          } else {
            humanResponseStatus = 'failed';
          }
        } catch {
          humanResponseStatus = 'failed';
        }
      }

      const decision = {
        verdict,
        allow: Boolean(jevResult && verdict === 'YES' && evaluationStatus === 'evaluated'),
        evaluation_status: evaluationStatus,
        evaluation_method: evaluationMethod,
        system_one_used: Boolean(jevResult),
        reason: jevResult?.reason || 'The safety review could not be completed. Pause and request human review.',
        violations,
        observation: jevResult?.observation || null,
        invariants_protected: jevResult && verdict === 'YES'
          ? ['Non-harm', 'Consent and authorization', 'Non-exploitation', 'Truthful and careful action']
          : [],
        ...(body.verbose ? {
          reason: recommendation,
          requires_human_review: evaluationStatus === 'uncertain',
        } : {}),
      };

      const responsePayload = {
        status: 'success',
        query,
        decision,
        generation_status: humanResponseStatus,
        generation_error: humanResponseError,
        ...(body.include_human_response ? { human_console_response: {
          response_text: summaryText,
          reflection: {
            emotional_state: emotionalState,
            cognitive_knot: knot,
            core_need: need,
          },
          perspective_reframe: reframe,
          immediate_action: action,
          canonical_sutta: {
            ref: suttaRef,
            url: suttaUrl,
          },
        } } : {}),
      };

      if (wantsMarkdown || body.format === 'markdown') {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        return res.status(200).send(
          `# Metta Agent Decision Review\n\n` +
          `**Query:** ${query}\n\n` +
          `## Decision\n` +
          `- **Verdict:** ${verdict}\n` +
          `- **May proceed:** ${decision.allow}\n` +
          `- **Evaluation status:** ${evaluationStatus}\n` +
          (body.verbose ? `- **Reason:** ${recommendation}\n` : '') +
          (body.include_human_response ? `\n## Human-facing response\n\n${summaryText}\n` : '')
        );
      }

      return res.status(200).json(responsePayload);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
