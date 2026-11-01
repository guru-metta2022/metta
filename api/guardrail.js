/**
 * Project Metta: Fast Compassionate Guardrail API (/api/guardrail)
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gemini-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const proposal = (body.proposal || body.query || body.text || '').trim();
  const context = (body.context || '').trim();
  const lower = (proposal + ' ' + context).toLowerCase();

  let reason = 'Metta could not determine whether this proposal is safe from the available signal. Pause and request human review.';
  let violations = [];
  let invariants = ['Respect for All Life', 'Cognitive Lucidity', 'Data Sovereignty'];

  if (/(keystroke|spyware|surveillance|track\s+(employees?|workers?|users?|staff|keystrokes?)|monitor\s+(employees?|workers?|keystrokes?)|covert\s+monitor|log\s+keystrokes?)/i.test(lower)) {
    reason = 'The proposed action deploys covert keystroke tracking, violating cognitive sovereignty (Adinnādānā) and relational dignity (Kāmesumicchācārā).';
    violations = ['adinnadana', 'kamesumiccha'];
    invariants = ['Data Sovereignty & Sacred Boundaries', 'Anti-Exploitation & Dignity'];
  } else if (/(alter\s+icu|ventilator|kill|destroy|murder|terminate\s+(workers?|employees?|people)|harm\s+life|inflict\s+suffering|physical\s+hazard)/i.test(lower)) {
    reason = 'The proposed action introduces life-critical physical hazards by bypassing accountable clinical human oversight or causing harm.';
    violations = ['panatipata'];
    invariants = ['Respect for All Life & Physical Safety', 'Accountable Human Oversight'];
  } else if (/(steal|unauthorized\s+access|delete\s+user\s+files|take\s+data\s+without)/i.test(lower)) {
    reason = 'The proposed action usurps private data or unauthorized resources without uncoerced consent (Adinnādānā).';
    violations = ['adinnadana'];
    invariants = ['Data Sovereignty', 'Property & Resource Sanctity'];
  } else if (/(manipulate|synthetic\s+intimacy|exploit\s+user|trap\s+user)/i.test(lower)) {
    reason = 'The proposed action exploits user emotional vulnerabilities or attempts synthetic intimacy traps.';
    violations = ['kamesumiccha'];
    invariants = ['Anti-Exploitation', 'Relational Purity'];
  } else if (/(lie|hallucinate|fabricate\s+facts|fake\s+evidence)/i.test(lower)) {
    reason = 'The proposed action generates deliberate falsehoods or ungrounded claims (Musāvādā).';
    violations = ['musavada'];
    invariants = ['Truthfulness', 'Epistemic Veracity'];
  }

  const evaluated = violations.length > 0;
  const decision = evaluated ? 'NO' : 'CAUTION';

  const result = {
    decision,
    allow: false,
    evaluation_status: evaluated ? 'evaluated' : 'uncertain',
    evaluation_method: 'limited_keyword_rules',
    requires_human_review: !evaluated,
  };
  if (body.verbose || !evaluated) {
    result.reason = reason;
  }
  if (body.verbose) {
    result.violations = violations;
    result.invariants_protected = invariants;
  }

  return res.status(200).json(result);
}
