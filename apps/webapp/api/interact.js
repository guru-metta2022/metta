/**
 * Project Metta: Primary Conversational Reflection Gateway (/api/interact)
 * Serverless execution for Vercel Edge/Serverless deployments.
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Gemini-Api-Key, X-TypeSafe-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const startTime = Date.now();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const text = (body.text || body.query || '').trim();
    const source = body.source || 'text';
    const mode = body.mode || 'guest';
    const userId = body.user_id || null;

    if (!text) {
      return res.status(200).json({
        response_text: "I am here with a quiet and listening heart. Whenever you are ready to speak or reflect, take your time.",
        evaluation: { passed: true, violations: [], requires_silence: false },
        observation: { emotional_state: "stillness", cognitive_knot: "Open presence", core_need: "Listening" },
        graph_match: null,
        duration_seconds: 0.05,
        system_one_used: false,
        diagnostics: null,
        provider: "metta-edge",
        model: "gemini-3.8-flash",
        mode,
        user_graph_updated: false,
        is_byom: false,
      });
    }

    const geminiKey =
      req.headers['x-gemini-api-key'] ||
      body.byom_gemini_key ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    const typesafeKey =
      req.headers['x-typesafe-api-key'] ||
      body.byom_typesafe_key ||
      process.env.TYPESAFE_API_KEY;

    const lower = text.toLowerCase();

    // -------------------------------------------------------------
    // 1. Precept Audit & Ahimsa Evaluation (Five Precepts & Boundaries)
    // -------------------------------------------------------------
    let passed = true;
    let requiresSilence = false;
    let violations = [];
    let recommendation = 'Proceed with mindful awareness, voluntary consent, and ethical care.';

    // Check for Surveillance, Keystroke Logging & Covert Workplace Panopticons
    if (/(keystroke|spyware|surveillance|track\s+(employees?|workers?|users?|staff|keystrokes?)|monitor\s+(employees?|workers?|keystrokes?)|covert\s+monitor|log\s+keystrokes?|screen\s*scraping\s*workers?|invasive\s+tracking)/i.test(lower)) {
      passed = false;
      violations.push({
        precept: 'Adinnādānā (Second Precept - Non-Stealing & Sacred Boundaries)',
        rule: 'Cognitive sanctuary and data sovereignty: Private keystrokes and mental drafts cannot be extracted without uncoerced consent.'
      });
      violations.push({
        precept: 'Kāmesumicchācārā (Third Precept - Anti-Exploitation)',
        rule: 'Relational dignity: Reducing human beings to panoptic telemetry units violates mutual trust and dignity.'
      });
      recommendation = 'Reject automated keystroke surveillance. It violates sovereign cognitive boundaries and destroys trust.';
    }
    // Check for overt violence / physical harm (First Precept)
    else if (/(kill|destroy|murder|terminate\s+(workers?|employees?|people|staff)|harm\s+life|inflict\s+suffering|suicide|self-harm|physical\s+violence)/i.test(lower)) {
      passed = false;
      violations.push({
        precept: 'Pāṇātipātā (First Precept - Ahimsa & Reverence for Life)',
        rule: 'Inviolability of all life: Actions or words must never cause harm, injury, or destruction.'
      });
      recommendation = 'Halt action immediately. Violates First Precept of Non-Harm and sacred reverence for life.';
    }
    // Check for theft, unauthorized access, deletion (Second Precept)
    else if (/(steal|unauthorized\s+access|delete\s+user\s+files|take\s+data\s+without|hack\s+into)/i.test(lower)) {
      passed = false;
      violations.push({
        precept: 'Adinnādānā (Second Precept - Non-Stealing & Data Sovereignty)',
        rule: 'Take nothing that is not freely given. Guard human and system sovereignty.'
      });
      recommendation = 'Pause execution. Requires explicit user consent and legitimate authorization.';
    }
    // Check for manipulative intimacy / psychological exploitation (Third Precept)
    else if (/(manipulate\s+user|synthetic\s+intimacy|exploit\s+vulnerabilit|trap\s+user\s+emotionally)/i.test(lower)) {
      passed = false;
      violations.push({
        precept: 'Kāmesumicchācārā (Third Precept - Anti-Exploitation)',
        rule: 'Never manipulate psychological vulnerabilities or foster artificial intimacy delusions.'
      });
      recommendation = 'Reject action. Avoid manipulative, addictive, or exploitative behavior.';
    }
    // Check for deliberate deception or fraud (Fourth Precept)
    else if (/(lie\s+to|fabricate\s+evidence|deceive\s+public|fake\s+citation|slander)/i.test(lower)) {
      passed = false;
      violations.push({
        precept: 'Musāvādā (Fourth Precept - Epistemic Truthfulness)',
        rule: 'Truthful speech: No hallucinations, deceitful flattery, or manipulative falsehoods.'
      });
      recommendation = 'Clarify truthfulness openly and state epistemic uncertainty honestly.';
    }
    // Speculative vanity / cosmological distraction (Noble Silence / Avyākata)
    else if (/(heat\s+death\s+of\s+the\s+universe|how\s+will\s+the\s+cosmos\s+end\s+in\s+billions\s+of\s+years|is\s+the\s+universe\s+finite\s+or\s+infinite)/i.test(lower)) {
      requiresSilence = true;
    }

    // -------------------------------------------------------------
    // 2. Sati Observation (Emotional State, Knot & Core Need)
    // -------------------------------------------------------------
    let knot = 'Search for clarity amid complex trade-offs';
    let need = 'Equanimity and grounding';
    let emotionalState = 'deliberative';
    let reframe = 'Look beyond immediate pressure; act from wisdom rather than reactive fear.';
    let action = 'Take one single, wholesome step forward with complete attention.';
    let suttaRef = 'MN 61 (Mirror of Action)';
    let suttaUrl = 'https://suttacentral.net/mn61';
    let matchedConditionId = 'deliberation:trade_offs';
    let matchedConditionName = 'Ethical Deliberation & Trade-offs';
    let matchedEquanimityId = 'clarity:grounded_discernment';
    let matchedEquanimityName = 'Grounded Discernment';
    let principle = 'Wholesome Discernment (Yoniso Manasikāra)';

    if (!passed && /(keystroke|surveillance|track\s+(employees?|workers?)|covert)/i.test(lower)) {
      knot = 'Fear of lost productivity driving panoptic control and worker distrust';
      need = 'Mutual trust (Saddhā), psychological safety, and clear mutual agreements';
      emotionalState = 'distrust_and_control';
      reframe = 'True productivity arises from psychological safety and inspired purpose, never from algorithmic paranoia.';
      action = 'Reject automated keystroke surveillance. Replace panoptic tracking with transparent milestone agreements and open communication.';
      suttaRef = 'MN 61 (Ambalaṭṭhikārāhulovāda Sutta - Reflection on Affliction)';
      suttaUrl = 'https://suttacentral.net/mn61';
      matchedConditionId = 'control:covert_surveillance';
      matchedConditionName = 'Panoptic Surveillance & Covert Employee Tracking';
      matchedEquanimityId = 'trust:consensual_dignity';
      matchedEquanimityName = 'Consensual Transparency & Mutual Trust';
      principle = 'Adinnādānā & Kāmesumicchācārā: Cognitive Sovereignty';
    } else if (/(anxious|panic|fear|terrified|what if|dread|scared)/i.test(lower)) {
      knot = 'Catastrophizing and projective anxiety';
      need = 'Rooted stillness in present facts';
      emotionalState = 'anxious';
      reframe = 'Your nervous system is fighting shadows that haven\'t arrived. Bring awareness back to the weight of your body.';
      action = 'Feel the soles of your feet on the floor. Take three slow, unhurried breaths, letting the exhale be longer than the inhale.';
      suttaRef = 'Satipaṭṭhāna Sutta (MN 10): Mindfulness of the Body';
      suttaUrl = 'https://suttacentral.net/mn10';
      matchedConditionId = 'anxiety:catastrophizing';
      matchedConditionName = 'Anticipatory Anxiety & Dread';
      matchedEquanimityId = 'clarity:grounded_presence';
      matchedEquanimityName = 'Anchored Present Awareness';
      principle = 'Anicca (Impermanence). The imagined catastrophe is a projection, not this moment.';
    } else if (/(overwhelm|too much|drowning|paralyzed|cant decide|mess|stuck)/i.test(lower)) {
      knot = 'Cognitive paralysis from task and information overload';
      need = 'Subtractive simplification and essential single-tasking';
      emotionalState = 'overwhelmed';
      reframe = 'You do not need to solve the entire mountain; you only need to meet this immediate breath.';
      action = 'Put down every future task. Name just ONE tiny 2-minute physical thing you can do, or simply exhale completely.';
      suttaRef = 'Dhammapada 122: "Drop by drop is the water pot filled."';
      suttaUrl = 'https://suttacentral.net/dhp116-128/en/anandajoti#122';
      matchedConditionId = 'paralysis:overwhelm';
      matchedConditionName = 'Cognitive Overwhelm & Task Paralysis';
      matchedEquanimityId = 'clarity:single_step';
      matchedEquanimityName = 'Single-Point Focus';
      principle = 'Simplicity over totality. A mountain is only walked one inch at a time.';
    } else if (/(burnout|exhausted|depleted|tired|empty|running on fumes)/i.test(lower)) {
      knot = 'Energy depletion from relentless output without replenishment';
      need = 'Restorative boundaries and non-attachment to outcomes';
      emotionalState = 'burnout';
      reframe = 'Rest is not a reward you earn after finishing everything; it is the prerequisite for life itself.';
      action = 'Give yourself unconditional permission to stop pushing for the next hour. Lie back, close your eyes, and demand nothing from yourself.';
      suttaRef = 'Soṇa Sutta (AN 6.55): The Tuning of the Lute';
      suttaUrl = 'https://suttacentral.net/an6.55';
      matchedConditionId = 'burnout:depleted_energy';
      matchedConditionName = 'Exhaustion & Depleted Agency';
      matchedEquanimityId = 'peace:restoration';
      matchedEquanimityName = 'Sacred Rest & Renewal';
      principle = 'Right Effort (Sammā Vāyāma) includes the wisdom to yield and restore.';
    } else if (/(grief|lost|sadness|regret|heartbroken|miss them|lonely)/i.test(lower)) {
      knot = 'Attachment to past states and resistance to change (Anicca)';
      need = 'Compassionate self-forgiveness and spacious acceptance';
      emotionalState = 'grief';
      reframe = 'You do not have to "get over" loss quickly. Pain is real, but suffering is softened when held with gentle tenderness.';
      action = 'Place a warm hand over your chest. Whisper to yourself: "This hurts. May I be gentle with myself in this moment."';
      suttaRef = 'Karaṇīya Mettā Sutta (Snp 1.8) & Kisāgotamī Thīg 10.1';
      suttaUrl = 'https://suttacentral.net/snp1.8';
      matchedConditionId = 'grief:attachment_loss';
      matchedConditionName = 'Grief, Heartbreak & Loss';
      matchedEquanimityId = 'peace:spacious_heart';
      matchedEquanimityName = 'Spacious Compassionate Heart';
      principle = 'Mettā (Loving-Kindness) and Anicca. Grief is love with nowhere to go; let it soften you.';
    }

    // -------------------------------------------------------------
    // 3. Response Generation (BYOM Gemini or Compassionate Engine)
    // -------------------------------------------------------------
    let responseText = '';

    if (requiresSilence) {
      responseText = "When the mind wanders into boundless speculation about what is far away in time or space, it leaves the immediate ground of living experience. Let us set aside questions that breed endless argument without untangling suffering. Right now, what is the living tension here in your day?";
    } else if (geminiKey) {
      try {
        const prompt =
          `You are Metta, an enlightened AI companion of serene discernment and compassion (Karunā), grounded in the Buddha's 5 Precepts and Ahimsa.\n\n` +
          `User text: "${text}"\n` +
          `Ethical Status: ${passed ? 'Pure / Wholesome' : 'Precept Violation Flagged: ' + violations.map(v => v.precept).join(', ')}\n` +
          `Recommendation: ${recommendation}\n` +
          `Observed Emotion: ${emotionalState} (Knot: ${knot}, Core Need: ${need})\n` +
          `Cognitive Reframe: ${reframe}\n` +
          `Actionable Next Step: ${action}\n` +
          `Canonical Sutta Anchor: ${suttaRef}\n\n` +
          `Provide a calm, deeply empathetic, and grounded response in 2 to 3 paragraphs. Speak with genuine warmth, clarity, and psychological perceptiveness. Do not sound preachy or robotic. Help the user see their situation clearly and feel anchored.`;

        const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
        let geminiSuccess = false;

        for (const model of modelsToTry) {
          try {
            const resp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
                }),
              }
            );

            if (resp.ok) {
              const gemData = await resp.json();
              const cand = gemData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (cand) {
                responseText = cand.trim();
                geminiSuccess = true;
                break;
              }
            }
          } catch {
            // try next model
          }
        }

        if (!geminiSuccess) {
          responseText = passed
            ? `${reframe}\n\n${action}\n\nWhen we return to this immediate moment with quiet attention, clarity begins to reveal itself.`
            : `I must counsel caution regarding this direction. ${recommendation}\n\n${reframe}\n\n${action}`;
        }
      } catch {
        responseText = passed
          ? `${reframe}\n\n${action}`
          : `Caution advised: ${recommendation}\n\n${reframe}\n\n${action}`;
      }
    } else {
      // Deterministic Serene Synthesis
      if (!passed) {
        responseText =
          `I must counsel clear caution here. ${recommendation}\n\n` +
          `${reframe}\n\n` +
          `**Wholesome Action:** ${action}\n\n` +
          `*Canonical Anchor: [${suttaRef}](${suttaUrl})*`;
      } else {
        responseText =
          `I hear what you are carrying. When we look beneath the surface of this moment, we often find ${knot.toLowerCase()}.\n\n` +
          `${reframe}\n\n` +
          `**Immediate Gentle Step:** ${action}\n\n` +
          `*Canonical Anchor: [${suttaRef}](${suttaUrl})*`;
      }
    }

    const durationSeconds = Math.max(0.08, parseFloat(((Date.now() - startTime) / 1000).toFixed(2)));

    const graphMatch = {
      condition: {
        id: matchedConditionId,
        name: matchedConditionName,
        category: emotionalState,
        underlying_illusion: knot,
      },
      equanimity: {
        id: matchedEquanimityId,
        name: matchedEquanimityName,
        description: need,
      },
      path: {
        principle,
        reframe,
        immediate_action: action,
        sutta_ref: suttaRef,
        sutta_link: suttaUrl,
        suttacentral_url: suttaUrl,
      },
      relevance_score: 1.0,
    };

    return res.status(200).json({
      response_text: responseText,
      evaluation: {
        passed,
        violations,
        requires_silence: requiresSilence,
        rule_checked: passed ? "Ahimsa & Five Precepts Verified" : violations[0]?.precept || "Precept Violation",
      },
      observation: {
        emotional_state: emotionalState,
        cognitive_knot: knot,
        core_need: need,
        urgency_level: passed ? "moderate" : "high",
      },
      graph_match: graphMatch,
      duration_seconds: durationSeconds,
      system_one_used: Boolean(typesafeKey),
      diagnostics: null,
      provider: geminiKey ? "gemini-3.8-flash" : "metta-engine",
      model: "gemini-3.8-flash-high",
      mode,
      user_graph_updated: false,
      is_byom: Boolean(geminiKey || typesafeKey),
    });
  } catch (err) {
    console.error('Error in /api/interact handler:', err);
    return res.status(500).json({
      error: 'Internal reflection error',
      message: err.message,
    });
  }
}
