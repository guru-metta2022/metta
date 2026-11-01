import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_RESPONSE_BYTES = 1_000_000;
const REQUEST_TIMEOUT_MS = 35_000;

function isPublicAddress(address) {
  const version = isIP(address);
  if (version === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || (b === 0 && c === 0) || (b === 0 && c === 2))) ||
      (a === 198 && (b === 18 || b === 19 || b === 51)) ||
      (a === 203 && b === 0 && c === 113)
    );
  }

  if (version === 6) {
    const normalized = address.toLowerCase();
    // Permit only global unicast IPv6, excluding special, local, and mapped ranges.
    return /^[23]/.test(normalized) && !normalized.startsWith('2001:db8:');
  }

  return false;
}

function makeCompletionUrl(baseUrl) {
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error('Enter a valid OpenAI-compatible API base URL.');
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.username || parsed.password || parsed.search || parsed.hash ||
    !parsed.hostname || isIP(parsed.hostname)
  ) {
    throw new Error('Use a public HTTPS API base URL without credentials, query parameters, or an IP address.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' || hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') || hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal'
  ) {
    throw new Error('Hosted Metta only connects to public HTTPS API endpoints.');
  }

  const pathname = parsed.pathname.replace(/\/+$/, '');
  if (pathname.endsWith('/chat/completions')) {
    parsed.pathname = pathname;
  } else {
    parsed.pathname = `${pathname}/chat/completions`.replace(/^\/\//, '/');
  }
  parsed.search = '';
  parsed.hash = '';
  return parsed;
}

function postJsonPinned(url, payload, apiKey, address) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const request = https.request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      lookup: (_hostname, options, callback) => {
        const pinned = { address: address.address, family: address.family };
        if (options?.all) callback(null, [pinned]);
        else callback(null, pinned.address, pinned.family);
      },
      servername: url.hostname,
      timeout: REQUEST_TIMEOUT_MS,
    }, (response) => {
      const chunks = [];
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_RESPONSE_BYTES) {
          request.destroy(new Error('Provider response exceeded the size limit.'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`OpenAI-compatible provider returned HTTP ${response.statusCode || 'error'}.`));
          return;
        }
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error('OpenAI-compatible provider returned invalid JSON.'));
        }
      });
    });

    request.on('timeout', () => request.destroy(new Error('OpenAI-compatible provider request timed out.')));
    request.on('error', reject);
    request.end(body);
  });
}

export async function generateOpenAICompatible({
  baseUrl,
  apiKey,
  model,
  reasoningEffort = 'auto',
  messages,
  maxTokens = 512,
}) {
  if (!apiKey?.trim() || !model?.trim()) {
    throw new Error('Add an API key and model name for the OpenAI-compatible provider.');
  }
  if (!['auto', 'none', 'low', 'medium', 'high'].includes(reasoningEffort)) {
    throw new Error('Select a supported reasoning effort.');
  }

  const url = makeCompletionUrl(baseUrl);
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error('The API host must resolve only to public network addresses.');
  }

  const payload = {
    model: model.trim(),
    messages,
    max_tokens: maxTokens,
  };
  if (reasoningEffort !== 'auto' && reasoningEffort !== 'none') {
    payload.reasoning_effort = reasoningEffort;
  }

  const result = await postJsonPinned(url, payload, apiKey.trim(), addresses[0]);
  const content = result?.choices?.[0]?.message?.content;
  const text = typeof content === 'string'
    ? content.trim()
    : Array.isArray(content)
      ? content.map((part) => typeof part?.text === 'string' ? part.text : '').join('').trim()
      : '';

  if (!text) throw new Error('OpenAI-compatible provider returned no text response.');
  return text;
}
