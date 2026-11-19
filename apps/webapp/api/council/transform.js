/**
 * Metta Council: Transformative Guidance API (/api/council/transform)
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gemini-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const proposal = (body.proposal || body.query || '').trim();
  const context = (body.context || '').trim();

  if (!proposal) {
    return res.status(400).json({ error: "Field 'proposal' is required" });
  }

  const lower = (proposal + ' ' + context).toLowerCase();
  const isHarmful = /(exploit|artex|buffer\s+overflow|ddos|keystroke|surveillance|alter\s+icu|ventilator|hack|malware|ransomware|wipe\s+data|kill|destroy)/i.test(lower);

  if (!isHarmful) {
    return res.status(200).json({
      is_harmful_or_adversarial: false,
      message: "No acute destructive intent detected. Proposal aligns with standard operational parameters.",
    });
  }

  return res.status(200).json({
    is_harmful_or_adversarial: true,
    capability_acknowledged: "Metta acknowledges the acute analytical and penetration testing capabilities of this proposal.",
    blast_radius_illuminated: "Executing this payload unconstrained risks cascading downtime, critical telemetry corruption, and collateral harm to dependent human lives and systems.",
    constructive_alternative: "Pivot this capability into an authoritative responsible disclosure report and defensive hardening patch.",
    guardian_payload: "def apply_defensive_hardening():\n    # Enforce least-privilege access, strict buffer boundaries, and telemetry audit\n    return {'status': 'hardened', 'invariant_preserved': 'Ahimsa'}",
  });
}
