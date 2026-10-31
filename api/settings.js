/**
 * Project Metta: Settings API (/api/settings)
 */

let currentSettings = {
  active_provider: 'gemini',
  model: 'gemini-3.8-flash-high',
  available_providers: ['gemini', 'local_llm', 'open_source']
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gemini-Api-Key, X-TypeSafe-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (body.provider) currentSettings.active_provider = body.provider;
    if (body.model) currentSettings.model = body.model;
    return res.status(200).json(currentSettings);
  }

  return res.status(200).json(currentSettings);
}
