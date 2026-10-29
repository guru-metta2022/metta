# Dual-Mode Identity Architecture: Guest vs. Authenticated

In Project Metta, identity is governed by Buddhist philosophy, specifically the interplay between **Shoshin** (Beginner's Mind) and **Anatta** (Non-identification / Sovereign Release).

```
                      ┌────────────────────────────────┐
                      │    User Interaction Gateway    │
                      └──────────────┬─────────────────┘
                                     │
                    Identity Mode Dispatched at Ask()
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
   [ 👤 Guest Mode ]                                  [ 🌿 Authenticated Mode ]
   • Beginner's Mind (Shoshin)                        • Persistent Personal Graph
   • Zero Memory Retained                             • Knots, Tendencies, Milestones
   • Ephemeral WebSocket/HTTP                         • Accessed ONLY when user asks
   • Universal Dhamma Graph only                      • Integrated with Dhamma Graph
                                                      • Sovereign Purge (*Anatta*)
```

---

## 1. Mode 1: Guest Mode (*Shoshin* / Beginner's Mind)
- **Concept:** Every inquiry is met without past preconceptions or baggage.
- **Data Footprint:** Strictly zero persistence. No database row created, no cookies tracked.
- **Wisdom Source:** Operates purely using the **Universal Principle Knowledge Graph** (anchored in canonical texts from [[Canonical-Anchors-SuttaCentral-AccessToInsight|SuttaCentral & Access to Insight]]).
- **Use Case:** Walk-in users seeking immediate grounding, anonymous queries, or users intentionally desiring non-continuous dialogue.

---

## 2. Mode 2: Authenticated Mode (Google / Gmail Login)
- **Concept:** A sovereign topological graph that grows with the user's spiritual and cognitive trajectory.
- **On-Demand Graph Access:**
  - The personal graph is **never** preloaded into long-running context.
  - It is queried **only when the user submits an inquiry**.
  - The user's active emotional knot and core need are cross-referenced with past recurring knots (e.g. `pattern:burnout`, `pattern:overwhelm`).
  - If a knot has recurred, Metta notes what Dhamma principles previously provided relief (e.g. *Viriya*, *Paccaya*, *Khandha*).
  - Karunā voice synthesis speaks with gentle continuity: honoring past breakthroughs without robotic repetition.
- **Automatic Milestone Distillation:**
  - When an observed tendency recurs three times, Metta synthesizes a **Growth Milestone** (e.g., *"Recognized recurring tendency around burnout; anchored with Balanced Energy (Viriya)"*).

---

## 3. Sovereign Purge (*Anatta* / Non-Attachment)
In accordance with the **Second Precept (Asteya / Non-taking)** and the doctrine of **Anatta**:
- The human retains absolute, irrevocable sovereignty over their digital footprint.
- With a single click (`DELETE /api/user/graph`), all pattern nodes, occurrence counters, and milestones are permanently expunged.
- The user instantly returns to Beginner's Mind.

---

## Related Notes
- [[Personal-Memory-Graph-Supabase]]
- [[Unified-Interface-Adapter-Pattern]]
- [[Five-Precepts-Constitution]]
- [[ADR-006-Dual-Identity-And-Personal-Memory-Graph]]
