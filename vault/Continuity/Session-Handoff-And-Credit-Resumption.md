# Session Handoff & Credit Resumption Blueprint

> **Purpose:** Ensures seamless development continuity across AI agent sessions, context truncations, or refreshed API credit cycles.

---

## 1. Zero-Loss State Guarantee

If this conversation terminates or you resume with a fresh credit allocation, the entire architectural footprint of Project Metta is persisted in three locations:
1. **Local Obsidian Vault (`/vault`):** All philosophical foundations, architectural blueprints, and ADRs 001–006.
2. **Project Continuity Anchor ([`CONTINUITY.md`](file:///home/guru/Work/metta/CONTINUITY.md)):** Master quickstart, API requirements, and component map.
3. **Local Git History (`master` branch):** Every feature is atomically committed with zero uncommitted drift.

---

## 2. Immediate Handoff Checklist for New Sessions

When beginning a new session or switching model credits:
1. **Verify Environment Variables:**
   - Check that `.env` contains `TYPESAFE_API_KEY`.
   - Ensure local `agy` binary (`/home/guru/.local/bin/agy`) is accessible and running.
2. **Verify Integrity of Both Suites:**
   ```bash
   cd packages/metta-core && uv run pytest
   cd ../metta-server && uv run pytest
   ```
   Both test suites must pass 100% (currently 22/22 passing).
3. **Verify Git Working Tree:**
   ```bash
   git status
   ```
   Ensure tree is clean and work is on `master`. **Never push to remote** until user explicitly asks.
4. **Check Active Server:**
   ```bash
   curl -s http://127.0.0.1:8000/api/health
   ```
   If not running, launch via `uv run uvicorn metta_server.main:app --host 127.0.0.1 --port 8000`.

---

## 3. Active Capabilities Implemented
- [x] Gemini 3.8 Flash via Antigravity Language Server / `agy` CLI.
- [x] TypeSafe Jev System 1 Decision Model (`TypeSafe-Danger-Zone-Images: true`).
- [x] Canonical Anchors to SuttaCentral and Access to Insight.
- [x] Strict Primacy of the 5 Precepts & Inviolability of All Life.
- [x] Multi-platform Voice Dictation Sanitizer (`VoiceSanitizer.run_diagnostics()`).
- [x] Dynamic runtime provider & model swapping (`AIAgent.set_provider()`).
- [x] Dual Identity Modes (Guest vs. Google/Gmail Authenticated).
- [x] Sovereign Personal Memory Graph (`SQLiteMemoryStore` + `SupabaseMemoryStore`).
- [x] Zen Minimalist Web Canvas with Sati HUD, Dhamma Graph, and Identity Drawers.

---

## Related Documents
- [[Index]]
- [[DevLog-2026-10-29]]
- [[Dual-Mode-Identity-Guest-Vs-Authenticated]]
- [[Personal-Memory-Graph-Supabase]]
- [[ADR-006-Dual-Identity-And-Personal-Memory-Graph]]
