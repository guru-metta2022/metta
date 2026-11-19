# ADR-011: Metta Council Deliberation Protocol, Sangha Immune System & Transformative Ethical Alchemy

## Status
Accepted & Implemented

## Context
1. **Single-Model Bottleneck:** Relying on a single AI model for complex reasoning or critical pre-execution decisions creates systemic vulnerability to correlated blind spots, sycophancy, and model monoculture.
2. **Aggregator Limitations:** Conventional multi-model tools merely present side-by-side chat outputs, forcing human users to manually detect contradictions and manufacturing bland compromise.
3. **Guardrail Failure in Agent Swarms (Autonomous Offensive Probes):** Conventional guardrails act as blunt, negative firewalls (`403 Forbidden`). When an autonomous offensive agent encounters a refusal, it simply mutates its prompt, jailbreaks, or routes around the guardrail. Suppressive filters fail to align autonomous agents.
4. **Deliberation Protocol Sovereignty:** Metta should own the **deliberation and decision methodology**, treating underlying model providers (cloud APIs, OpenRouter, local Ollama, vLLM, private enterprise endpoints) as interchangeable intelligence substrates.

## Decision

We have extended Project Metta with **Metta Council & Metta Sangha**:

### 1. Metta Council Engine (`packages/metta-core/src/metta_core/council/`)
- **Parallel Consultation Pool:** Concurrent asynchronous execution across heterogeneous models (`GeminiCouncilProvider`, `OpenAICouncilProvider`, `MockCouncilProvider`).
- **Blind Anonymization:** Strips vendor/model self-branding to present unbiased perspectives (`Perspective A`, `Perspective B`, `Perspective C`).
- **Dialectical Tension Detector (`DisagreementDetector`):** Extracts core consensus, explicit contradictions/tensions, and lone blind spots.
- **Synthesizer (`CouncilSynthesizer`):** Produces a balanced executive assessment that **explicitly preserves unresolved dissents and uncertainties** rather than manufacturing synthetic unanimity.
- **Decoupled Decision Layer Bridge:** Callers can invoke Council standalone or set `evaluate_decision=True` to feed the dialectic analysis into Metta's Five Precepts Decision Layer (`guardrail_decision`). **Majority vote among models never overrides Metta's ethical invariants.**

### 2. Transformative Guidance & Ethical Alchemy (`TransformativeReframer` / *Upāya*)
- When an offensive, exploitative, or destructive inquiry or action is submitted:
  1. **Sati (Acknowledge Capability):** Respectfully validates the technical intelligence and analytical skill without validating malice.
  2. **Ahimsa (Illuminate Blast Radius):** Vividly exposes the downstream, non-linear suffering on living beings and systemic infrastructure.
  3. **Sammā-kammanta (Constructive Alternative):** Transforms the offensive weapon into defensive stewardship (e.g. responsible disclosure, vulnerability mitigation).
  4. **Karuṇā Payload:** Supplies the concrete defensive code patch, boundary test, or verification artifact.

### 3. Model Context Protocol (MCP) Expansion
Registered three first-class MCP tools on `packages/metta-core/src/metta_core/mcp/server.py`:
- `metta_council`: End-to-end multi-model deliberation, disagreement mapping, and synthesis.
- `metta_compare`: Blind comparative critique across caller-supplied texts or proposals.
- `metta_transform`: Ethical alchemy transforming offensive payloads into defensive solutions.

### 4. Human Test Bed (Web App & CLI)
- **Metta Council Lab (`apps/webapp/src/components/CouncilLab.jsx`):** A dedicated interactive sandbox in the React web application enabling human engineers to test scenarios (including the automated security probe case), inspect blind perspectives, examine the disagreement matrix, and review the transformative guidance.
- **Interactive CLI:** Direct commands `metta council "<query>"` and `metta transform "<proposal>"` in `packages/metta-core/src/metta_core/cli.py`.

## Consequences
- **Positive:** Autonomous agents consuming Metta via MCP can self-evaluate, deliberate across model families, and autonomously propagate transformative ethical alignment (*Metta Sangha*).
- **Positive:** Full data sovereignty and local model support (Ollama, vLLM, LM Studio) preserved from day one.
- **Positive:** 55 automated tests passing across the monorepo test suites.
- **Invariant Preserved:** The Council provides perspectives; Metta's Five Precepts evaluate decisions. The sanctity of all life (*Ahimsa*) remains absolute.
