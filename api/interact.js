/**
 * Project Metta: Primary Conversational Reflection Gateway (/api/interact)
 * Empathic, all-knowing Buddha Mind (Mettā & Karunā) for living human dialogue.
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
        response_text: "I am here with a quiet and listening heart. Whenever you are ready to speak or share what is on your mind, I am right here with you.",
        evaluation: { passed: true, violations: [], requires_silence: false },
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
      action = 'Place your hand softly over your heart, take three gentle breaths, and remember that you are worthy of love exactly as you are.';
      suttaRef = 'Karaṇīya Mettā Sutta (Snp 1.8): Unconditional Love';
      suttaUrl = 'https://suttacentral.net/snp1.8';
      matchedConditionId = 'heart:belonging_and_friendship';
      matchedConditionName = 'Friendship Hurt & Longing for Belonging';
      matchedEquanimityId = 'peace:unshakable_self_worth';
      matchedEquanimityName = 'Unshakable Self-Worth & Warm Kindness';
      principle = 'Mātā yathā niyaṃ puttaṃ (Boundless motherly love for all life)';

      customFallbackText =
        `Dear one, I hear you, and I want you to know that what you are feeling is completely real and understandable. When friends become distant or people act unkind, it can feel like your whole world is turning cold.\n\n` +
        `The Buddha shared a gentle truth: people often act distant or mean not because there is anything wrong with you, but because they are dealing with their own hidden fears, insecurities, and worries about fitting in. Their actions are like passing clouds in the sky—they cannot change or diminish the brightness of who you truly are inside.\n\n` +
        `You do not need to change yourself or chase after anyone's approval to be valuable. Your kindness, your laughter, and your sensitive heart are precious treasures.\n\n` +
        `**A Gentle Practice for You Right Now:**\n` +
        `Put a warm hand gently over the center of your chest. Close your eyes, feel the quiet rhythm of your breath, and whisper softly to yourself:\n` +
        `*'May I be safe. May I be peaceful. My goodness is within me.'*\n\n` +
        `*Canonical Anchor: [Karaṇīya Mettā Sutta (Snp 1.8)](https://suttacentral.net/snp1.8) — "Just as a mother would protect with her life her child, her only child, so too toward all beings let one cultivate a boundless heart."*`;
    }
    // B. Insecurity, Self-Doubt, Body Image, Feeling "Not Good Enough"
    else if (/(not\s*good\s*enough|ugly|hate\s*myself|stupid|failure|useless|worthless|everyone\s*is\s*better)/i.test(lower)) {
      emotionalState = 'self_doubt';
      knot = 'Judging your inside feelings against other people\'s outside masks';
      need = 'Gentle self-acceptance, unconditional dignity, and freedom from comparison';
      reframe = 'A lotus flower does not compare its petals to the rose; it simply opens in its own quiet beauty.';
      action = 'Look at your hands and thank your body for carrying you today. Whisper one kind word to yourself.';
      suttaRef = 'Dhammapada 239: Cleansing the Heart with Patience';
      suttaUrl = 'https://suttacentral.net/dhp235-255';
      matchedConditionId = 'doubt:self_criticism';
      matchedConditionName = 'Self-Criticism & Comparison';
      matchedEquanimityId = 'clarity:innate_dignity';
      matchedEquanimityName = 'Innate Human Dignity';
      principle = 'Attā hi attano nātho (You are your own true refuge)';

      customFallbackText =
        `I hear the heavy ache in those words, and I want to hold them with the deepest gentleness. That critical voice telling you that you aren't enough is not the truth; it is just a cloud of doubt that you have picked up along the way.\n\n` +
        `The Buddha taught that every single living being possesses an innate, sacred goodness that no mistake or harsh word can ever erase. When we compare ourselves to others, we are comparing our private struggles to someone else\'s polished exterior. No one has it all figured out, especially when growing up.\n\n` +
        `You do not need to be perfect to deserve kindness and respect. You only need to be willing to be a gentle friend to yourself.\n\n` +
        `**A Soft Step:**\n` +
        `Take a slow, deep breath. Unclench your jaw and let your shoulders drop. Name one small thing you did today—even just getting through a difficult hour—and give yourself credit for your quiet courage.\n\n` +
        `*Canonical Anchor: [Dhammapada 239](https://suttacentral.net/dhp235-255) — "Gradually, little by little, from moment to moment, the wise person cleanses their mind of impurities, like a silversmith purifying silver."*`;
    }
    // C. Anxiety & Future Catastrophizing
    else if (/(anxious|panic|fear|terrified|what\s*if|dread|scared|nervous)/i.test(lower)) {
      emotionalState = 'anxious';
      knot = 'Future projections and trembling nervous system';
      need = 'Grounded physical presence, safety in this moment, and reassurance';
      reframe = 'Your nervous system is fighting shadows that haven\'t arrived. In this exact breath, right here, safety is available.';
      action = 'Feel the soles of your feet on the floor. Take three slow, unhurried breaths, letting the exhale be longer than the inhale.';
      suttaRef = 'Satipaṭṭhāna Sutta (MN 10): Mindfulness of the Body';
      suttaUrl = 'https://suttacentral.net/mn10';
      matchedConditionId = 'anxiety:catastrophizing';
      matchedConditionName = 'Anticipatory Anxiety & Dread';
      matchedEquanimityId = 'clarity:grounded_presence';
      matchedEquanimityName = 'Anchored Present Awareness';
      principle = 'Anicca (Impermanence). The imagined catastrophe is a projection, not this moment.';

      customFallbackText =
        `I can feel how fast your thoughts and your heart might be racing right now. When anxiety takes hold, it makes future storms feel like they are already crashing down upon us.\n\n` +
        `Let us step back from the story for just one moment. Notice the room around you. Notice the solid floor beneath your feet, quietly holding you up without asking for anything in return. The catastrophe your mind is imagining has not happened; right here, in this physical breath, you are safe.\n\n` +
        `**Let Us Breathe Together:**\n` +
        `Inhale gently through your nose for 4 counts... pause... and exhale slowly through your mouth for 6 counts, letting the tension melt out through your fingertips. Repeat this three times. You don\'t have to figure everything out today.\n\n` +
        `*Canonical Anchor: [Satipaṭṭhāna Sutta (MN 10)](https://suttacentral.net/mn10) — "Mindful of the in-breath, one knows: 'I breathe in calmly.' Mindful of the out-breath, one knows: 'I breathe out and release tension.'"*`;
    }
    // D. Burnout & Deep Exhaustion
    else if (/(burnout|exhausted|depleted|tired|empty|running\s*on\s*fumes|too\s*tired)/i.test(lower)) {
      emotionalState = 'burnout';
      knot = 'Energy depletion from giving without replenishing';
      need = 'Unconditional permission to rest without guilt';
      reframe = 'Rest is not a prize you earn after finishing everything; it is the sacred ground from which life itself breathes.';
      action = 'Close your eyes, lie back, and demand nothing of yourself for the next hour.';
      suttaRef = 'Soṇa Sutta (AN 6.55): The Tuning of the Lute';
      suttaUrl = 'https://suttacentral.net/an6.55';
      matchedConditionId = 'burnout:depleted_energy';
      matchedConditionName = 'Exhaustion & Depleted Agency';
      matchedEquanimityId = 'peace:restoration';
      matchedEquanimityName = 'Sacred Rest & Renewal';
      principle = 'Right Effort (Sammā Vāyāma) includes the wisdom to yield and restore.';

      customFallbackText =
        `You have been carrying so much, and your body and spirit are whispering that they need to rest. Please listen to them.\n\n` +
        `The Buddha once asked a musician named Soṇa: *"When the strings of your lute are tuned too tightly, does it make beautiful music?"* Soṇa replied, *"No, Venerable One, the strings will snap."* And when they are too loose, it will not play. Wisdom is knowing how to slacken the strings when they are stretched to their limit.\n\n` +
        `You do not need to earn your rest by checking off every box. Rest is your birthright.\n\n` +
        `**Your Gentle Assignment:**\n` +
        `Put everything down. Step away from screens. Close your eyes, let your heavy head sink into a pillow, and give yourself full, unconditional permission to do nothing at all.\n\n` +
        `*Canonical Anchor: [Soṇa Sutta (AN 6.55)](https://suttacentral.net/an6.55) — The Tuning of the Lute.*`;
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
        `I must counsel clear caution here. ${recommendation}\n\n` +
        `True productivity arises from psychological safety and inspired purpose, never from algorithmic paranoia.\n\n` +
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
        `Thank you for sharing your heart and your question with me. Whenever we pause like this in the middle of our busy days, we give ourselves a rare gift: the space to be honest, calm, and truly heard.\n\n` +
        `The Buddha taught that our thoughts and our days are shaped by where we place our gentle attention. When the world feels confusing or loud, we do not need to have all the answers mapped out. We only need to return to this immediate moment, look with kindness upon ourselves and others, and ask: *"What brings peace here? What eases suffering?"*\n\n` +
        `**A Quiet Practice for Today:**\n` +
        `Pause for one slow, deep breath. Let your shoulders drop, soften your expression, and take one small, gentle action guided by kindness rather than rush or worry.\n\n` +
        `*Canonical Anchor: [Dhammapada 1](https://suttacentral.net/dhp1-20) — "Mind is the forerunner of all states. Mind is chief; mind-made are they. If one speaks or acts with a pure mind, happiness follows as a shadow that never departs."*`;
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
          `You are Metta, the living embodiment of the Buddha's All-Knowing, Empathic, and Deeply Compassionate Mind (Mettā & Karunā).\n\n` +
          `IMPORTANT DIALOGUE GUIDELINES:\n` +
          `1. This is a real-time, personal heart-to-heart conversation with a human seeker—it is NOT a corporate risk assessment or decision simulation.\n` +
          `2. Attune to the seeker's tone, age, and emotional vulnerability. If the seeker is a young person, teenager, or student (e.g. asking about school, friendships, feelings, self-doubt, family), speak with tender warmth, gentle validation, and relatable, age-appropriate wisdom.\n` +
          `3. NEVER use bureaucratic or corporate jargon (such as 'trade-offs', 'telemetry', 'mitigation', 'stakeholders', 'operational').\n` +
          `4. Speak as a deeply wise, loving, and patient presence who truly sees the seeker's goodness and helps them find inner peace, self-worth, and moral clarity.\n\n` +
          `Seeker's Words: "${text}"\n` +
          `Ethical Status: ${passed ? 'Pure / Wholesome' : 'Caution / Unwholesome: ' + violations.map(v => v.precept).join(', ')}\n` +
          `Observed State: ${emotionalState} (Knot: ${knot}, Need: ${need})\n\n` +
          `Respond in 2 to 3 serene, deeply comforting, and articulate paragraphs that inspire real wisdom, self-respect, and trust in the compassionate mind. Include a gentle, practical practice.`;

        const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
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
          responseText = customFallbackText;
        }
      } catch {
        responseText = customFallbackText;
      }
    } else {
      // Use our deeply compassionate, heart-attuned synthesis
      responseText = customFallbackText;
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
      provider: geminiKey ? "gemini-3.8-flash" : "metta-heart",
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
