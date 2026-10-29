# ADR-005: Unified AIAgent Gateway and Cross-Platform Voice Adapter Architecture

* **Status:** Accepted & Implemented
* **Date:** 2026-10-29
* **Context:** The application serves Web, Android, and iOS clients with real-time streaming voice dictation and needs to support runtime switching across model providers (Gemini 3.8 Flash, local open-source models). Tightly coupling provider-specific SDKs into routes creates fragility and violates clean architecture.
* **Decision:**
  1. Enforce strict Adapter Pattern: `BaseAIProvider(ABC)` abstracts all model providers.
  2. Implement `AIAgent` as a single gateway class exposing `.ask()`.
  3. Implement `VoiceSanitizer.run_diagnostics()` internally in the gateway to clean audio artifacts and stutters before inference.
  4. Expose dynamic runtime provider swapping via `/api/settings`.
* **Consequences:**
  * Positive: Zero provider-specific imports in `main.py` or controllers.
  * Positive: Seamless future migration to local open-source models without altering any application logic.
  * Positive: Common dictation intake supporting Web Speech API, Flutter, and React Native.
