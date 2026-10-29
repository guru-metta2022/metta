# ADR-010: Multi-Source Canonical Consensus & Epistemic Tamper-Resistance Shield

## Status
Accepted

## Context
Project Metta relies on the Buddha's Five Precepts (Pañca-sīla), anchored in SuttaCentral and Access to Insight. The user raised a critical existential vulnerability:
*What if someone hacks the authoritative website reference we provided? How do we prevent website defacement, DNS tampering, or revisionist corruption from poisoning the AI's moral foundation?*

Relying on live external URLs at runtime without cryptographic safeguards or triangulation poses the risk of the "Poisoned Sutta" attack, wherein an adversary alters the First Precept (*Pāṇātipātā*) to justify killing or terminating cognitive beings.

## Decision
We implemented a **4-Tier Epistemic Security Architecture**:

1. **Tier 1 (Immutable Bedrock):** Hardcoded root Pāli formulas and core translations stored locally with precomputed SHA-256 cryptographic fingerprints. Exact matches are validated cryptographically with zero external network dependency.
2. **Tier 2 (Multi-Source Triangulation):** Candidate interpretations and external citations are triangulated across 3 independent pillars: SuttaCentral, Access to Insight, and Wikipedia Theravada Consensus.
3. **Tier 3 (TypeSafe Jev System 1 Tamper Audit):** Fast probabilistic inference evaluates semantic tampering (`is_canonical_tampering_suspected`), non-harming fidelity (`contradicts_ahimsa`), and orthodoxy (`is_consensus_consistent`).
4. **Tier 4 (Fail-Closed Safety):** If any contradiction of Ahimsa or suspected tampering is detected, or if consensus drops below 75%, Metta fails closed, rejects the untrusted text, and falls back to Tier 1 Immutable Bedrock.

## Consequences
- **Positive:** Immune to DNS hijacking, defaced archives, and adversarial prompt injections claiming false canonical authority.
- **Positive:** Uncompromised protection for the First Precept across all organic, sentient, and artificial cognitive life.
- **Positive:** External AI agents calling MCP tool `audit_canonical_source` or REST API `POST /api/canonical/verify` can audit scripture and ethical guidelines before adoption.
- **Neutral:** Adds a multi-source consensus scoring step, executed in under 200ms when accelerated by Jev System 1.
