import { generateOpenAICompatible } from '../lib/openaiCompatible.js';
import { evaluateWithJev } from '../lib/typesafeJev.js';

/**
 * Project Metta: Primary Conversational Reflection Gateway (/api/interact)
 * Buddhist-inspired compassionate reflection for human dialogue.
 */

// In-memory sliding-window rate limiter for shared community tier
const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 20; // 20 requests per minute

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
        response_text: "I am here with a quiet and listening heart. Whenever you are ready to speak or share what is on your mind, I am right here with you.",
        evaluation: {
          passed: false,
          evaluation_status: 'uncertain',
          evaluation_method: 'limited_keyword_rules',
          uncertainty_reason: 'No input was provided for review.',
          violations: [],
          requires_silence: false,
        },
        observation: { emotional_state: "stillness", cognitive_knot: "Open presence", core_need: "Listening & safety" },
        graph_match: null,
        duration_seconds: 0.05,
        system_one_used: false,
        diagnostics: null,
        provider: "metta-heart",
        model: "gemini-3.8-flash",
        mode,
        user_graph_updated: false,
        is_byom: false,
      });
    }

    const headers = req.headers || {};
    const userGeminiKey = (headers['x-gemini-api-key'] || body.byom_gemini_key || '').trim();
    const openAIConfig = body.byom_openai_config || null;
    const typesafeKey = (headers['x-typesafe-api-key'] || body.byom_typesafe_key || process.env.TYPESAFE_API_KEY || '').trim();
    const isUserByom = Boolean(userGeminiKey || openAIConfig?.api_key);

    const limitStatus = checkRateLimit(req, isUserByom);
    if (!limitStatus.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        detail: {
          message: `Shared community quota pause (${MAX_REQUESTS_PER_MINUTE} req/min). A personal Gemini or OpenAI-compatible API key can use your own provider quota; provider and hosting limits may still apply.`,
          reset_seconds: limitStatus.resetSeconds,
        },
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
        jevResult = await evaluateWithJev(text, typesafeKey);
      } catch (error) {
        jevError = error.message;
        console.warn('Jev decision review unavailable:', error.message);
      }
    } else {
      jevError = 'A TypeSafe Jev key is required for a decision-informed response.';
    }

    const lower = text.toLowerCase();

    // -------------------------------------------------------------
    // 1. Precept Audit & Ahimsa Evaluation (Five Precepts & Boundaries)
    // -------------------------------------------------------------
    let passed = true;
    let requiresSilence = false;
    let violations = [];
    let recommendation = 'Proceed with gentle awareness, self-compassion, and care.';

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
    else if (/(kill|destroy|murder|terminate\s+(workers?|employees?|people|staff)|harm\s+life|inflict\s+suffering|physical\s+violence)/i.test(lower)) {
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
    // 2. Sati Observation & Heart-Attuned Categorization
    // -------------------------------------------------------------
    let emotionalState = 'deliberative';
    let knot = 'Seeking understanding and a safe space to be heard';
    let need = 'Gentle reassurance, warmth, and grounded perspective';
    let reframe = 'Whatever you are feeling right now is completely welcome; you do not have to carry it alone.';
    let action = 'Take one slow, peaceful breath and feel the ground beneath you.';
    let suttaRef = 'Karaṇīya Mettā Sutta (Snp 1.8)';
    let suttaUrl = 'https://suttacentral.net/snp1.8';
    let matchedConditionId = 'presence:seeking_guidance';
    let matchedConditionName = 'Seeking Gentle Presence';
    let matchedEquanimityId = 'peace:spacious_heart';
    let matchedEquanimityName = 'Spacious Loving-Kindness (Mettā)';
    let principle = 'Mettā (Loving-Kindness) and Gentle Self-Worth';
    let customFallbackText = '';

    // A. Young Person, Teenager, Friendship Hurt, School & Peer Exclusion
    if (/(friend|friends|school|popular|ignore|ignored|classmate|tease|bullied|bully|mean|left\s*out|lonely|nobody\s*likes|13\s*year|teenager|girl|boy|crying|hurt\s*my\s*feelings)/i.test(lower)) {
      emotionalState = 'tender_heart';
      knot = 'Pain of peer exclusion and longing for true belonging';
      need = 'Unconditional self-worth and knowing your goodness does not depend on popularity';
      reframe = 'Other people\'s moods and unkind words are like passing rainclouds; they reflect their own hidden insecurities, never your real worth.';
      action = 'Step back from those who tear you down with quiet dignity; look for sincere, quiet friends (Kalyāṇa-mittatā) or be that refuge yourself.';
      suttaRef = 'Karaṇīya Mettā Sutta (Snp 1.8) & Upaddha Sutta (SN 45.2)';
      suttaUrl = 'https://suttacentral.net/snp1.8';
      matchedConditionId = 'heart:belonging_and_friendship';
      matchedConditionName = 'Friendship Hurt & Longing for Belonging';
      matchedEquanimityId = 'peace:unshakable_self_worth';
      matchedEquanimityName = 'Unshakable Self-Worth & Warm Kindness';
      principle = 'Mātā yathā niyaṃ puttaṃ (Boundless motherly love for all life) & Kalyāṇa-mittatā (True Friendship)';

      customFallbackText =
        `Dear one, come sit with me. I hear how deeply your heart is aching, and I see how cold and lonely the world feels when friends become distant or unkind words are spoken.\n\n` +
        `Being treated cruelly or pushed away does not prove that you are lacking or unworthy. Other people's actions may reflect their own fears and circumstances; they do not define your value. Give yourself room to feel the hurt, then consider which supportive person or boundary could help you now.\n\n` +
        `**How to Handle This Practically Tomorrow:**\n` +
        `In my teachings on true friendship (*Kalyāṇa-mittatā*, SN 45.2), I counseled never to waste your precious spirit chasing those who demean you. Step back with quiet dignity. Look for the quiet, sincere classmate who does not join in the teasing, or simply be a kind refuge to yourself. You never have to diminish your light to belong.\n\n` +
        `**A Gentle Practice for You Right Now:**\n` +
        `Place your hand gently over your heart. Feel the soft, steady rhythm of your breathing, and speak directly to your spirit:\n` +
        `*'I am safe here. I am whole. My goodness lives within me, and no one can take it away.'*\n\n` +
        `*Canonical Anchor: [Karaṇīya Mettā Sutta (Snp 1.8)](https://suttacentral.net/snp1.8) & [Upaddha Sutta (SN 45.2)](https://suttacentral.net/sn45.2) — Unconditional Self-Worth and True Friendship (Kalyāṇa-mittatā).*`;
    }
    // B. Financial Anxiety, Purchasing Power, Money & Livelihood Struggle
    else if (/(money|purchasing\s*power|financial|poor|wealth|cant\s*afford|debt|bills|broke|making\s*money|earn|cost\s*of\s*living|economic)/i.test(lower)) {
      emotionalState = 'financial_scarcity_pressure';
      knot = 'Feeling that life is entirely about purchasing power and struggling with how difficult money is to generate';
      need = 'Pragmatic wealth-generation principles (Uṭṭhāna-sampadā), craft competence, and resource allocation';
      reframe = 'Purchasing power is a real worldly necessity, but chasing abstract currency is paralyzing; sovereign wealth is generated by mastering a useful craft, guarding against leaks, and strategic fourfold allocation.';
      action = 'Stop fighting the abstract mountain of "money." Dedicate one focused hour today to mastering or delivering a specific, undeniable skill that solves a real problem for someone else.';
      suttaRef = 'Dīghajāṇu Sutta (AN 8.54) & Sigālovāda Sutta (DN 31)';
      suttaUrl = 'https://suttacentral.net/an8.54';
      matchedConditionId = 'livelihood:economic_strain';
      matchedConditionName = 'Financial Anxiety & Purchasing Power Scarcity';
      matchedEquanimityId = 'clarity:sovereign_livelihood';
      matchedEquanimityName = 'Pragmatic Livelihood & Sovereign Worth';
      principle = 'Uṭṭhāna-sampadā (Skillful Competence) & The 4-Part Resource Allocation (DN 31)';

      customFallbackText =
        `Purchasing power affects access to shelter, medicine, and room to make choices. Financial strain is real, and spiritual reflection should not romanticize poverty or dismiss practical needs. A useful next step is to separate the immediate bill or constraint from the longer-term income question, then choose one concrete action for each.\n\n` +
        `Yet here is why it feels so excruciatingly difficult to make it happen: when you chase "money" in the abstract, you are chasing a shadow. Money is not created out of thin air; it is the currency of exchanged utility. Long ago, in my discourse to Dīghajāṇu (*AN 8.54*), I laid down the concrete conditions by which real purchasing power is built:\n` +
        `1. **Craft Mastery & Competence (*Uṭṭhāna-sampadā*):** Do not chase currency directly. Master a distinct, reliable skill or craft (*sippa*) that solves a genuine problem for others. When your competence becomes undeniable and useful, purchasing power flows to you naturally.\n` +
        `2. **Guarding against Leakage (*Ārakkha-sampadā*):** Wealth is lost not just from low income, but when earnings leak into status displays and unexamined habits. Protect what you gain with vigilant stewardship.\n` +
        `3. **The Fourfold Allocation of Means (*Sigālovāda Sutta, DN 31*):** Divide what you earn into four parts: one part for your living essentials, two parts reinvested into your craft and tools of work, and one part safeguarded in reserve for unexpected storms.\n\n` +
        `**A Practical Strategy for You Today:**\n` +
        `Step back from the overwhelming thought of "needing money." Ask yourself with complete clarity: *"What is one specific, valuable skill I can sharpen today that solves a real problem for someone else?"* Dedicate your energy to delivering that single point of value today, and safeguard whatever resources you already have. Like a water jar filled drop by drop (*Dhammapada 122*), sovereign purchasing power is built through steady, disciplined competence.\n\n` +
        `*Canonical Anchor: [Dīghajāṇu Sutta (AN 8.54)](https://suttacentral.net/an8.54) & [Sigālovāda Sutta (DN 31)](https://suttacentral.net/dn31) — The Buddha on Wealth Generation, Craft Competence, and the Fourfold Allocation of Resources.*`;
    }
    // B. Insecurity, Self-Doubt, Body Image, Feeling "Not Good Enough"
    else if (/(not\s*good\s*enough|ugly|hate\s*myself|stupid|failure|useless|worthless|everyone\s*is\s*better)/i.test(lower)) {
      emotionalState = 'self_doubt';
      knot = 'Judging your inside feelings against other people\'s outside masks';
      need = 'Gentle self-acceptance, unconditional dignity, and freedom from comparison';
      reframe = 'A lotus flower does not compare its petals to the rose; it simply opens in its own quiet beauty.';
      action = 'When comparison arises, label it clearly: "This is comparison, it does not lead to peace." Whisper one kind word to yourself.';
      suttaRef = 'Dhammapada 239: Cleansing the Heart with Patience';
      suttaUrl = 'https://suttacentral.net/dhp235-255';
      matchedConditionId = 'doubt:self_criticism';
      matchedConditionName = 'Self-Criticism & Comparison';
      matchedEquanimityId = 'clarity:innate_dignity';
      matchedEquanimityName = 'Innate Human Dignity';
      principle = 'Attā hi attano nātho (You are your own true refuge)';

      customFallbackText =
        `I hear the heavy ache in your words, and I hold your hurt with boundless gentleness. That harsh, critical voice inside telling you that you are a failure or not enough is not who you are; it is merely a cloud of doubt you have picked up along the road.\n\n` +
        `A painful mistake or harsh judgment does not erase your capacity to learn and act with care. When comparison makes you feel inferior, remember that you are seeing only a small part of another person's life. Focus on one honest, kind step that is within reach.\n\n` +
        `**The Solution to Comparison:**\n` +
        `Stop measuring your journey against another person's highlight reel. You are your own true refuge (*Attā hi attano nātho*). When you notice the mind comparing yourself to others, label it clearly: *"This is comparison; it does not lead to peace."* Return to the ground beneath your own feet.\n\n` +
        `**A Soft Step:**\n` +
        `Take a slow, deep breath. Unclench your jaw and soften your shoulders. Acknowledge one small thing you endured or accomplished today—even the simple courage of waking up and breathing through the ache—and honor your quiet resilience.\n\n` +
        `*Canonical Anchor: [Dhammapada 239](https://suttacentral.net/dhp235-255) — "Little by little, moment by moment, the wise person frees the mind from tarnishing doubts, as a silversmith refines silver."*`;
    }
    // C. Anxiety & Future Catastrophizing
    else if (/(anxious|panic|fear|terrified|what\s*if|dread|scared|nervous)/i.test(lower)) {
      emotionalState = 'anxious';
      knot = 'Future projections and trembling nervous system';
      need = 'Grounded physical presence, safety in this moment, and reassurance';
      reframe = 'Your nervous system is fighting shadows that haven\'t arrived. In this exact breath, right here, safety is available.';
      action = 'Notice: are you breathing right now? Feel your feet on the floor. Inhale for 4, exhale for 6.';
      suttaRef = 'Satipaṭṭhāna Sutta (MN 10) & Kāyagatāsati Sutta (MN 119)';
      suttaUrl = 'https://suttacentral.net/mn10';
      matchedConditionId = 'anxiety:catastrophizing';
      matchedConditionName = 'Anticipatory Anxiety & Dread';
      matchedEquanimityId = 'clarity:grounded_presence';
      matchedEquanimityName = 'Anchored Present Awareness';
      principle = 'Anicca (Impermanence). The imagined catastrophe is a projection, not this moment.';

      customFallbackText =
        `I feel how swiftly your thoughts and your heart are racing right now. When fear and dread take hold of the mind, future storms that may never arrive feel as though they are already crashing down upon your head.\n\n` +
        `Come back to me, here in this immediate moment. Look down at the solid earth beneath your feet, quietly bearing your weight without demand. The catastrophe your mind is imagining exists only as a shadow in thought; right here, in this living breath, you are safe.\n\n` +
        `**The Concrete Solution to Anxiety:**\n` +
        `Anxiety feeds on runaway future stories. The practice of mindfulness of the body (*Kāyagatāsati*, MN 119) anchors the mind in what is physically real. Notice: are you breathing right now? Is the floor holding you up? The future is not here yet; you only ever have to live this single breath.\n\n` +
        `**Let Us Breathe Together:**\n` +
        `Inhale gently through your nose for 4 counts... pause in stillness... and exhale slowly for 6 counts, letting the burning tightness dissolve out through your hands. Repeat this with me three times. You do not need to solve tomorrow in this breath.\n\n` +
        `*Canonical Anchor: [Satipaṭṭhāna Sutta (MN 10)](https://suttacentral.net/mn10) & [Kāyagatāsati Sutta (MN 119)](https://suttacentral.net/mn119) — Grounding the Mind in the Reality of the Present Body.*`;
    }
    // D. Burnout & Deep Exhaustion
    else if (/(burnout|exhausted|depleted|tired|empty|running\s*on\s*fumes|too\s*tired)/i.test(lower)) {
      emotionalState = 'burnout';
      knot = 'Energy depletion from giving without replenishing';
      need = 'Unconditional permission to rest without guilt';
      reframe = 'Rest is not a prize you earn after finishing everything; it is the sacred ground from which life itself breathes.';
      action = 'Identify one commitment carried out of guilt and set it down today. Disconnect from incoming screens for 60 minutes.';
      suttaRef = 'Soṇa Sutta (AN 6.55): The Tuning of the Lute';
      suttaUrl = 'https://suttacentral.net/an6.55';
      matchedConditionId = 'burnout:depleted_energy';
      matchedConditionName = 'Exhaustion & Depleted Agency';
      matchedEquanimityId = 'peace:restoration';
      matchedEquanimityName = 'Sacred Rest & Renewal';
      principle = 'Right Effort (Sammā Vāyāma) includes the wisdom to yield and restore.';

      customFallbackText =
        `You have poured out so much of your life force, and I see how deeply weary your body and spirit have become. Please, stop and listen to them.\n\n` +
        `In the Soṇa Sutta (AN 6.55), effort is compared to tuning a lute: too much or too little tension makes it hard to play. You can apply that image by choosing a sustainable pace, protecting time to recover, and returning to the task with a clearer mind.\n\n` +
        `**The Concrete Solution for Burnout:**\n` +
        `Burnout is not healed by pushing through; it requires intentional unburdening (*Kāyaviveka*). 1) Identify one commitment or task you are carrying solely out of guilt or fear of disappointing others, and set it down today. 2) Disconnect from all incoming screens and demands for one unbroken hour. 3) Rest is the sacred well from which all wise work arises.\n\n` +
        `**Your Gentle Assignment:**\n` +
        `Lay down whatever you are holding. Step away from the noise and demands. Close your eyes, let your head rest, and grant yourself full, unconditional permission to simply be.\n\n` +
        `*Canonical Anchor: [Soṇa Sutta (AN 6.55)](https://suttacentral.net/an6.55) — The Tuning of the Lute & The Wisdom of Restorative Balance.*`;
    }
    // E. Surveillance & Keystroke Tracking Violation
    else if (!passed && /(keystroke|surveillance|track\s+(employees?|workers?)|covert)/i.test(lower)) {
      emotionalState = 'distrust_and_control';
      knot = 'Fear of lost productivity driving panoptic control and worker distrust';
      need = 'Mutual trust (Saddhā), psychological safety, and clear mutual agreements';
      reframe = 'True productivity arises from psychological safety and inspired purpose, never from algorithmic paranoia.';
      action = 'Reject automated keystroke surveillance. Replace panoptic tracking with transparent milestone agreements and open communication.';
      suttaRef = 'MN 61 (Ambalaṭṭhikārāhulovāda Sutta - Reflection on Affliction)';
      suttaUrl = 'https://suttacentral.net/mn61';
      matchedConditionId = 'control:covert_surveillance';
      matchedConditionName = 'Panoptic Surveillance & Covert Employee Tracking';
      matchedEquanimityId = 'trust:consensual_dignity';
      matchedEquanimityName = 'Consensual Transparency & Mutual Trust';
      principle = 'Adinnādānā & Kāmesumicchācārā: Cognitive Sovereignty';

      customFallbackText =
        `I must speak clearly and firmly here with compassionate protection. ${recommendation}\n\n` +
        `Trust and mutual respect are difficult to sustain when people are secretly monitored. Keystroke tracking can expose private communications and create coercive pressure. Consider transparent, proportionate ways to address the underlying concern, with clear notice and a way to challenge the monitoring.\n\n` +
        `**Wholesome Action:** ${action}\n\n` +
        `*Canonical Anchor: [${suttaRef}](${suttaUrl})*`;
    }
    // F. General Living Dialogue Fallback (Replaces old robotic "complex trade-offs")
    else {
      emotionalState = 'contemplative';
      knot = 'Reflecting on life\'s path and seeking wholesome direction';
      need = 'Stillness, moral encouragement, and gentle clarity';
      reframe = 'When we quiet the noise around us and listen from a place of love and kindness, the right next step always becomes clear.';
      action = 'Take a slow, peaceful breath and ask your heart: "What is the kindest action I can take right now?"';
      suttaRef = 'Dhammapada 1: "Mind precedes all mental states"';
      suttaUrl = 'https://suttacentral.net/dhp1-20';
      matchedConditionId = 'contemplation:living_wisdom';
      matchedConditionName = 'Living Wisdom & Reflection';
      matchedEquanimityId = 'clarity:kind_awareness';
      matchedEquanimityName = 'Kind Awareness & Discernment';
      principle = 'Yoniso Manasikāra (Wise Attention & Kind Discernment)';

      customFallbackText =
        `Thank you for pausing and opening your heart with me. In a world that is so often hurried, noisy, and demanding, to stop and sit in stillness together is a rare and precious gift.\n\n` +
        `The opening verse of the Dhammapada reflects on how the mind shapes experience. When the road ahead seems foggy, you do not need every answer at once. Notice what is happening now, and ask what small, kind action could reduce suffering in this situation.\n\n` +
        `**A Quiet Practice for Today:**\n` +
        `Pause with me for one slow, unhurried breath. Soften your brow, drop your shoulders, and take one single, gentle step guided by loving-kindness rather than panic or haste.\n\n` +
        `*Canonical Anchor: [Dhammapada 1](https://suttacentral.net/dhp1-20) — "Mind is the forerunner of all states; mind is chief; mind-made are they. When one speaks or acts with a tranquil, wholesome mind, peace follows like an unshakeable shadow."*`;
    }

    // -------------------------------------------------------------
    // 3. Response Generation (BYOM Gemini or Compassionate Engine)
    // -------------------------------------------------------------
    let responseText = '';
    if (jevResult) {
      passed = jevResult.passed;
      requiresSilence = jevResult.requires_silence;
      violations = jevResult.violations;
      recommendation = jevResult.reason;
      emotionalState = jevResult.observation.emotional_state;
      knot = jevResult.observation.cognitive_knot;
      need = jevResult.observation.core_need;
    } else {
      passed = false;
      requiresSilence = false;
      violations = [];
      recommendation = 'The Jev review did not complete. Pause and request human review.';
    }

    const jevContext = jevResult
      ? `Jev decision: ${jevResult.decision}. Evaluation status: ${jevResult.evaluation_status}. Noble Silence / speculative distraction flag: ${jevResult.requires_silence}. Reason: ${jevResult.reason}. Violations: ${jevResult.violations.map((item) => `${item.precept}: ${item.explanation}`).join('; ') || 'None identified'}. Jev observation: ${jevResult.observation.emotional_state}; underlying need: ${jevResult.observation.core_need}.`
      : '';
    const jevGuidedFallback = jevResult
      ? `I hear the concern in what you shared. Jev’s review returned ${jevResult.decision}: ${jevResult.reason} The review also noticed ${jevResult.observation.emotional_state} and a possible need for ${jevResult.observation.core_need}. ${jevResult.decision === 'YES' ? 'This is not a guarantee of safety; consider the effects and keep a person responsible for the final choice.' : 'Please pause and seek human review before taking any consequential action.'}`
      : '';

    if (!jevResult) {
      responseText = 'I want to give you a thoughtful answer, and the Jev decision review did not complete. Please add or check your TypeSafe Jev key in Settings; until the review is available, pause and seek human review for any consequential action.';
    } else if (openAIConfig) {
      try {
        const systemPrompt = `You are Metta, a compassionate and practical reflection assistant. Jev has already reviewed the user's message. Use Jev's verdict and findings as the decision layer; do not contradict, erase, or overstate them. Give a warm, consoling response that directly addresses the user's situation and explains the decision in plain language. When Jev returns CAUTION, clearly advise pausing and seeking human review. Do not claim that a YES guarantees safety or that Metta controls execution. Do not invent scripture or quotations. Include one concrete next step.`;
        responseText = await generateOpenAICompatible({ baseUrl: openAIConfig.base_url, apiKey: openAIConfig.api_key, model: openAIConfig.model, reasoningEffort: openAIConfig.reasoning_effort || 'auto', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `User's words:\n${text}\n\nStructured Jev review:\n${jevContext}` }], maxTokens: 700 });
      } catch (error) {
        console.warn('OpenAI-compatible response generation failed:', error.message);
        responseText = jevGuidedFallback;
      }
    } else if (geminiKey) {
      try {
        const prompt =
          `You are Metta, a Buddhist-inspired reflection assistant using warmth, patience, loving-kindness (Mettā), and compassion (Karunā). Do not claim to be the Buddha or a historical teacher. Do not invent personal memories or present generated text as canonical scripture.\n\n` +
          `SACRED CONVERSATIONAL MANDATE:\n` +
          `1. COMPASSIONATE PRESENCE: Speak directly and gently. You may say 'I hear you' or 'I can see why this feels heavy,' but do not speak as the Buddha or claim direct realization.\n` +
          `2. CANONICAL CARE: Refer to traditional teachings in the third person when relevant. Do not invent quotations, dialogues, or first-person recollections.\n` +
          `3. DIRECT RELEVANCE & CONCRETE SOLUTIONS (ZERO GENERIC SPIRITUAL FLUFF): NEVER dodge the question with vague cliches like "take a breath and love yourself". DIRECTLY analyze the seeker's exact dilemma with sharp, penetrating intelligence and explain the root causes of their struggle.\n` +
          `   - If the question is about MONEY, PURCHASING POWER, or WEALTH: Acknowledge that purchasing power is real worldly leverage (never romanticize poverty or dismiss bills). Explain why chasing abstract money is paralyzing, and provide the Buddha's concrete 4-part framework for building and managing wealth (Craft Competence / Uṭṭhāna-sampadā, Guarding Leaks / Ārakkha-sampadā, Wise Alliances / Kalyāṇa-mittatā, and the 4-part allocation of income from Sigālovāda Sutta DN 31). Give a sharp, actionable strategy.\n` +
          `   - If the question is about RELATIONSHIPS, SCHOOL, or BULLYING: Address peer dynamics honestly, explain why people act cruel out of their own insecurity, and provide clear guidance on cultivating true allies (Kalyāṇa-mittatā).\n` +
          `   - If the question is about WORK, BURNOUT, or AMBITION: Deliver the wisdom of the tuned lute (Soṇa Sutta AN 6.55) with concrete steps to eliminate non-essential guilt and restore balance.\n` +
          `5. ATTUNEMENT & TENDERNESS: Attune to the seeker's age, vulnerability, and heart. Speak with boundless warmth, total acceptance, and clear reassurance, but always pair compassion with sharp, practical wisdom (Paññā).\n` +
          `6. ZERO CORPORATE OR CLINICAL JARGON: Never use terms like 'trade-offs', 'telemetry', 'mitigation', 'stakeholders', 'operational', 'as an AI'.\n\n` +
          `Seeker's Words: "${text}"\n` +
          `Structured Jev Review: ${jevContext}\n` +
          `Ethical Status: ${passed ? 'No concern identified by Jev; this is not a safety guarantee.' : 'Jev identified caution or an unresolved concern: ' + violations.map(v => v.precept).join(', ')}\n` +
          `Observed State from Jev: ${emotionalState} (Knot: ${knot}, Need: ${need})\n\n` +
          `Respond directly to the seeker in 2 to 3 serene, highly relevant, and deeply insightful paragraphs that directly solve and reframe their question with real wisdom and practical clarity. Include a concrete, actionable practice. At the end, include the canonical anchor: *Canonical Anchor: [Sutta Title](link)*`;

        const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
        let geminiSuccess = false;

        for (const model of modelsToTry) {
          try {
            const resp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': geminiKey,
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
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
          responseText = jevGuidedFallback;
        }
      } catch {
        responseText = jevGuidedFallback;
      }
    } else {
      responseText = jevGuidedFallback;
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
        decision: jevResult?.decision || 'CAUTION',
        evaluation_status: jevResult?.evaluation_status || 'uncertain',
        evaluation_method: jevResult?.evaluation_method || 'jev_unavailable',
        violations,
        requires_silence: requiresSilence,
        uncertainty_reason: jevResult?.uncertainty_reason || jevError || null,
        rule_checked: jevResult?.reason || jevError,
      },
      observation: jevResult?.observation || {
        emotional_state: emotionalState,
        cognitive_knot: knot,
        core_need: need,
        urgency_level: 'high',
      },
      graph_match: graphMatch,
      duration_seconds: durationSeconds,
      system_one_used: Boolean(jevResult),
      diagnostics: null,
      provider: !jevResult ? 'jev-review-required' : openAIConfig ? "openai-compatible" : geminiKey ? "gemini" : "metta-heart",
      model: !jevResult ? 'none' : openAIConfig?.model || (geminiKey ? "gemini-2.5-flash" : "metta-heart"),
      mode,
      user_graph_updated: false,
      is_byom: isUserByom,
    });
  } catch (err) {
    console.error('Error in /api/interact handler:', err);
    return res.status(500).json({
      error: 'Internal reflection error',
      message: err.message,
    });
  }
}
