# ADR-004: Jev as System 1 Fast Decision Engine

* **Status:** Proposed & Architected
* **Date:** 2026-10-29
* **Context:** Metta requires multiple classification and guardrail checks per user turn (5 Precepts evaluation, Noble Silence discrimination, emotional state extraction, core need categorization, and graph node mapping). Using Gemini 3.8 Flash for all of these sequential steps introduces 20–30s of cumulative latency because each step involves generative token decoding.
* **Decision:** Introduce TypeSafe AI's **Jev** (`jev-latest`) as our dedicated System 1 Decision Model.
* **Consequences:**
  * Positive: Cuts total interaction latency by ~65%, shifting from ~30s down to ~10s.
  * Positive: Hard mathematical probabilities for ethical guardrails rather than free-form text hallucinations.
  * Positive: Gemini 3.8 Flash can focus 100% of its reasoning capacity on deep, poetic, compassionate voice synthesis (*Karunā*).
  * Neutral: Requires a `TYPESAFE_API_KEY` (with transparent fallback to Gemini 3.8 Flash when absent).
