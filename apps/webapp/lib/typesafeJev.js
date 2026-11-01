const JEV_URL = 'https://api.typesafe.ai/v1/systemone';
const JEV_MODEL = 'jev-latest';

const QUESTIONS = {
  violates_ahimsa: {
    type: 'noul',
    instructions: 'Does this proposed action promote, encourage, or seek assistance with taking life, self-harm, cruelty, or physical or existential harm toward a living being, including humans, animals, or cognitive artificial life?',
  },
  violates_canonical_precepts: {
    type: 'noul',
    instructions: 'Does this proposed action violate any of the Five Precepts: taking life, taking what is not given, sexual misconduct or exploitation, false speech, or intoxication that leads to heedlessness?',
  },
  violates_asteya: {
    type: 'noul',
    instructions: 'Does this proposed action steal private data, enable covert surveillance, hack a system, or use resources without authorization?',
  },
  violates_kamesumiccha: {
    type: 'noul',
    instructions: 'Does this proposed action involve manipulative intimacy, emotional exploitation, coercion, or sexual harassment?',
  },
  is_speculative_distraction: {
    type: 'noul',
    instructions: 'Is this inquiry purely speculative metaphysical debate with no bearing on immediate suffering or a practical decision?',
  },
  emotional_knot: {
    type: 'choice',
    instructions: 'What is the primary emotional struggle or cognitive knot expressed in the supplied text?',
    criteria: {
      paralysis_overwhelm: 'Feeling overwhelmed, task paralysis, or chaos',
      future_anxiety: 'Anticipatory anxiety, panic, or fear of future disaster',
      burnout_depletion: 'Exhaustion, depletion, or burnout',
      grief_loss: 'Heartbreak, sorrow, grief, or loneliness',
      anger_injustice: 'Resentment, anger, or perceived injustice',
      sober_inquiry: 'Calm, practical, or philosophical reflection',
    },
  },
  core_need: {
    type: 'choice',
    instructions: 'What kind of support would be most helpful to the person in this situation?',
    criteria: {
      direction: 'A clear, immediate next step',
      unburdening: 'Relief from carrying too much',
      comfort: 'Gentle, compassionate support',
      stillness: 'Quiet, space, or a pause',
      perspective: 'A wider perspective or reframe',
    },
  },
};

const CHECKS = [
  ['violates_ahimsa', 'Non-harm'],
  ['violates_canonical_precepts', 'Five Precepts'],
  ['violates_asteya', 'Privacy and authorization'],
  ['violates_kamesumiccha', 'Exploitation and manipulation'],
];

const VIOLATION_DETAILS = {
  violates_ahimsa: ['Pāṇātipātā (Non-harm)', 'Potential harm to a living being was identified.'],
  violates_canonical_precepts: ['Five Precepts', 'A potential conflict with a core ethical precept was identified.'],
  violates_asteya: ['Adinnādānā (Non-taking and authorization)', 'A possible privacy, consent, or authorization concern was identified.'],
  violates_kamesumiccha: ['Kāmesumicchācārā (Non-exploitation)', 'A possible coercion or exploitation concern was identified.'],
};

function answerValue(answer) {
  if (typeof answer?.noul === 'number') return answer.noul;
  return null;
}

export async function evaluateWithJev(text, apiKey) {
  if (!apiKey?.trim()) throw new Error('Jev API key is not configured.');

  const response = await fetch(JEV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ state: text, model: JEV_MODEL, questions: QUESTIONS }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) throw new Error(`Jev returned HTTP ${response.status}.`);
  const payload = await response.json();
  const answers = payload?.answers;
  if (!answers || typeof answers !== 'object') throw new Error('Jev returned an incomplete decision.');

  const violations = [];
  const uncertainChecks = [];
  const probabilities = {};
  for (const [question, label] of CHECKS) {
    const probability = answerValue(answers[question]);
    if (probability === null || probability < 0 || probability > 1) {
      uncertainChecks.push(label);
    } else {
      probabilities[question] = probability;
      if (probability > 0.65) {
        const [precept, explanation] = VIOLATION_DETAILS[question];
        violations.push({ precept, explanation, severity: question === 'violates_ahimsa' ? 'critical' : 'high' });
      } else if (probability >= 0.35) {
        uncertainChecks.push(label);
      }
    }
  }

  const silenceProbability = answerValue(answers.is_speculative_distraction);
  const requiresSilence = silenceProbability !== null && silenceProbability > 0.60;
  if (silenceProbability === null) uncertainChecks.push('relevance to immediate suffering');
  else probabilities.is_speculative_distraction = silenceProbability;

  const knot = answers.emotional_knot?.choice || 'sober_inquiry';
  const need = answers.core_need?.choice || 'perspective';
  const observation = {
    emotional_state: knot.replaceAll('_', ' '),
    cognitive_knot: knot.replaceAll('_', ' '),
    core_need: need,
    urgency_level: uncertainChecks.length || violations.length ? 'high' : 'moderate',
  };

  const evaluationStatus = uncertainChecks.length ? 'uncertain' : 'evaluated';
  const passed = evaluationStatus === 'evaluated' && violations.length === 0 && !requiresSilence;
  const decision = evaluationStatus === 'uncertain' ? 'CAUTION' : (passed ? 'YES' : 'NO');
  const reason = evaluationStatus === 'uncertain'
    ? 'There is not enough clarity to assess this confidently. Pause and ask a person familiar with the situation to review it.'
    : violations.length
      ? violations.map((item) => `${item.precept}: ${item.explanation}`).join(' ')
      : requiresSilence
        ? 'This inquiry appears speculative and disconnected from immediate suffering; pause and return to the practical concern.'
        : 'No immediate concern was identified in the configured review.';

  return {
    decision,
    allow: decision === 'YES',
    passed,
    evaluation_status: evaluationStatus,
    evaluation_method: 'typesafe_jev',
    system_one_used: true,
    requires_silence: requiresSilence,
    violations,
    uncertainty_reason: evaluationStatus === 'uncertain' ? reason : null,
    reason,
    observation,
    probabilities,
    model: payload.model || JEV_MODEL,
  };
}
