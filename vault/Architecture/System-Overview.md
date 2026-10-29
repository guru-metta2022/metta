# System Overview: Project Metta

> **The Compassionate Synthesis Engine (CSE)**

---

## 5-Layer Cognitive Pipeline

```
           [ User Input ]
                 │
                 ▼
      [ Layer 1: Sati (Observer) ]
      • Emotional State Diagnosis
      • Cognitive Knot Extraction
      • Core Need Discretion
                 │
                 ▼
      [ Layer 2: Sīla (Ethical Compass) ]
      • 5 Precepts Audit
      • Avyākata (Noble Silence) Gate
          │                       │
      (Violates / Speculative)   (Ethically Wholesome)
          │                       │
          ▼                       ▼
    [ Redirection / ]    [ Layer 3: Dhamma (Principle Graph) ]
    [ Noble Silence ]    • Dukkha Condition ──(Magga)──> Santi Equanimity
          │                       │
          └───────────┬───────────┘
                      ▼
      [ Layer 4: Karunā (Voice Synthesizer) ]
      • Acknowledge ──> Reframe ──> Guide
                      │
                      ▼
             [ Human User Receives ]
                      │
                      ▼
      [ Layer 5: Bhāvanā (Subtractive Unlearning) ]
      • Session Memory Ephemeral Audit
      • Noise / Ego / Trivia Pruning
      • Distill Timeless Invariant to Graph
      • Return Context to Śūnyatā (Stillness)
```

---

## Modularity & Structure
* `packages/metta-core`: Standalone Python engine with NetworkX graph and Gemini 3.8 Flash provider.
* `packages/metta-server`: High-performance FastAPI bridge with streaming and graph endpoints.
* `packages/metta-web`: Tranquil, contemplative Zen Web Interface for human-AI dialogue.

## Related Documents
* [[Five-Precepts-Constitution]]
* [[Principle-Knowledge-Graph]]
* [[Bhavana-Subtractive-Unlearning]]
* [[ADR-001-Gemini-3.8-Flash-Antigravity]]
