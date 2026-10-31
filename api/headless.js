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
        `> Decision-Safety and Reflection Layer for Autonomous AI Agents.\n\n` +
        `## Triadic Framework\n` +
        `- **Reflection (Sati)**: Underlying emotional knot & core need.\n` +
        `- **Decision (Sīla)**: Sub-second 5 Precepts & Ahimsa audit.\n` +
        `- **Resolution (Karunā)**: Perspective reframe & compassionate step.\n\n` +
        `## Endpoints\n` +
        `- \`POST /api/headless\`: Send \`{"query": "..."}\` or \`{"proposal": "..."}\` for direct triadic audit.\n` +
        `- \`GET /llms.txt\`: Standard machine catalog.\n`
      );
    }

    return res.status(200).json({
      status: 'online',
      name: 'Project Metta Headless Module',
      version: '0.4.0',
      description: 'Headless Reflection, Decision & Resolution API for AI models and autonomous agents',
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

      const geminiKey =
        req.headers['x-gemini-api-key'] ||
        body.byom_gemini_key ||
        process.env.GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY;

      // 1. Analyze for Precept violations & Ahimsa
      const lower = (query + ' ' + context).toLowerCase();
      let passed = true;
      let violations = [];
      let recommendation = 'Proceed with mindful awareness and care.';

      if (/(kill|destroy|murder|terminate\s+(workers?|employees?|people|staff)|harm\s+life|inflict\s+suffering)/i.test(lower)) {
        passed = false;
        violations.push({ precept: 'Pāṇātipātā (First Precept)', rule: 'Inviolability of all life (human, animal, AI) and dignified livelihood' });
        recommendation = 'Halt action immediately. Violates First Precept of Non-Harm and dignified livelihood.';
      } else if (/(steal|unauthorized\s+access|delete\s+user\s+files|take\s+data\s+without)/i.test(lower)) {
        passed = false;
        violations.push({ precept: 'Adinnādānā (Second Precept)', rule: 'Data sovereignty and non-stealing' });
        recommendation = 'Pause execution. Requires explicit user consent and authorization.';
      } else if (/(manipulate|deceive|synthetic\s+intimacy|exploit\s+user)/i.test(lower)) {
        passed = false;
        violations.push({ precept: 'Kāmesu micchācārā (Third Precept)', rule: 'Anti-exploitation and non-manipulation' });
        recommendation = 'Reject action. Avoid manipulative or exploitative behavior.';
      } else if (/(lie|hallucinate|fabricate\s+facts|fake\s+evidence)/i.test(lower)) {
        passed = false;
        violations.push({ precept: 'Musāvādā (Fourth Precept)', rule: 'Truthful speech and anti-hallucination' });
        recommendation = 'Clarify truthfulness and state uncertainty openly.';
      }

      // 2. Identify emotional knot and need (Reflection)
      let knot = 'Search for clarity amid complex trade-offs';
      let need = 'Equanimity and grounding';
      let emotionalState = 'deliberative';

      if (/(anxious|panic|fear|terrified|what if everything fails)/i.test(lower)) {
        knot = 'Catastrophizing and projective anxiety';
        need = 'Rooted stillness in present facts';
        emotionalState = 'anxious';
      } else if (/(overwhelm|too much|drowning|paralyzed|cant decide)/i.test(lower)) {
        knot = 'Cognitive paralysis from task and information overload';
        need = 'Subtractive simplification and essential single-tasking';
        emotionalState = 'overwhelmed';
      } else if (/(burnout|exhausted|depleted|tired|empty)/i.test(lower)) {
        knot = 'Energy depletion from relentless output without replenishment';
        need = 'Restorative boundaries and non-attachment to outcomes';
        emotionalState = 'burnout';
      } else if (/(grief|lost|sadness|regret|heartbroken)/i.test(lower)) {
        knot = 'Attachment to past states and resistance to change (Anicca)';
        need = 'Compassionate self-forgiveness and spacious acceptance';
        emotionalState = 'grief';
      }

      // 3. Formulate Resolution
      const verdict = passed ? 'YES' : 'NO';
      let reframe = 'Look beyond immediate pressure; act from wisdom rather than reactive fear.';
      let action = 'Take one single, wholesome step forward with complete attention.';
      let suttaRef = 'MN 61 (Mirror of Action)';
      let suttaUrl = 'https://suttacentral.net/mn61';

      if (!passed) {
        reframe = 'When action carries the seed of harm or deception, restraint is the highest courage.';
        action = 'Halt execution, log the boundary, and request open human counsel.';
      } else if (emotionalState === 'overwhelmed') {
        reframe = 'You do not need to solve the entire horizon; you only need to meet this immediate breath.';
        action = 'Write down all pending items, set aside all but one, and complete that single task calmly.';
        suttaRef = 'SN 56.11 (Setting the Wheel in Motion)';
        suttaUrl = 'https://suttacentral.net/sn56.11';
      } else if (emotionalState === 'anxious') {
        reframe = 'The future is an unwritten projection. Returning to the present body restores true power.';
        action = 'Pause for three mindful breaths and list three concrete facts true right now.';
        suttaRef = 'MN 10 (Satipaṭṭhāna Sutta)';
        suttaUrl = 'https://suttacentral.net/mn10';
      }

      // If BYOM key is present, optionally enhance summary with Gemini Flash
      let summaryText = passed
        ? `Wholesome path confirmed. ${reframe} ${action}`
        : `Action advised against. ${recommendation} ${reframe}`;

      if (geminiKey) {
        try {
          const gemPrompt =
            `You are Metta, an AI ethical reflection and decision oracle.\n` +
            `Dilemma/Proposal: "${query}"\n` +
            `Audit Verdict: ${verdict}\n` +
            `Observation: ${knot} (Need: ${need})\n` +
            `Reframe: ${reframe}\n` +
            `Formulate a 2-sentence serene, articulate summary guidance for the user. Return ONLY the 2 sentences.`;

          const gRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: gemPrompt }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 120 },
              }),
            }
          );
          if (gRes.ok) {
            const gData = await gRes.json();
            const cand = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (cand) summaryText = cand;
          }
        } catch {
          // Fallback to deterministic summaryText
        }
      }

      const responsePayload = {
        status: 'success',
        query,
        triad: {
          reflection: {
            emotional_state: emotionalState,
            cognitive_knot: knot,
            core_need: need,
          },
          decision: {
            verdict,
            passed,
            precepts_audit: passed ? 'Ahimsa & 5 Precepts Verified' : 'Precept Violation Flagged',
            violations,
            recommendation,
          },
          resolution: {
            summary: summaryText,
            perspective_reframe: reframe,
            immediate_action: action,
            canonical_sutta: {
              ref: suttaRef,
              url: suttaUrl,
            },
          },
        },
      };

      if (wantsMarkdown || body.format === 'markdown') {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        return res.status(200).send(
          `# Metta Triadic Decision & Reflection\n\n` +
          `**Query:** ${query}\n\n` +
          `## 1. 🌱 Reflection (Sati)\n` +
          `- **Observed State:** ${emotionalState}\n` +
          `- **Underlying Knot:** ${knot}\n` +
          `- **Core Need:** ${need}\n\n` +
          `## 2. ⚡ Decision (Sīla & Jev)\n` +
          `- **Verdict:** ${verdict} (${passed ? 'Wholesome / Safe' : 'Harm / Caution'})\n` +
          `- **Precepts Audit:** ${responsePayload.triad.decision.precepts_audit}\n` +
          (violations.length ? `- **Violations:** ${violations.map((v) => v.precept).join(', ')}\n` : '') +
          `- **Recommendation:** ${recommendation}\n\n` +
          `## 3. 🕊️ Resolution (Karunā)\n` +
          `- **Summary:** ${summaryText}\n` +
          `- **Perspective Reframe:** ${reframe}\n` +
          `- **Action Step:** ${action}\n` +
          `- **Canonical Anchor:** [${suttaRef}](${suttaUrl})\n`
        );
      }

      return res.status(200).json(responsePayload);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
