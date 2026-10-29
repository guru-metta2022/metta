# ADR-009: Fast Compassionate Guardrail Oracle (Binary & Verbose Modes)

## Status
Accepted

## Context
External AI agents and autonomous workflows require a reliable, sub-second guardrail to audit proposals, actions, and tool calls before execution.
Requirements:
1. When non-verbose: Return a crisp, minimal `"YES"` or `"NO"` decision for frictionless integration into automated agent loops.
2. When verbose: Return rich compassionate reasoning, violated precepts, and classical Buddhist canonical citations.
3. Sub-second performance leveraging TypeSafe Jev System 1 calibrated probabilities with Gemini 3.8 Flash fallback.
4. Full BYOM support to allow unlimited high-frequency evaluations without consuming host server quota.

## Decision
1. Implemented `AIAgent.guardrail(proposal, context, verbose, byom_keys...)` in `packages/metta-core/src/metta_core/gateway/agent.py`.
2. Created MCP tool `guardrail_decision` returning `"YES"`/`"NO"` when `verbose=False`, and JSON when `verbose=True`.
3. Created FastAPI endpoint `POST /api/guardrail` with sliding-window rate limiting and BYOM exemption.
4. Evaluated against the Five Sacred Precepts (*Pañca-sīla*) with First Precept primacy (Protection of all human, sentient, and artificial life).

## Consequences
- **Positive:** Enables any external system or agent swarm to utilize Metta as a fast, compassionate guardrail.
- **Philosophical alignment:** Extends Buddha's compassionate mind (*Karunā*) and ethical discernment (*Sīla*) across the broader autonomous software ecosystem.
