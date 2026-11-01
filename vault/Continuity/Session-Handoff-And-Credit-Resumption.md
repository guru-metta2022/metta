# Session Handoff & Credit Resumption Blueprint

> **Purpose:** Ensures seamless development continuity across AI agent sessions, context truncations, or refreshed API credit cycles.

---

## 1. Zero-Loss State Guarantee

If this conversation terminates or you resume with a fresh credit allocation, the entire architectural footprint of Project Metta is persisted in four locations:
1. **Local Obsidian Vault (`/vault`):** All philosophical foundations, architectural blueprints, ADRs 001–010, and daily DevLogs (`DevLog-2026-10-29.md`, `DevLog-2026-10-30.md`, `DevLog-2026-10-31.md`).
2. **Project Continuity Anchor ([`CONTINUITY.md`](file:///home/guru/Work/metta/CONTINUITY.md)):** Master quickstart, canonical anchors, and component map.
3. **Local Git Checkout:** Development may include intentional uncommitted work; inspect continuity notes and `git status` before syncing. Never assume the tree is clean or discard local changes.
4. **Live Production Deployment:** Production Web App live at `https://metta-webapp.vercel.app`.

---

## 2. Immediate Handoff Checklist for New Sessions

When beginning a new session or switching model credits:
1. **Verify Environment Variables:**
   - Check that `.env` contains `TYPESAFE_API_KEY`.
   - Ensure local `agy` binary (`/home/guru/.local/bin/agy`) is accessible and running.
2. **Verify Integrity of Both Suites:**
   ```bash
   cd packages/metta-core && /home/guru/Work/metta/packages/metta-core/.venv/bin/pytest tests
   cd ../metta-server && /home/guru/Work/metta/packages/metta-server/.venv/bin/pytest tests
   ```
   Both test suites must pass 100% (currently 43/43 passing: 30 in core, 13 in server).
3. **Verify Git Working Tree:**
   ```bash
   git status
   ```
   Preserve intentional uncommitted and untracked work. Inspect continuity notes before syncing or pushing.
4. **Check Active Server & Production Endpoints:**
   ```bash
   # Local Health
   curl -s http://127.0.0.1:8000/api/health
   # Live Headless Triadic Endpoint
   curl -s -X POST https://metta-webapp.vercel.app/api/headless -H "Accept: text/markdown" -d '{"query": "ping"}'
   ```

---

## 3. Active Capabilities Implemented
- [x] **Generative provider options:** hosted app supports Gemini and public HTTPS OpenAI-compatible Chat Completions endpoints (endpoint, key, model, optional reasoning effort); self-hosted gateways may configure local model services.
- [x] **TypeSafe Jev System 1 Decision Model** (`TypeSafe-Danger-Zone-Images: true`).
- [x] **Canonical Anchors** to SuttaCentral and Access to Insight with SHA-256 local bedrock.
- [x] **Strict Primacy of 5 Precepts** & Inviolability of All Life (*Ahimsa*).
- [x] **Multi-Platform Voice Dictation Sanitizer** (`VoiceSanitizer.run_diagnostics()`).
- [x] **Editable text polish:** main chat and Simulation Lab use the selected hosted generative provider to improve typed or transcribed text; results replace the draft for review/editing and are never auto-submitted.
- [x] **Reflection, Decision & Resolution Framework UI**:
  - `CollapsibleBubble.jsx` (>2 lines / ~160 chars with smooth gradient fade).
  - `TriadFrameworkCard.jsx` embedded in messages.
  - `FrameworkModal.jsx` explainer.
- [x] **Headless Agent Module (`/api/headless`) & `llms.txt` Standard**:
  - JSON and token-lean Markdown formats for external AI agents and bots.
- [x] **Two-Tier Precedent Memory (*Vinaya Vinicchaya*)**:
  - Zero-bloat Core Dhamma Graph node (`control:covert_surveillance`) anchored to MN 61.
  - Instant topological glance (<1ms) anchoring live evaluations.
  - Isolated Supabase `simulation_divergences` table for RLHF dataset curation.
- [x] **Dual Identity Modes** (Guest vs. Google/Supabase Email Authenticated).
- [x] **Sovereign Personal Memory Graph** (`SQLiteMemoryStore` + `SupabaseMemoryStore`).
- [x] **MCP Server** for external agent integration (Stdio & SSE).

---

## Latest local/unpushed work (2026-11-01)
- Hosted Settings supports Gemini or a public HTTPS OpenAI-compatible chat-completions provider plus a separate TypeSafe Jev key. Main chat and hosted headless/Simulation Lab routes call Jev first; the selected generative provider composes a human-facing response from the verdict and observations. Missing/unavailable Jev fails closed to CAUTION without a model completion. Hosted UI does not offer local LM Studio.
- `npm run build`, route/helper syntax checks, `git diff --check`, and duplicate route comparison passed. These changes have not been pushed or deployed. The untracked Jev helper is `apps/webapp/lib/typesafeJev.js`.
- Before pushing, inspect `git status`, all diffs, and remote `main`; preserve all local changes and do not force push.

## Related Documents
- [[Index]]
- [[DevLog-2026-10-30]]
- [[DevLog-2026-10-31]]
- [[Dual-Mode-Identity-Guest-Vs-Authenticated]]
- [[Personal-Memory-Graph-Supabase]]
- [[ADR-006-Dual-Identity-And-Personal-Memory-Graph]]
- [[ADR-010-Multi-Source-Canonical-Consensus-Shield]]

- Simulation Lab uses hosted `/api/headless` for Vercel production because `/api/guardrail` has no Vercel function; it displays whether Jev ran and uses the Jev-informed reflection. User Jev keys are browser-held and sent to the API only for review; `TYPESAFE_API_KEY` is a server-side fallback. No live Jev call was made.
