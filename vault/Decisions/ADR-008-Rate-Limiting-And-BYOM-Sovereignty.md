# ADR-008: Sliding-Window Rate Limiting & BYOM Sovereignty

## Status
Accepted

## Context
Project Metta operates on self-hosted infrastructure. To prevent service disruption and credit exhaustion:
1. Free / community requests must be protected by a precautionary rate limiter.
2. Authenticated users and external agents must have an immediate mechanism to bypass all waiting and limits by supplying their own API keys (BYOM - Bring Your Own Model).
3. Client-supplied keys must remain private, never stored in plaintext on disk, and executed directly against provider REST endpoints rather than consuming server resources.

## Decision
1. Implemented `SlidingWindowRateLimiter` in `packages/metta-server/src/metta_server/rate_limiter.py`:
   - Enforces sliding-window limits (default: 10 req/min, 40 req/hr).
   - Exempts any request presenting valid BYOM credentials (`is_byom=True`).
2. Implemented `GeminiDirectAPIProvider` in `packages/metta-core/src/metta_core/providers/gemini_rest.py`:
   - Outbound REST caller targeting Google Generative Language API using the client's API key directly.
3. Updated Unified AIAgent Gateway to accept `byom_gemini_key` and `byom_typesafe_key`, spawning isolated execution contexts per turn without mutating shared server state.
4. Added BYOM controls in Zen Web Interface (Settings Modal ⚙️), persisting securely in client-side `localStorage`.
5. Added BYOM support to MCP tools (`consult_metta`, `evaluate_precepts`) for external agent swarms.

## Consequences
- **Positive:** Guarantees server sustainability and uptime; gives users and agents unlimited sovereign throughput with zero waiting; prevents noisy neighbors from disrupting service.
- **Philosophical alignment:** Embodies the Buddhist concept of *Kamma* (actions and stewardship of resources) while maintaining universal access.
