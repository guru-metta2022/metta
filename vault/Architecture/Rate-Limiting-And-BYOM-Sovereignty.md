# Rate Limiting & BYOM (Bring Your Own Model) Sovereignty

> **Operational Mandate:** Project Metta is self-hosted and community-funded. While we practice radical generosity, we must protect our shared server credits and language server instances from runaway exhaustion or accidental denial-of-service.

```
                      ┌────────────────────────────────────────┐
                      │        Inbound Client Request          │
                      │  (Web, Android, iOS, REST API, MCP)    │
                      └───────────────────┬────────────────────┘
                                          │
                        Does request have BYOM API Key?
                        (X-Gemini-Api-Key / X-TypeSafe-Api-Key)
                                          │
                 ┌────────────────────────┴────────────────────────┐
                 ▼                                                 ▼
       [ YES: BYOM Active ]                              [ NO: Shared Server ]
   • Bypasses Rate Limiter                           • Sliding Window Rate Limiter
   • Unlimited throughput                            • 10 req/min, 40 req/hr
   • Runs on personal user quota                     • Shared server credits
   • Zero wait for resets                            • HTTP 429 when quota reached
```

---

## 1. The Precautionary Rate Limiter

- **Algorithm:** In-memory, thread-safe sliding window tracking request timestamps per client IP / user session.
- **Default Thresholds (Configurable via `.env`):**
  - `METTA_RATE_LIMIT_PER_MINUTE=10`
  - `METTA_RATE_LIMIT_PER_HOUR=40`
- **When Quota is Reached:**
  - Emits HTTP 429 Too Many Requests with header `Retry-After: {seconds}`.
  - Returns compassionate message:
    > *"Shared community quota paused (10 req/min). Please wait 45s for reset, or supply your own API key in Settings (BYOM) to proceed immediately with zero rate limits."*

---

## 2. Bring Your Own Model (BYOM) Architecture

Users and external agents can supply their own API keys across **all** channels:

| Interface | Header / Parameter | Behavior |
| :--- | :--- | :--- |
| **Zen Web Interface** | `localStorage` + Settings Modal (⚙️) | Keys stored purely in client-side browser storage; sent via encrypted headers per request. |
| **REST API (`/api/interact`)** | Headers: `X-Gemini-Api-Key`, `X-TypeSafe-Api-Key` | Directly executed against Google Generative Language REST API using client quota. |
| **Voice Dictation (`/api/voice/dictate`)** | Headers: `X-Gemini-Api-Key`, `X-TypeSafe-Api-Key` | Same BYOM bypass for streaming dictation. |
| **Model Context Protocol (MCP)** | Arguments: `byom_gemini_key`, `byom_typesafe_key` | External AI agents (Cursor, Claude, Swarms) can pass their own keys to avoid server throttling. |
| **Mobile (Android / iOS)** | Standard HTTP Gateway Headers | Native mobile wrappers pass the user's stored BYOM keys. |

---

## 3. Direct REST Provider (`GeminiDirectAPIProvider`)
When BYOM is active:
- Metta does **not** consume the server's local `agy` CLI binary or shared credits.
- Instead, it dynamically instantiates `GeminiDirectAPIProvider` to make an outbound call directly to Google Gemini's endpoint using the client's key.
- This isolates each user's quota, protects the host server, and grants the user unconstrained, unlimited performance.

---

## Related Documents
- [[Unified-Interface-Adapter-Pattern]]
- [[MCP-Connector-For-External-Agents]]
- [[Dual-Mode-Identity-Guest-Vs-Authenticated]]
- [[ADR-008-Rate-Limiting-And-BYOM-Sovereignty]]
