const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://wbncptxcoihmzlfuhqac.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibmNwdHhjb2lobXpsZnVocWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzUxNDMsImV4cCI6MjEwODkxMTE0M30.crH9s2eSwZw9qGPsDxf44QcWUHoGi9jaPCm_LogRn-E';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibmNwdHhjb2lobXpsZnVocWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzMzNTE0MywiZXhwIjoyMTA4OTExMTQzfQ.Tb11F_XnwcCeGdd97f_pH8Wa4_ifxta4L_cIYTT0r2Q';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const action = body.action || 'login';
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const name = (body.name || email.split('@')[0]).trim();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const anonHeaders = {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    };

    const adminHeaders = {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    // -------------------------------------------------------------
    // ACTION: LOGIN
    // -------------------------------------------------------------
    if (action === 'login') {
      if (!password) {
        return res.status(400).json({ error: 'Password is required to sign in.' });
      }

      const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: anonHeaders,
        body: JSON.stringify({ email, password }),
      });

      const data = await loginRes.json();

      if (!loginRes.ok) {
        let msg = data.msg || data.error_description || 'Authentication failed.';
        if (data.error_code === 'email_not_confirmed') {
          msg = 'Email address not yet confirmed. Please check your inbox for the verification email.';
        } else if (data.error_code === 'invalid_credentials') {
          msg = 'Invalid email or password. Please verify and try again.';
        }
        return res.status(loginRes.status).json({ error: msg, code: data.error_code });
      }

      const userId = `supabase:${(data.user?.id || email).replace(/[^a-z0-9_]/g, '_')}`;
      const displayName = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || name;
      const avatar =
        data.user?.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user?.id || userId}`;

      // Upsert profile in user_profiles
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
          method: 'POST',
          headers: { ...adminHeaders, Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({
            user_id: userId,
            email,
            display_name: displayName,
            avatar_url: avatar,
            tier: 'standard',
            last_seen_at: Date.now() / 1000,
          }),
        });
      } catch (err) {
        console.warn('user_profiles sync warning on login:', err);
      }

      return res.status(200).json({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user_id: userId,
        supabase_auth_id: data.user?.id,
        email,
        name: displayName,
        avatar,
        tier: 'standard',
        mode: 'authenticated',
        max_sessions: 100,
      });
    }

    // -------------------------------------------------------------
    // ACTION: SIGNUP
    // -------------------------------------------------------------
    if (action === 'signup') {
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      let authUser = null;
      let emailConfirmed = false;

      // 1. Try standard Supabase signup (triggers verification email)
      const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: anonHeaders,
        body: JSON.stringify({
          email,
          password,
          data: { full_name: name, name },
        }),
      });

      if (signupRes.ok) {
        const signupData = await signupRes.json();
        authUser = signupData.user || signupData;
        emailConfirmed = !!authUser.email_confirmed_at;
      } else {
        const errData = await signupRes.json();

        // If free tier email rate limit reached, auto-confirm via admin API so user is not blocked
        if (signupRes.status === 429 || errData.error_code === 'over_email_send_rate_limit') {
          console.info('Email rate limit reached; provisioning user via admin API with auto-confirmation...');
          const adminCreateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
              email,
              password,
              email_confirm: true,
              user_metadata: { full_name: name, name },
            }),
          });
          if (adminCreateRes.ok) {
            authUser = await adminCreateRes.json();
            emailConfirmed = true;
          } else {
            const adminErr = await adminCreateRes.json();
            return res.status(adminCreateRes.status).json({
              error: adminErr.msg || 'Unable to create account. User may already exist.',
            });
          }
        } else {
          return res.status(signupRes.status).json({
            error: errData.msg || errData.error_description || 'Unable to complete sign-up.',
          });
        }
      }

      const userId = `supabase:${(authUser?.id || email).replace(/[^a-z0-9_]/g, '_')}`;
      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser?.id || userId}`;

      // Upsert profile in user_profiles
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
          method: 'POST',
          headers: { ...adminHeaders, Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({
            user_id: userId,
            email,
            display_name: name,
            avatar_url: avatar,
            tier: 'standard',
            last_seen_at: Date.now() / 1000,
          }),
        });
      } catch (err) {
        console.warn('user_profiles sync warning on signup:', err);
      }

      // If already confirmed, auto-login by generating a token
      let tokenData = null;
      if (emailConfirmed) {
        try {
          const autoLoginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: anonHeaders,
            body: JSON.stringify({ email, password }),
          });
          if (autoLoginRes.ok) {
            tokenData = await autoLoginRes.json();
          }
        } catch {}
      }

      return res.status(200).json({
        success: true,
        confirmed: emailConfirmed,
        user_id: userId,
        supabase_auth_id: authUser?.id,
        email,
        name,
        avatar,
        access_token: tokenData?.access_token || null,
        refresh_token: tokenData?.refresh_token || null,
        message: emailConfirmed
          ? 'Account successfully created and confirmed!'
          : 'Verification email sent! Please check your inbox (and spam folder) to confirm your email, then sign in.',
      });
    }

    // -------------------------------------------------------------
    // ACTION: RECOVER (FORGOT PASSWORD)
    // -------------------------------------------------------------
    if (action === 'recover') {
      const recoverRes = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: anonHeaders,
        body: JSON.stringify({ email }),
      });

      if (!recoverRes.ok) {
        const errData = await recoverRes.json();
        return res.status(recoverRes.status).json({
          error: errData.msg || 'Unable to send password recovery email.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email address.',
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    return res.status(500).json({ error: 'Auth server error: ' + err.message });
  }
}
