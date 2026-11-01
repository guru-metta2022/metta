# Metta Core (`metta-core`)

Metta Core powers two related but distinct paths:

- **Human-facing reflection:** observes a person's message, checks it against Metta's stated principles, and generates a compassionate response.
- **Agent decision layer:** evaluates a proposed action and returns an advisory `YES`, `NO`, or `CAUTION` result for the calling application to handle.

Metta does not execute or intercept external actions. `CAUTION` means the evaluation was inconclusive or unavailable and must never be treated as approval. TypeSafe Jev can provide structured judgments when configured; if required evaluation fails, the result is uncertain and `allow` remains false.

## Core components

1. **Observer (`Sati`)** — identifies a possible emotional state and underlying need.
2. **Ethical evaluator (`Sīla`)** — checks text or proposals against the Five Precepts framework.
3. **Principle graph (`Dhamma`)** — maps selected conditions to possible reframes and next steps.
4. **Synthesizer (`Karunā`)** — writes a warm, practical response for the human-facing path.
5. **Meditation (`Bhāvanā`)** — reviews and prunes ephemeral conversation context.

The human-facing voice is Buddhist-inspired model output, not canonical scripture or a historical teacher's words. Source references should be checked against their cited texts.

## Quickstart

### Prerequisites

- Python >= 3.13
- `uv` package manager
- A configured model provider for generated responses

### Run tests

```bash
uv run pytest
```

### Run the interactive REPL

```bash
uv run metta
```

Inside the REPL:

- `/graph` — inspect the Principle Knowledge Graph
- `/precepts` — view the Five Precepts framework
- `/meditate` — review and prune ephemeral context
- `/exit` — exit
