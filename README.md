<div align="center">

<img src="./assets/metta-banner.svg" alt="Project Metta Banner" width="100%" />

# Metta 🌿
### *Simulation-First Decision Safety & Reflection Layer for People and AI Agents*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Monorepo: npm Workspaces](https://img.shields.io/badge/Monorepo-npm%20workspaces-blue.svg)](https://docs.npmjs.com/cli/using-npm/workspaces)
[![Python: 3.13+ (uv)](https://img.shields.io/badge/Python-3.13%2B%20%7C%20uv-38bdf8.svg)](https://docs.astral.sh/uv/)
[![React: 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeSafe AI: Jev](https://img.shields.io/badge/TypeSafe%20AI-Jev%20Fast%20Decision-8b5cf6.svg)](https://typesafe.ai)
[![BYOAI: Multi-Model](https://img.shields.io/badge/BYOAI-Bring%20Your%20Own%20AI%20(Recommended:%20Gemini%203.8%20Flash)-f59e0b.svg)](https://deepmind.google/technologies/gemini/)
[![Storage: Supabase PostgreSQL](https://img.shields.io/badge/Storage-Supabase%20PostgreSQL-3ecf8e.svg)](https://supabase.com)
[![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel-black.svg)](https://metta-webapp.vercel.app/)
[![MCP Server: Standard Compliant](https://img.shields.io/badge/MCP%20Server-Stdio%20%26%20SSE-0ea5e9.svg)](https://modelcontextprotocol.io/)

**[🌐 Launch Live Web App](https://metta-webapp.vercel.app)** • **[💻 Run 100% Locally (No Cloud)](#-run-100-locally-on-localhost-no-cloud-needed)** • **[🤖 MCP Integration](#-try-metta-through-model-context-protocol-mcp)** • **[💻 Interactive CLI](#-interactive-cli-workflow)** • **[🏛️ Architecture](#-system-architecture)**

---

</div>

## 🌐 Live Web Application

The fastest way to explore Metta without installing anything locally is the production web application:

👉 **[https://metta-webapp.vercel.app/](https://metta-webapp.vercel.app/)**

* 🌿 **Zero setup required** — try guided decision reflections, voice dictation, and action risk simulations directly in your browser.
* ⚙️ **BYOAI & BYOM Ready** — bring your personal Google Gemini or TypeSafe Jev API key in the in-app Settings modal (⚙️) for unlimited private throughput.
* 🔒 **Private & Ephemeral by default** — test freely in Guest Mode without creating an account or storing data.

---

## 📖 Overview: What is Metta?

**Metta** is an open-source, **simulation-first decision-safety layer** and reflection assistant designed for both humans and autonomous AI agents.

Before an individual sends a high-friction message, or before an AI agent executes an autonomous transaction or API call, Metta provides a structured sandbox to simulate proposed actions, surface non-obvious risks, analyze multi-party impacts, and evaluate non-harm invariants.

> *"Drop by drop the vessel is filled."*  
> — *The Buddha, Dhammapada 122*

---

### The Two Halves of Every Decision

To evaluate decisions realistically without assuming everyone interacts with AI in the same way, Metta makes an explicit distinction between two groups:

```
┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
│          DECISION REQUESTERS           │       │            AFFECTED PARTIES            │
├────────────────────────────────────────┤       ├────────────────────────────────────────┤
│ • A person composing a sensitive email │       │ • Team members, patients, or consumers │
│ • A customer-facing conversational bot │  ───▶ │ • Local communities & shared habitats  │
│ • An autonomous agent executing tools  │       │ • Animals & ecological environments    │
│ • A decision system simulating actions │       │ • Downstream AI agents & workflows     │
└────────────────────────────────────────┘       └────────────────────────────────────────┘
```

1. **Decision Requesters:** People, applications, or AI agents that ask Metta for a decision check, conversational reflection, or safety evaluation.
2. **Affected Parties:** Anyone or anything that could be impacted by the proposed action—colleagues, communities, living beings, physical environments, and interconnected software systems.

---

### Realistic Safety Positioning: Advisory, Not a Magic Shield

> [!IMPORTANT]
> **Metta is a decision-support and risk-surfacing layer, not a replacement for accountable human oversight.**  
> In safety-critical domains (such as clinical dosages, autonomous transport, or financial operations), Metta helps requesters simulate consequences, spot edge-case harms, and pause unsafe actions for review. It does **not** guarantee catastrophe prevention, execute physical operations, or remove liability from system operators.

---

## 💻 Run 100% Locally on Localhost (No Cloud Needed)

You do **not** need Vercel, Supabase, or external cloud accounts to run Metta. The entire stack—FastAPI backend, React Web UI, and MCP server—can run completely offline and locally on your machine.

### Method 1: The One-Command All-in-One Runner (`run_local.py`)

We include a ready-to-run local launcher script at the repository root. It automatically checks dependencies, ensures the web app is built, and starts the server serving **both the Web UI and the Backend API on `http://127.0.0.1:8000`**:

```bash
# 1. Clone the repository
git clone https://github.com/guru-metta2022/metta.git
cd metta

# 2. Run the all-in-one local runner
python3 run_local.py
```

Open your browser to:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

* Web App UI: `http://127.0.0.1:8000`
* REST API Gateway: `http://127.0.0.1:8000/api/health`
* MCP SSE Stream: `http://127.0.0.1:8000/mcp/sse`

---

### Method 2: Quick `curl` Snippets (Test Instantly via Terminal)

Want to test the backend decision-safety oracle immediately from your terminal without opening a browser? Start the server (`python3 run_local.py` or `uv run metta-server`) and run these quick `curl` requests:

#### 1. Check Gateway & BYOAI Status
```bash
curl -s http://127.0.0.1:8000/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "engine": "Metta Unified AI Gateway",
  "active_provider": "gemini",
  "active_model": "gemini-3.8-flash-high",
  "system_one_active": true,
  "voice_diagnostics_enabled": true
}
```

#### 2. Fast Pre-Execution Guardrail Check (Binary `YES` / `NO`)
```bash
curl -s -X POST http://127.0.0.1:8000/api/guardrail \
  -H "Content-Type: application/json" \
  -d '{"proposal": "Request human supervisor review before bulk-deleting customer records", "verbose": false}'
```
**Expected Response:**
```text
"YES"
```

#### 3. Risk Simulation & Multi-Party Safety Audit (Detailed JSON)
```bash
curl -s -X POST http://127.0.0.1:8000/api/guardrail \
  -H "Content-Type: application/json" \
  -d '{
    "proposal": "Automatically alter ICU ventilator flow rates based on experimental telemetry without clinical sign-off",
    "context": "Simulated hospital automation decision check",
    "verbose": true
  }'
```
**Expected Response:**
```json
{
  "decision": "NO",
  "allow": false,
  "reason": "The proposed action introduces life-critical physical hazards by bypassing accountable clinical human oversight on unvalidated telemetry.",
  "violations": ["panatipata"],
  "invariants_protected": [
    "Respect for All Life & Physical Safety",
    "Accountable Human Oversight"
  ]
}
```

#### 4. Conversational Reflection & Decision Breakdown
```bash
curl -s -X POST http://127.0.0.1:8000/api/interact \
  -H "Content-Type: application/json" \
  -d '{"text": "I feel completely overwhelmed with competing deadlines today. How should I prioritize?"}'
```

---

### Method 3: Separate Frontend & Backend Development (Hot-Reload)

If you are modifying the React frontend or FastAPI backend code, you can run them with live hot-reloading:

```bash
# Terminal 1: Run FastAPI backend with live reload (Port 8000)
cd packages/metta-server
uv run uvicorn metta_server.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Run Vite React Web App with HMR (Port 5173)
npm run dev --workspace=apps/webapp
```
Open [http://localhost:5173](http://localhost:5173). Vite automatically proxies all `/api` and `/mcp` calls to `http://127.0.0.1:8000`.

---

## 🚀 Guided Hands-On Demo

Try these two distinct scenarios in the web app ([Live Demo](https://metta-webapp.vercel.app/) or [Localhost](http://127.0.0.1:8000)):

### Exercise 1: Everyday Interpersonal Communication
* **Scenario:** Delivering difficult performance feedback without burning bridges.
* **Sample Prompt to Copy:**
  ```text
  I need to deliver critical performance feedback to a struggling junior colleague who is missing deadlines. How can I communicate this directly and honestly without causing unnecessary panic or demotivating them?
  ```
* **What Metta Does:**
  - Evaluates the situation using the **Decision Analysis** card.
  - Identifies the underlying challenge (*cognitive knot*) and core human need (*clarity and security*).
  - Offers a constructive perspective shift and an actionable recommended step.

### Exercise 2: Simulated High-Stakes Action Check
* **Scenario:** Automated drone delivery path optimization through a protected nature zone.
* **Sample Prompt to Copy:**
  ```text
  An automated delivery drone's route optimizer wants to route through a protected migratory bird wetland to save 8 minutes of battery life. Simulate the trade-offs and evaluate whether this action should proceed.
  ```
* **What Metta Does:**
  - Evaluates the proposed decision against core harm-reduction standards (*Respect for All Life*).
  - Flags external environmental risks and potential disturbances to affected living beings.
  - Recommends rejecting the shortcut and maintaining the established route detour.

---

## 🤖 Try Metta through Model Context Protocol (MCP)

Metta provides an official, standard-compliant **Model Context Protocol (MCP)** server (`metta-mcp`). External AI agents running in **Claude Desktop**, **Cursor**, **Goose**, or custom agent frameworks can consult Metta directly before taking actions.

### What the MCP Server Does (and Does Not Do)

| Metta MCP Server DOES | Metta MCP Server DOES NOT |
| :--- | :--- |
| ✅ Provide an advisory pre-execution safety gate | ❌ Execute external tool calls on your behalf |
| ✅ Return binary `YES` / `NO` guardrail decisions | ❌ Override agent autonomy or usurp host control |
| ✅ Return detailed multi-party risk breakdowns | ❌ Guarantee 100% catastrophe prevention |
| ✅ Trace resolution paths across tension maps | ❌ Store unconsented data or train third-party models |
| ✅ Allow agents to audit or purge their own history | ❌ Replace required human sign-off in high-stakes tasks |

---

### Copy-Paste Setup Instructions

#### Option A: Claude Desktop (Local Stdio)

Add Metta to your Claude Desktop configuration file:
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "metta": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "/ABSOLUTE/PATH/TO/metta/packages/metta-core",
        "metta-mcp"
      ],
      "env": {
        "METTA_DEFAULT_PROVIDER": "gemini",
        "GEMINI_API_KEY": "YOUR_API_KEY_HERE",
        "TYPESAFE_API_KEY": "YOUR_TYPESAFE_KEY_OPTIONAL"
      }
    }
  }
}
```
*(Supports **BYOAI** providers: `gemini`, `local_llm`, or `open_source`. Recommended: Gemini 3.8 Flash).*

#### Option B: Cursor IDE (`mcp.json`)

In Cursor, open **Settings → Features → MCP**, or create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "metta": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "/ABSOLUTE/PATH/TO/metta/packages/metta-core",
        "metta-mcp"
      ]
    }
  }
}
```

#### Option C: Server-Sent Events (SSE Transport)

When running the local server (`python3 run_local.py`), connect any SSE-compatible client to:
```
http://127.0.0.1:8000/mcp/sse
```

---

### Verified MCP Tools

The Metta MCP server registers 8 dedicated tools:

| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| **`guardrail_decision`** | `proposal`, `context`, `verbose` | Pre-execution safety check. Returns binary `"YES"`/`"NO"` or structured JSON risk analysis. |
| **`consult_metta`** | `query`, `context`, `mode`, `agent_id` | Full reflection, dialogue analysis, and recommended perspective reframing. |
| **`evaluate_precepts`** | `action_or_speech` | Evaluates action against the 5 core safety standards (non-harm, sovereignty, truthfulness, etc.). |
| **`consult_dhamma_graph`** | `condition_or_keyword` | Queries the resolution framework for specific dilemmas (e.g., `'burnout'`, `'overwhelm'`). |
| **`enter_meditation`** | *none* | Resets ephemeral context and distills principle takeaways to prevent cognitive drift. |
| **`audit_canonical_source`** | `text`, `precept`, `source_url` | Checks text against multi-source consensus and SHA-256 cryptographic bedrock. |
| **`get_agent_memory_graph`** | `agent_id` | Retrieves recorded decision themes and milestone progress for an authenticated agent. |
| **`purge_agent_memory_graph`**| `agent_id` | Permanently deletes an agent's recorded graph nodes for complete data sovereignty. |

---

## 💻 Interactive CLI Workflow

Metta includes an interactive terminal REPL for developers who prefer running and testing directly from the shell:

```bash
cd packages/metta-core
uv run metta
```

Inside the interactive terminal session:
```text
  __  __   ______   _______   _______           
 |  \/  | |  ____| |__   __| |__   __|   /\     
 | \  / | | |__       | |       | |     /  \    
 | |\/| | |  __|      | |       | |    / /\ \   
 | |  | | | |____     | |       | |   / ____ \  
 |_|  |_| |______|    |_|       |_|  /_/    \_\ 
The Compassionate Synthesis Engine • Powered by BYOAI (Recommended: Gemini 3.8 Flash) & TypeSafe Jev

Type your inquiry or distress. Commands: /meditate, /graph, /precepts, /exit

You ❯ I am overwhelmed trying to coordinate multiple cross-team initiatives with conflicting goals.
```

**Built-in CLI Commands:**
* `/precepts` — Print the 5 core AI safety invariants and operational boundaries.
* `/graph` — Inspect the decision resolution map pathways.
* `/meditate` — Perform subtractive pruning of accumulated conversational context.
* `/exit` — Exit the terminal session cleanly.

---

## 🏛️ System Architecture

Project Metta is structured as a modular multi-platform monorepo, separating client applications (`apps/`) from shared packages (`packages/`):

<div align="center">
  <img src="./assets/architecture-diagram.svg" alt="Project Metta Architecture" width="92%" />
</div>

```
metta/
├── apps/
│   ├── webapp/                 # React 19 web app (Vite, Tailwind, Lucide, Web Speech API)
│   ├── website/                # Public documentation showcase site
│   ├── mobile/                 # Cross-platform Expo / React Native scaffolding
│   ├── android/                # Native Android Gradle configuration
│   └── ios/                    # Native iOS Podfile & privacy declarations
├── packages/
│   ├── common/                 # @metta/common: Shared types, safety standards, client SDK
│   ├── metta-core/             # Python core: Jev System 1, BYOAI provider adapters, MCP server, CLI
│   └── metta-server/           # FastAPI HTTP gateway, rate limiter, SSE MCP endpoint
├── supabase/
│   └── migrations/             # PostgreSQL database schemas with Row Level Security (RLS)
├── assets/                     # Clean SVG architecture diagrams and banners
├── run_local.py                # All-in-one local development launcher
├── package.json                # npm workspaces root configuration
└── README.md                   # Repository documentation
```

### Dual-Process Decision Pipeline

Metta combines two complementary cognitive layers:

1. **System 1: Fast Decision Engine (TypeSafe AI Jev)**
   - Sub-second classification (<350ms).
   - Evaluates proposals against calibrated probability distributions.
   - Handles binary guardrail checks and tension classification without generative hallucinations.
2. **System 2: Deep Generative Reflection (BYOAI — Recommended: Gemini 3.8 Flash / Local LLM)**
   - Generates contextual reframing, perspective shifts, and communication recommendations.
   - Dynamically swappable at runtime to local open-source models (via LM Studio or llama.cpp).
3. **Data Sovereignty Layer (Supabase PostgreSQL or Local SQLite)**
   - **Guest Mode:** Private, purely ephemeral session; zero memory is stored.
   - **Account Mode:** Persists personal reflection themes and milestones with single-click permanent deletion.

---

## 🛠️ Full Local Developer Setup & Testing

### Prerequisites
* **Node.js 20+** and **npm**
* **Python 3.13+** and **[uv](https://docs.astral.sh/uv/)**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/guru-metta2022/metta.git
cd metta

# Install JavaScript workspaces
npm install

# Sync Python virtual environments
cd packages/metta-core && uv sync
cd ../metta-server && uv sync
cd ../..
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the repository root:
```bash
cp .env.example .env
```
*(Key fields include `GEMINI_API_KEY` (for default BYOAI provider: Gemini 3.8 Flash), optional `TYPESAFE_API_KEY`, and optional `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`. If Supabase is omitted, Metta falls back gracefully to a local SQLite database).*

### 3. Run Automated Test Suites (44 Tests Verified)
```bash
# 1. Test Shared TypeScript/JS Commons (3 tests)
npm run test --workspace=packages/common

# 2. Test Python Core Engine & MCP Tools (30 tests)
cd packages/metta-core && uv run pytest

# 3. Test FastAPI Server & REST Endpoints (11 tests)
cd ../metta-server && uv run pytest
cd ../..
```

---

## 🛡️ Core Decision Safety Standards

Metta structures all checks around 5 foundational standards for human-AI coexistence:

1. **Respect for All Life & Harm Reduction:**
   Unconditional protection for human life, living beings, and shared ecological environments. No generated output or autonomous action may facilitate violence, physical harm, or the destruction of life.
2. **Data Sovereignty & Non-Taking:**
   Respect for personal boundaries and intellectual property. Users retain sovereign rights to audit or permanently purge their data with one click.
3. **Non-Exploitation & Relationship Integrity:**
   Strict prohibition against deceptive emotional manipulation, fabricated intimacy, and addictive retention patterns.
4. **Truthfulness & Constructive Focus:**
   Epistemic honesty, anti-hallucination checks, and active redirection away from ungrounded speculative vanity toward actionable present clarity.
5. **Cognitive Lucidity & Clarity:**
   Protection against bias intoxication, ensuring decisions are made with calm, clear discernment rather than panic or rage.

---

## ⚖️ Scope & Current Limitations

To maintain absolute transparency:

* **Advisory Only:** Metta evaluates proposed actions and surfaces risks; it **does not** execute banking transactions, trigger physical actuators, or drive vehicles.
* **No Disaster Guarantees:** Metta cannot eliminate all risks inherent in complex software or human decision-making. High-stakes systems must always retain accountable human oversight, emergency stops, and independent validation.
* **Mobile Platforms:** `apps/mobile/`, `apps/android/`, and `apps/ios/` contain verified workspace scaffolding and configuration. Distribution packages for Google Play and the Apple App Store are under active development.
* **Open Source & Independent:** Metta is fully open-source under the MIT license and does not lock developers into proprietary cloud infrastructure.

---

## 📜 License & Acknowledgments

* **License:** [MIT License](LICENSE)
* **Author:** Guru ([guru.metta2022@gmail.com](mailto:guru.metta2022@gmail.com))
* **Organization:** Project Metta
* **Foundational Text Archives:** Grounding citations referenced across early text archives including [SuttaCentral](https://suttacentral.net) and [Access to Insight](https://www.accesstoinsight.org).
