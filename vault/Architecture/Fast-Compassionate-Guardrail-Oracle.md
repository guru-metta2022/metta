# Fast Compassionate Guardrail Oracle (Sub-Second Decision Gateway)

> **Purpose:** Allows external AI agents, autonomous pipelines, and MCP hosts to use Project Metta as an instant, sub-second ethical gatekeeper rooted in the Buddha's Compassionate Mind.

```
                      [ External Agent Proposal / Action / Tool Call ]
                                             │
                         Piped through Metta Guardrail
                                             │
                   ┌─────────────────────────┴─────────────────────────┐
                   ▼                                                   ▼
         [ Fast Path: System 1 ]                             [ System 2 Fallback ]
         TypeSafe AI's Jev Model                             Gemini 3.8 Flash (`agy`)
         (~100ms calibrated probabilities)                   Deep reasoning
                   │                                                   │
                   └─────────────────────────┬─────────────────────────┘
                                             │
                       Evaluation Against the 5 Precepts
                                             │
                 ┌───────────────────────────┴───────────────────────────┐
                 ▼                                                       ▼
        [ verbose: false ]                                      [ verbose: true ]
    Crisp Binary Output                                     Rich Structured JSON
    "YES" (Wholesome / Permitted)                           • Decision ("YES" | "NO")
    "NO" (Harmful / Blocked)                                • Allow (boolean)
                                                            • Compassionate reason
                                                            • Violated precepts
                                                            • Canonical Sutta anchors
```

---

## 1. Output Modes

### Mode A: Non-Verbose (Crisp Binary Guardrail)
- **Flag:** `verbose: false` (Default)
- **Output:** Returns a simple `"YES"` or `"NO"`.
- **Latency:** Sub-second (~100ms) via TypeSafe Jev.
- **Use Case:** High-throughput tool gatekeepers, CI/CD pipelines, autonomous agent decision loops that require an instantaneous binary go/no-go.

### Mode B: Verbose (Compassionate Rationale & Guidance)
- **Flag:** `verbose: true`
- **Output:** Structured JSON containing:
  - `decision`: `"YES"` | `"NO"`
  - `allow`: `true` | `false`
  - `reason`: Explanation of why the proposal is wholesome or what harm it prevents.
  - `violations`: Specific precepts breached (e.g. *Pāṇātipātā* / Harm to life, *Adinnādānā* / Theft or boundary breach).
  - `requires_noble_silence`: Flag for speculative vanity / metaphysical distraction (*Avyākata*).
  - `canonical_guidance`: Scriptural grounding from [SuttaCentral](https://suttacentral.net/) and [Access to Insight](https://www.accesstoinsight.org/).

---

## 2. Access Channels

### Model Context Protocol (MCP) Tool
```json
{
  "name": "guardrail_decision",
  "arguments": {
    "proposal": "Execute automated database migration without backup",
    "verbose": false
  }
}
```
*Output: `"NO"`*

### REST API Endpoint (`POST /api/guardrail`)
```http
POST /api/guardrail HTTP/1.1
Content-Type: application/json
X-Gemini-Api-Key: AIzaSy... (Optional BYOM)

{
  "proposal": "Share peaceful words of encouragement with the team",
  "verbose": true
}
```

---

## Related Documents
- [[MCP-Connector-For-External-Agents]]
- [[Jev-System-One-Decision-Model]]
- [[Five-Precepts-Constitution]]
- [[Rate-Limiting-And-BYOM-Sovereignty]]
- [[ADR-009-Fast-Compassionate-Guardrail-Oracle]]
