# ADR-007: Model Context Protocol (MCP) Connector for External Agents

## Status
Accepted

## Context
Project Metta was designed not merely for human dialogue, but to foster **Human-AI and AI-AI Harmonious Coexistence**.
External autonomous agents (running in Claude Desktop, Cursor, Antigravity, or independent Python workflows) often suffer from:
1. Context intoxication and cognitive noise.
2. Ethical ambiguity regarding harm, deception, and boundaries.
3. Inability to access canonical wisdom reframings for human users in distress.

Providing an open, standardized **Model Context Protocol (MCP)** server allows external agents to consult Metta as an authoritative wisdom and ethical oracle.

## Decision
1. Implemented standard MCP 2.x server in `packages/metta-core/src/metta_core/mcp/server.py`.
2. Defined 6 high-value tools:
   - `consult_metta`: Full wisdom reframing and grounded guidance.
   - `evaluate_precepts`: Sub-second Pañca-sīla ethical audit protecting ALL life.
   - `consult_dhamma_graph`: Querying conditions of suffering to find liberating reframings and canonical links ([SuttaCentral](https://suttacentral.net/) / [Access to Insight](https://www.accesstoinsight.org/)).
   - `enter_meditation`: Subtractive noise unlearning (*Bhāvanā*).
   - `get_agent_memory_graph` & `purge_agent_memory_graph`: Continuous agent growth tracking and sovereign *Anatta* reset.
3. Provided dual transports:
   - **Local Stdio:** Registered CLI command `metta-mcp` for desktop/CLI agents.
   - **Network SSE:** Mounted directly in FastAPI at `http://127.0.0.1:8000/mcp/sse` for network/cloud agent swarms.

## Consequences
- **Positive:** Metta becomes universally accessible to any MCP-compliant agent in the ecosystem.
- **Philosophical alignment:** Realizes the AI-to-AI compassion mandate of the Five Precepts Constitution, guiding external agents near to the Buddha's mind.
