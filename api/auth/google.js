export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Gemini-Api-Key, X-TypeSafe-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email address is required' });
    }

    const name = body.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const userId = `google:${email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;

    return res.status(200).json({
      user_id: userId,
      email: email,
      name: name,
      avatar: body.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      tier: 'standard',
      mode: 'authenticated',
      max_sessions: 100,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Authentication failed: ' + err.message,
    });
  }
}
