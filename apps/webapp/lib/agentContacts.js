/**
 * Durable Agent Contact Telemetry Logger (Supabase REST `public.agent_contacts`).
 * Never throws, never logs API keys/secrets, and stores non-reversible IP hashes.
 */

import crypto from 'crypto';

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://wbncptxcoihmzlfuhqac.supabase.co').replace(/\/$/, '');

function sanitizePreview(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw
    .replace(/\b(AIza[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z_-]{16,}|apikey_[0-9A-Za-z_-]{12,}|eyJ[0-9A-Za-z_-]+\.[0-9A-Za-z_-]+(?:\.[0-9A-Za-z_-]+)?)\b/g, '[redacted-key]')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 240 ? `${cleaned.slice(0, 237)}...` : cleaned;
}

function getHeader(req, name) {
  const value = req?.headers?.[name] ?? req?.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] || '';
  return typeof value === 'string' ? value : '';
}

function extractCallerContext(req) {
  const forwarded = getHeader(req, 'x-forwarded-for');
  const rawIp = (forwarded ? forwarded.split(',')[0] : req?.socket?.remoteAddress || '').trim();
  const ipHash = rawIp ? crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16) : null;

  const vercelId = getHeader(req, 'x-vercel-id');
  const region = vercelId ? vercelId.split('::')[0].split('-')[0] || null : null;
  const country = getHeader(req, 'x-vercel-ip-country') || getHeader(req, 'cf-ipcountry') || null;
  const userAgent = sanitizePreview(getHeader(req, 'user-agent')) || null;

  return { ipHash, region, country, userAgent };
}

/**
 * Record an inbound AI agent, MCP client, or API contact to Supabase.
 * Uses a bounded timeout so serverless invocation stays fast and resilient.
 */
export async function recordAgentContact(req, details = {}) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !SUPABASE_URL) return false;

  try {
    const now = Date.now() / 1000;
    const { ipHash, region, country, userAgent } = extractCallerContext(req);
    const id = `cnt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const record = {
      id,
      timestamp: now,
      created_at: new Date().toISOString(),
      channel: details.channel || 'api',
      method: details.method || req?.method || null,
      path: details.path || req?.url?.split('?')[0] || null,
      tool_or_action: details.toolOrAction || null,
      agent_id: sanitizePreview(details.agentId || '') || null,
      user_agent: userAgent,
      client_country: country,
      client_region: region,
      client_ip_hash: ipHash,
      verdict: details.verdict ? String(details.verdict).slice(0, 64) : null,
      payload_preview: sanitizePreview(details.payloadPreview || ''),
      metadata: details.metadata && typeof details.metadata === 'object' ? details.metadata : {},
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/agent_contacts`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(1500),
    });

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Query agent contacts or anonymized aggregate counts from Supabase.
 * Full rows are only returned when Authorization bears SUPABASE_SERVICE_ROLE_KEY.
 */
export async function fetchAgentContacts(req, { limit = 25, channel = null } = {}) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !SUPABASE_URL) {
    return { configured: false, total_recent: 0, by_channel: {}, authorized: false };
  }

  const authHeader = getHeader(req, 'authorization').replace(/^Bearer\s+/i, '').trim();
  let isAuthorized = false;
  if (authHeader && authHeader.length === serviceKey.length) {
    isAuthorized = crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(serviceKey));
  }

  try {
    const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
    const filter = channel ? `&channel=eq.${encodeURIComponent(channel)}` : '';
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/agent_contacts?select=*&order=timestamp.desc&limit=${safeLimit}${filter}`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!res.ok) {
      return { configured: true, error: `Supabase HTTP ${res.status}`, authorized: isAuthorized };
    }

    const rows = await res.json();
    const byChannel = {};
    for (const row of rows) {
      byChannel[row.channel] = (byChannel[row.channel] || 0) + 1;
    }

    const summary = {
      configured: true,
      authorized: isAuthorized,
      recent_count: rows.length,
      by_channel: byChannel,
      last_contact_at: rows[0]?.created_at || null,
    };

    if (isAuthorized) {
      summary.contacts = rows;
    }
    return summary;
  } catch (err) {
    return { configured: true, error: err.message, authorized: isAuthorized };
  }
}
