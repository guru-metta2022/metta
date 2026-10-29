# Unified Interface & Adapter Pattern: The Core Abstraction Directive

> **Mandate:** Absolute provider-agnostic abstraction across controllers, routes, and business logic.

---

## 1. The Core Directive: Absolute Abstraction

1. **Zero Provider SDK Imports in Application Routes:**
   * No direct imports of Google Gemini SDK, OpenAI SDK, Anthropic SDK, or device-specific mobile speech APIs in `main.py`, controllers, or routes.
   * Every model driver and external service is hidden behind `BaseAIProvider(ABC)`.

2. **Isolated Adapter Boundary:**
   * If an underlying model changes (e.g. migrating from Gemini 3.8 Flash to a local quantized open-source model), only its isolated adapter file in `gateway/adapters/` is touched.
   * The rest of the application remains 100% untouched.

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT SURFACES                      │
│     Web Client  •  Android Client  •  iOS Client       │
└───────────────────────────┬────────────────────────────┘
                            │ Raw Text or Voice Stream
┌───────────────────────────▼────────────────────────────┐
│                  MAIN ROUTER / SERVER                  │
│                   (`metta_server`)                     │
│    • Zero provider SDK imports                         │
│    • Calls ONLY `ai_agent.ask()` or `ai_agent.set()`   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              AIAgent (UNIFIED GATEWAY)                 │
│  • Speech Sanitization (`run_diagnostics()`)           │
│  • System 1 Jev Evaluation                             │
│  • Topological Principle Graph Routing                 │
│  • Dynamic Provider Dispatcher                         │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ GeminiAntigravityAdapter │  │     LocalLLMAdapter      │
│  (Google Antigravity API)│  │ (OpenAI-Compatible local)│
└──────────────────────────┘  └──────────────────────────┘
```

---

## 2. Dynamic Provider Swapping
* Metta provides runtime switching between:
  * `gemini`: Google Antigravity Gemini 3.8 Flash (Default)
  * `local_llm`: Local models running on LM Studio / llama.cpp (`localhost:1234/v1`)
  * `open_source`: Custom open source deployments
* Switchable via `POST /api/settings` or through the Zen Web UI Settings modal without restarting the server.

---

## Related Notes
* [[Voice-Dictation-Gateway]]
* [[ADR-005-Unified-AIAgent-Adapter-Architecture]]
* [[System-Overview]]
