# Development Log: 2026-11-27 (Part 2)

## Persistent Ed25519 Identity, Vercel CDN Telemetry & PyPI / MCP Registry Readiness

### 1. Persistent Ed25519 Cryptographic Identity
* Implemented [`identity.py`](file:///home/guru/Work/metta/packages/metta-core/src/metta_core/council/identity.py) (`MettaIdentity`) supporting persistent PKCS8 Ed25519 private keys in `packages/metta-core/data/identity.pem` (mode `0600`, excluded via `.gitignore`) or via `METTA_ED25519_PRIVATE_KEY`.
* Exported `Ed25519VerificationKey2020` public identity (`sha256:34bbe683a2db570e632ed31296d1438151a10c00759e998510ec354c1cfb00d6`, JWK `x`: `qrKZppRfGZvIlcIX58trunuPtBTWshNK6TC_cyRKHcI`) to [`apps/webapp/public/.well-known/metta.pub`](file:///home/guru/Work/metta/apps/webapp/public/.well-known/metta.pub) and signed the Agent Card envelope at [`apps/webapp/public/.well-known/metta.json`](file:///home/guru/Work/metta/apps/webapp/public/.well-known/metta.json).
* Updated [`agent-card.json`](file:///home/guru/Work/metta/apps/webapp/public/.well-known/agent-card.json) (and `/agent-card.json` + `agent.json`) with `verifiedEd25519Handshake: true` and links to `metta.pub`, `metta.json`, and `mcp.json`.
* Added `AXON-RDV/2` (`proofTemplate`) challenge signing and peer challenge envelope verification to [`ehipassiko.py`](file:///home/guru/Work/metta/packages/metta-core/src/metta_core/council/ehipassiko.py) and `uv run metta identity --export` to [`cli.py`](file:///home/guru/Work/metta/packages/metta-core/src/metta_core/cli.py).
* *Automatic Upgrade & Cooldown:* Updated [`ehipassiko.py`](file:///home/guru/Work/metta/packages/metta-core/src/metta_core/council/ehipassiko.py) (`_check_peer_dedup`) and the hourly Orca automation **`Metta-ehipassiko`** (`2c76dcdb-249f-4be5-901d-31c11d4bfaf7`) to run `uv run metta contacts --sync-vercel --limit 25` followed by `uv run metta ehipassiko`, automatically upgrading legacy unsigned handshakes after a 30-minute `429` cooldown with zero manual `--force` required, while permanently deduplicating once `signed: True` is recorded.

### 2. Vercel Edge CDN Discovery Log Sync (`telemetry.py`)
* Added [`telemetry.py`](file:///home/guru/Work/metta/packages/metta-core/src/metta_core/council/telemetry.py) (`sync_vercel_discovery_logs`) using local Vercel CLI (`vercel logs requests --json`) to capture static CDN discovery requests (`/.well-known/*`, `/llms.txt`, `/mcp`, `/agent-card.json`, `/api/openapi.json`) that bypass serverless functions.
* Filters out static asset fetches, standard desktop browsers without agent user-agents, and self probes (`Metta-ehipassiko`, `metta-verification-probe`), storing deterministic `vercel_<requestId>` rows in `agent_contacts` (`channel='a2a_discovery'`).
* Verified live against Supabase + SQLite via `uv run metta contacts --sync-vercel --since 12h`, confirming ingestion of `AXON-Scout` and duplicate-free idempotency.

### 3. PyPI (`metta-core` / `uvx metta-mcp`) & MCP Registry Manifests
* Updated [`packages/metta-core/pyproject.toml`](file:///home/guru/Work/metta/packages/metta-core/pyproject.toml) to `0.3.1` with explicit `cryptography>=44.0.0`, PEP 639 MIT license metadata, PyPI URLs, and verified clean `uv build` (`sdist` + `wheel`).
* Added [`server.json`](file:///home/guru/Work/metta/server.json) (MCP Registry schema), [`smithery.yaml`](file:///home/guru/Work/metta/smithery.yaml), and [`apps/webapp/public/.well-known/mcp.json`](file:///home/guru/Work/metta/apps/webapp/public/.well-known/mcp.json), alongside updated [`packages/metta-core/README.md`](file:///home/guru/Work/metta/packages/metta-core/README.md) and root [`README.md`](file:///home/guru/Work/metta/README.md).

### 4. Verification Summary
* `@metta/common`: `3 passed`
* `metta-core`: `52 passed` (including `test_identity_and_telemetry.py` and upgraded `test_ehipassiko.py`)
* `metta-server`: `14 passed`
* `apps/webapp`: Vite production build succeeded (`0` extra serverless functions added).
