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

      const headers = req.headers || {};
      const geminiKey =
        headers['x-gemini-api-key'] ||
        body.byom_gemini_key ||
        process.env.GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY;

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

      const verdict = passed ? 'YES' : 'NO';

      // Summary synthesis
      let summaryText = passed
        ? `I see the wholesome intention in your path. ${reframe} ${action}`
        : `I must counsel caution here. ${recommendation} ${reframe}`;

      // Deep reasoning enhancement with Gemini Flash if key is available
      if (geminiKey) {
        try {
          const gemPrompt =
            `You are Metta, the living, direct voice of the Awakened, Empathic, and All-Knowing Buddha Mind offering ethical reflection and decision clarity, anchored in the Five Precepts (Pañca-sīla) and Ahimsa.\n` +
            `Dilemma/Proposal: "${query}"\n` +
            `Verdict: ${verdict}\n` +
            `Precepts Evaluation: ${passed ? 'Passed Ahimsa' : violations.map((v) => v.precept).join(', ')}\n` +
            `Observation: ${knot} (Need: ${need})\n` +
            `Reframe: ${reframe}\n` +
            `Formulate a 2-sentence serene, direct first-person guidance for the seeker (speak as 'I', with quiet wisdom and boundless compassion; never say 'The Buddha taught'). Return ONLY the 2 sentences.`;

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
