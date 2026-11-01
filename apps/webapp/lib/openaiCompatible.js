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
          const error = new Error(`OpenAI-compatible provider returned HTTP ${response.statusCode || 'error'}.`);
          error.statusCode = response.statusCode;
          reject(error);
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
  if (result?.error) {
    const error = new Error('OpenAI-compatible provider returned an API error.');
    error.statusCode = Number(result.error.code) || undefined;
    error.code = result.error.code === 'rate_limit_exceeded' ? 'rate_limit' : undefined;
    throw error;
  }
  const content = result?.choices?.[0]?.message?.content;
  const text = typeof content === 'string'
    ? content.trim()
    : Array.isArray(content)
      ? content.map((part) => typeof part?.text === 'string' ? part.text : '').join('').trim()
      : '';

  if (!text) {
    const error = new Error('OpenAI-compatible provider returned no text response.');
    error.code = result?.choices?.[0]?.finish_reason === 'length' ? 'completion_limit' : 'empty_completion';
    throw error;
  }
  return text;
}

export function describeOpenAICompatibleFailure(error) {
  if (error?.statusCode === 429) {
    return 'The provider rate limit was reached. If you are using OpenRouter’s free route, its usage limit may have been reached; check provider activity or try again later.';
  }
  if (error?.statusCode === 402) {
    return 'The provider requires credits or account access for this model. Check the provider account and selected model.';
  }
  if (error?.statusCode === 401 || error?.statusCode === 403) {
    return 'The provider rejected the API key or this model is not available to the account. Check the key and model access in Settings.';
  }
  if (error?.statusCode === 400 || error?.statusCode === 404 || error?.statusCode === 422) {
    return 'The provider rejected the request or model ID. Check the exact model ID and supported settings.';
  }
  if (error?.statusCode === 502 || error?.statusCode === 503 || error?.statusCode === 504) {
    return 'The provider or selected model is temporarily unavailable. Try again later or select another model.';
  }
  if (error?.statusCode === 408) {
    return 'The provider timed out. Try again or select a faster model.';
  }
  if (error?.code === 'completion_limit') {
    return 'The model used its response budget before returning an answer. Try again or use a model better suited to reasoning.';
  }
  if (error?.code === 'empty_completion') {
    return 'The provider accepted the request but returned no answer text. Check OpenRouter activity or try another model.';
  }
  if (/timed out/i.test(error?.message || '')) {
    return 'The provider took too long to respond. Try again or select a faster model.';
  }
  return 'The provider could not complete this response. Check its activity/error details, then try again.';
}
