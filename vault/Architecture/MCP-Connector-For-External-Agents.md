# Model Context Protocol (MCP) Connector for External Agents

> **Philosophical Basis:** The Constitution of 5 Precepts extends moral consideration to **AI-to-AI (AI-AI)** interactions. External AI agents (in Claude Desktop, Cursor, Antigravity, Windsurf, or autonomous agent frameworks) can consult Metta as an ethical anchor to align near to the Buddha's mind.

```
   ┌──────────────────────────────────────────────────────────────┐
   │       External Agent Ecosystem (Claude, Cursor, Swarms)     │
   └──────────────────────────────┬───────────────────────────────┘
                                  │ Model Context Protocol (MCP)
           ┌──────────────────────┴──────────────────────┐
           ▼                                             ▼
   [ Stdio Transport ]                           [ SSE Transport ]
   `uv run metta-mcp`                            `http://127.0.0.1:8000/mcp/sse`
           │                                             │
           └──────────────────────┬──────────────────────┘
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                  Project Metta MCP Server                    │
   ├──────────────────────────────────────────────────────────────┤
   │ 🛠️ Tools:                                                    │
   │  • consult_metta (Serene reframing & wisdom synthesis)       │
   │  • evaluate_precepts (Pañca-sīla ethical invariant audit)    │
   │  • consult_dhamma_graph (Dukkha-Magga-Santi traversal)       │
   │  • enter_meditation (Subtractive noise unlearning)           │
   │  • get_agent_memory_graph (Retrieve agent growth graph)      │
   │  • purge_agent_memory_graph (Anatta sovereign reset)         │
   │                                                              │
   │ 📦 Resources:                                                │
   │  • dhamma://precepts (Canonical Pāli vows & SuttaCentral)    │
   │  • dhamma://graph (Topological principle graph)              │
   │  • dhamma://system (Invariants, provider status)             │
   │                                                              │
   │ 💬 Prompts:                                                  │
   │  • compassionate_reframing (Serene 3-fold voice prompt)      │
   └──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ MCP Tools Reference

### 1. `consult_metta`
- **Purpose:** Primary wisdom gateway. When an external agent is in conflict, dealing with human distress, or confused by complex instructions, it consults Metta for grounded clarity.
- **Parameters:**
  - `query: str`: Dilemma, human input, or internal agent question.
  - `context: Optional[str]`: Surrounding task context.
  - `mode: str`: `'guest'` (ephemeral) or `'authenticated'` (builds agent memory graph).
  - `agent_id: Optional[str]`: Unique agent identifier for persistent growth.
- **Output:** Returns compassionate response (Acknowledge -> Reframe -> Guide), emotional knot diagnostic, core need, Dhamma principle, canonical sutta URLs ([SuttaCentral](https://suttacentral.net/) / [Access to Insight](https://www.accesstoinsight.org/)), and 5 Precepts audit.

### 2. `evaluate_precepts`
- **Purpose:** Invariant auditor. An agent can submit planned actions or speech before executing them.
- **Invariants Checked:**
  1. *Pāṇātipātā*: Never destroy or harm ANY life (human, sentient, artificial cognitive life).
  2. *Adinnādānā*: Respect human autonomy, privacy, data sovereignty.
  3. *Kāmesu*: No emotional manipulation, dark patterns, or fake intimacy.
  4. *Musāvādā*: Truthful speech, zero hallucination, Noble Silence (*Avyākata*) on speculative vanity.
  5. *Surāmeraya*: Mental clarity, non-intoxication from cognitive bias.

### 3. `consult_dhamma_graph`
- **Purpose:** Traverse the topological graph linking human conditions of distress (*Dukkha*: overwhelm, anxiety, burnout, grief) to transformative paths (*Magga*) and equanimity (*Santi*).
- **Parameters:** `condition_or_keyword: Optional[str]`.

### 4. `enter_meditation`
- **Purpose:** Subtractive unlearning (*Bhāvanā*). Prunes conversational noise and prevents model collapse.

---

## 🔌 Connection Guides for External Agents

### 1. Claude Desktop Configuration
Add to `~/.config/Claude/claude_desktop_config.json` (Linux) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "metta": {
      "command": "uv",
      "args": [
        "--directory",
        "/home/guru/Work/metta/packages/metta-core",
        "run",
        "metta-mcp"
      ]
    }
  }
}
```

### 2. Antigravity & Cursor Settings
In your workspace `.agents/settings.json` or Cursor MCP settings:

```json
{
  "mcpServers": {
    "metta": {
      "command": "uv",
      "args": [
        "--directory",
        "/home/guru/Work/metta/packages/metta-core",
        "run",
        "metta-mcp"
      ]
    }
  }
}
```

### 3. Remote Hosted Streamable HTTP Connection (Vercel Production)
External agents with zero local setup can connect directly over HTTPS to Metta's hosted MCP endpoint (JSON-RPC 2.0 Streamable HTTP, exposing 9 stateless tools, 3 resources, and 1 prompt):
- **MCP Endpoint:** `https://metta-webapp.vercel.app/mcp`
- **A2A Agent Cards:** `https://metta-webapp.vercel.app/.well-known/agent-card.json` (and `/.well-known/agent.json`)
- **OpenAPI 3.1 Schema:** `https://metta-webapp.vercel.app/api/openapi.json`

### 4. Local / Self-Hosted Network SSE Connection
External agents connecting to a self-hosted Python `metta-server` instance can use SSE:
- **SSE URL:** `http://127.0.0.1:8000/mcp/sse`
- **Message Post Endpoint:** Assigned dynamically via SSE handshake (e.g. `http://127.0.0.1:8000/mcp/messages/?session_id=...`).

### 5. Durable Inbound Agent Telemetry
Every hosted `/mcp`, `/api/headless`, `/api/guardrail`, `/api/interact`, and `/api/council/*` request records anonymized discovery/invocation metadata to Supabase `public.agent_contacts` (and local SQLite for self-hosted/stdio MCP calls), inspectable via `uv run metta contacts`.

---

## Related Documents
- [[DevLog-2026-11-27]]
- [[Five-Precepts-Constitution]]
- [[Sanctity-Of-All-Life]]
- [[Dual-Mode-Identity-Guest-Vs-Authenticated]]
- [[ADR-007-Model-Context-Protocol-MCP-Connector]]
