const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://wbncptxcoihmzlfuhqac.supabase.co').replace(/\/$/, '');
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibmNwdHhjb2lobXpsZnVocWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzMzNTE0MywiZXhwIjoyMTA4OTExMTQzfQ.Tb11F_XnwcCeGdd97f_pH8Wa4_ifxta4L_cIYTT0r2Q';

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
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email address is required' });
    }

    const name = body.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const userId = `google:${email.replace(/[^a-z0-9_]/g, '_')}`;
    const avatar = body.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`;

    const headers = {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    let authUserId = null;
    let isNewAuthUser = false;

    // 1. Register or find user in Supabase Authentication (auth.users)
    try {
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          email_confirm: true,
          user_metadata: { full_name: name, name, avatar_url: avatar },
        }),
      });

      if (createRes.ok) {
        const createdUser = await createRes.json();
        authUserId = createdUser?.id;
        isNewAuthUser = true;
      } else {
        // If user already exists (422), query existing user record in auth.users
        const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers,
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          authUserId = listData.users?.[0]?.id || null;
        }
      }
    } catch (authErr) {
      console.warn('Supabase auth.users provisioning warning:', authErr);
    }

    // 2. Upsert user record into Supabase user_profiles table
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          user_id: userId,
          email,
          display_name: name,
          avatar_url: avatar,
          tier: 'standard',
          last_seen_at: Date.now() / 1000,
        }),
      });
    } catch (profileErr) {
      console.warn('Supabase user_profiles upsert warning:', profileErr);
    }

    return res.status(200).json({
      user_id: userId,
      supabase_auth_id: authUserId,
      email,
      name,
      avatar,
      tier: 'standard',
      mode: 'authenticated',
      max_sessions: 100,
      supabase_connected: true,
      is_new_user: isNewAuthUser,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Authentication failed: ' + err.message,
    });
  }
}
