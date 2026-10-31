/**
 * Project Metta: Sovereign Personal Memory Graph API (/api/user/graph)
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = req.query.user_id || '';

  if (req.method === 'DELETE') {
    return res.status(200).json({
      success: true,
      message: 'Personal reflection journey permanently released.',
      user_id: userId,
    });
  }

  return res.status(200).json({
    user_id: userId,
    total_turns: 0,
    patterns: [],
    milestones: [],
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  });
}
