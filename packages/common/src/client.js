/**
 * Universal Metta Gateway API Client
 * Compatible with Browser, React Native (Android/iOS), and Node.js.
 */

export class MettaClient {
  /**
   * @param {Object} options
   * @param {string} [options.baseUrl] - Base URL for Metta server (default: window.location.origin or http://localhost:8000)
   * @param {string} [options.apiKey] - Optional BYOM Gemini/Provider key for rate-limit bypass
   */
  constructor(options = {}) {
    const defaultOrigin =
      typeof window !== "undefined" && window.location
        ? window.location.origin
        : "http://localhost:8000";
    this.baseUrl = (options.baseUrl || defaultOrigin).replace(/\/$/, "");
    this.apiKey = options.apiKey || null;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };
    if (this.apiKey) {
      headers["X-Metta-Key"] = this.apiKey;
    }
    return headers;
  }

  /**
   * Check gateway server health
   */
  async health() {
    const res = await fetch(`${this.baseUrl}/api/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  }

  /**
   * Send text prompt to Unified AI Gateway (Guest or Authenticated mode)
   */
  async interact({ prompt, userId = null, email = null, provider = null, model = null }) {
    const payload = {
      prompt,
      user_id: userId,
      email,
      provider,
      model,
    };
    const res = await fetch(`${this.baseUrl}/api/interact`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    return res.json();
  }

  /**
   * Advisory guardrail. The result can be YES, NO, or CAUTION; only YES is allowed.
   */
  async guardrail({ proposal, action, context = "", verbose = false, include_human_response = false }) {
    const candidate = proposal || action;
    const res = await fetch(`${this.baseUrl}/api/guardrail`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ proposal: candidate, context, verbose, include_human_response }),
    });
    if (!res.ok) throw new Error(`Guardrail query failed: ${res.statusText}`);
    return res.json();
  }

  /**
   * Submit audio text for multi-platform microphone artifacts sanitization
   */
  async dictateVoice(rawText) {
    const res = await fetch(`${this.baseUrl}/api/voice/dictate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ raw_text: rawText }),
    });
    if (!res.ok) throw new Error(`Voice sanitization failed: ${res.statusText}`);
    return res.json();
  }

  /**
   * Verify canonical sutta against bedrock SHA-256 and multi-source consensus
   */
  async verifyCanonical(suttaId) {
    const res = await fetch(`${this.baseUrl}/api/canonical/verify?sutta_id=${encodeURIComponent(suttaId)}`);
    if (!res.ok) throw new Error(`Canonical verification failed: ${res.statusText}`);
    return res.json();
  }

  /**
   * Get sovereign user memory graph
   */
  async getUserGraph(userId) {
    const res = await fetch(`${this.baseUrl}/api/user/graph?user_id=${encodeURIComponent(userId)}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch user graph: ${res.statusText}`);
    return res.json();
  }

  /**
   * Sovereign Anatta Purge - completely delete user memory graph
   */
  async purgeUserGraph(userId) {
    const res = await fetch(`${this.baseUrl}/api/user/graph?user_id=${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to purge user graph: ${res.statusText}`);
    return res.json();
  }

  /**
   * Get sovereign user profile from Supabase
   */
  async getUserProfile(userId) {
    const res = await fetch(`${this.baseUrl}/api/user/profile?user_id=${encodeURIComponent(userId)}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch user profile: ${res.statusText}`);
    return res.json();
  }

  /**
   * Get configurable rate limit tiers from Supabase
   */
  async getRateLimitConfigs() {
    const res = await fetch(`${this.baseUrl}/api/rate-limit/configs`);
    if (!res.ok) throw new Error(`Failed to fetch rate limit configs: ${res.statusText}`);
    return res.json();
  }

  /**
   * Update rate limit tier in Supabase
   */
  async updateRateLimitConfig({ tier, maxPerMinute, maxPerHour, description = null }) {
    const res = await fetch(`${this.baseUrl}/api/rate-limit/configs`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        tier,
        max_per_minute: maxPerMinute,
        max_per_hour: maxPerHour,
        description,
      }),
    });
    if (!res.ok) throw new Error(`Failed to update rate limit config: ${res.statusText}`);
    return res.json();
  }

  /**
   * Trigger subtractive unlearning meditation audit
   */
  async meditate() {
    const res = await fetch(`${this.baseUrl}/api/meditate`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Meditation cycle failed: ${res.statusText}`);
    return res.json();
  }
}
