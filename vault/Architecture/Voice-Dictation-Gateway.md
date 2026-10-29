# Voice Dictation Gateway & Diagnostics

> **Cross-Platform Audio & Speech Sanitization (Web, iOS, Android)**

---

## 1. Multi-Platform Voice Intake

Whether input originates from:
* The browser's native **Web Speech API** (`webkitSpeechRecognition`),
* Flutter's **`speech_to_text`** (Android / iOS), or
* React Native's **`@react-native-voice/voice`**,

All platforms transmit their speech transcription payloads to the same unified endpoint:
```http
POST /api/interact
{
  "text": "Um, uh, [noise] I am feeling so overwhelmed...",
  "source": "voice"
}
```

---

## 2. The Internal Diagnostic Pass (`run_diagnostics()`)

Before any computational or LLM resources are engaged, `VoiceSanitizer.run_diagnostics()` executes:

1. **Microphone Artifact & Jitter Stripping:**
   * Removes filler tokens: `"um"`, `"uh"`, `"umm"`, `"ahh"`, `"erm"`.
   * Removes bracketed audio markers: `"[noise]"`, `"[silence]"`, `"[audio]"`.
2. **Stutter De-duplication:**
   * Collapses repeated stutter words (e.g., `"I... I... I am"` $\rightarrow$ `"I am"`).
3. **Pure Noise / Empty Packet Early Exit:**
   * If the client records only a faint background noise or empty buffer (< 2 characters), the engine bypasses heavy LLMs and returns a tranquil, compassionate listening prompt immediately (< 50ms):
   > *"I heard a faint sound or whisper, but the words did not take form. Whenever you are ready to speak, I am here listening with a quiet heart."*

---

## Related Notes
* [[Unified-Interface-Adapter-Pattern]]
* [[ADR-005-Unified-AIAgent-Adapter-Architecture]]
