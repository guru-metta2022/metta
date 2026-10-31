# Session Handoff & Credit Resumption Blueprint

> **Purpose:** Ensures seamless development continuity across AI agent sessions, context truncations, or refreshed API credit cycles.

---

## 1. Zero-Loss State Guarantee

If this conversation terminates or you resume with a fresh credit allocation, the entire architectural footprint of Project Metta is persisted in four locations:
1. **Local Obsidian Vault (`/vault`):** All philosophical foundations, architectural blueprints, ADRs 001–010, and daily DevLogs (`DevLog-2026-10-29.md`, `DevLog-2026-10-30.md`, `DevLog-2026-10-31.md`).
2. **Project Continuity Anchor ([`CONTINUITY.md`](file:///home/guru/Work/metta/CONTINUITY.md)):** Master quickstart, canonical anchors, and component map.
3. **Local Git History (`main` branch):** Every feature is atomically committed with clean commits authored by `Guru <guru.metta2022@gmail.com>`.
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
   Ensure tree is clean and work is on `main`.
4. **Check Active Server & Production Endpoints:**
   ```bash
   # Local Health
   curl -s http://127.0.0.1:8000/api/health
   # Live Headless Triadic Endpoint
   curl -s -X POST https://metta-webapp.vercel.app/api/headless -H "Accept: text/markdown" -d '{"query": "ping"}'
   ```

---

## 3. Active Capabilities Implemented
- [x] **Gemini 3.8 Flash** via Antigravity Language Server / `agy` CLI & BYOM Gemini REST.
- [x] **TypeSafe Jev System 1 Decision Model** (`TypeSafe-Danger-Zone-Images: true`).
- [x] **Canonical Anchors** to SuttaCentral and Access to Insight with SHA-256 local bedrock.
- [x] **Strict Primacy of 5 Precepts** & Inviolability of All Life (*Ahimsa*).
- [x] **Multi-Platform Voice Dictation Sanitizer** (`VoiceSanitizer.run_diagnostics()`).
- [x] **Acoustic Speech Purifier & Polish AI Engine** (Phoneme corrections for `"read them a"` $\rightarrow$ `"treat them as"`, etc.).
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

## Related Documents
- [[Index]]
- [[DevLog-2026-10-30]]
- [[DevLog-2026-10-31]]
- [[Dual-Mode-Identity-Guest-Vs-Authenticated]]
- [[Personal-Memory-Graph-Supabase]]
- [[ADR-006-Dual-Identity-And-Personal-Memory-Graph]]
- [[ADR-010-Multi-Source-Canonical-Consensus-Shield]]
