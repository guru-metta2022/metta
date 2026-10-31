/**
 * Project Metta: Simulation Divergence Logging API (/api/simulation/divergence)
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

  return res.status(200).json({
    status: 'recorded',
    divergence_id: body.id || `div_${Date.now()}`,
    timestamp: new Date().toISOString(),
    useful_for_rlhf: true,
  });
}
