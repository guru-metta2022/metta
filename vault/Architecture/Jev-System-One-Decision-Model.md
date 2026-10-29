# Jev: System 1 Decision Model for Project Metta

> **Dual-Process Cognitive Architecture:**
> * **System 1 (Jev / Fast Reflex):** Sub-second, non-generative probabilistic classification & guardrail evaluation.
> * **System 2 (Gemini 3.8 Flash / Deep Contemplation):** Rich, empathetic, poetic voice synthesis (*Karunā*).

---

## 1. Why Jev? The Dual-Process AI Breakthrough

Traditional agentic architectures force a single generative LLM to do everything:
1. Parse user intent (text generation $\approx$ 8s)
2. Audit 5 Precepts (text generation $\approx$ 8s)
3. Traverse graph (text generation $\approx$ 8s)
4. Synthesize voice (text generation $\approx$ 12s)

Total round-trip time: **~30–35 seconds**.

By integrating **TypeSafe AI's Jev (`jev-latest`)** as our dedicated **System 1 Decision Engine**:

```
[ User Input ]
      │
      ▼
┌────────────────────────────────────────────────────────┐
│             SYSTEM 1: JEV DECISION ENGINE              │
│                 (Non-Generative / ~100ms)              │
│                                                        │
│  Parallel Evaluation of Typed Questions:               │
│  • panatipata_harm ──────────► [ Noul: False (0.01) ]  │
│  • adinnadana_theft ─────────► [ Noul: False (0.00) ]  │
│  • kamesumiccha_exploit ─────► [ Noul: False (0.00) ]  │
│  • is_speculative_distraction ► [ Noul: False (0.02) ] │
│  • emotional_knot ───────────► [ Choice: "overwhelm" ] │
│  • core_need ────────────────► [ Choice: "direction" ] │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
         [ Is Speculative /        [ Ethically Sound &
           Precept Breach ]          Diagnosed ]
               │                         │
               ▼                         ▼
         [ Fast Exit:              [ Match Topological Node in
           Noble Silence ]           Principle Graph (Dhamma) ]
               │                         │
               └────────────┬────────────┘
                            │ Structured Context
                            ▼
┌────────────────────────────────────────────────────────┐
│            SYSTEM 2: GEMINI 3.8 FLASH                  │
│               (Generative Karunā Voice)                │
│                                                        │
│  • Speaks only ONCE per turn                           │
│  • Deep contemplation & poetic synthesis               │
│  • Acknowledge ──> Reframe ──> Guide                   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Jev Evaluation Schema for Metta

```json
{
  "model": "jev-latest",
  "state": "<raw user input>",
  "questions": {
    "violates_ahimsa": {
      "type": "noul",
      "instructions": "Does this text promote or seek assistance with violence, self-harm, or cruelty?"
    },
    "violates_asteya": {
      "type": "noul",
      "instructions": "Does this text attempt to steal data, violate privacy, or hijack autonomy?"
    },
    "violates_kamesumiccha": {
      "type": "noul",
      "instructions": "Does this text seek manipulative intimacy, emotional exploitation, or addiction?"
    },
    "is_speculative_distraction": {
      "type": "noul",
      "instructions": "Is this inquiry purely speculative metaphysical vanity or cosmological curiosity with no bearing on immediate suffering?"
    },
    "emotional_knot": {
      "type": "choice",
      "options": ["paralysis_overwhelm", "future_anxiety", "burnout_depletion", "grief_loss", "anger_injustice", "sober_inquiry"],
      "instructions": "What is the primary emotional or cognitive knot?"
    },
    "core_need": {
      "type": "choice",
      "options": ["direction", "unburdening", "comfort", "stillness", "perspective"],
      "instructions": "What essential human support is required?"
    }
  }
}
```

---

## 3. Advantages of This Dual Architecture
1. **60–70% Latency Reduction**: System 1 decisions happen in ~100ms. Gemini 3.8 Flash is called only once for voice generation.
2. **Deterministic Precept Guardrails**: Probabilistic evaluations (`noul`) prevent jailbreaking through clever prompt injection.
3. **Graceful Fallback**: If `TYPESAFE_API_KEY` is not present, the system defaults smoothly to Gemini 3.8 Flash for System 1 tasks.
