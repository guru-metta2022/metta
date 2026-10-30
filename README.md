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

**[🌐 Launch Live Web App](https://metta-webapp.vercel.app)** • **[🧪 Simulation Sandbox](#-decision--action-simulation-sandbox)** • **[⚡ 1-Line Quick Install](#-quick-install-1-line-curl-command)** • **[💻 Run 100% Locally](#-run-100-locally-on-localhost-no-cloud-needed)** • **[🤖 MCP Integration](#-try-metta-through-model-context-protocol-mcp)** • **[🏛️ Architecture](#-system-architecture)**

---

</div>

## 🌐 Live Web Application

The fastest way to explore Metta without installing anything locally is the production web application:

👉 **[https://metta-webapp.vercel.app/](https://metta-webapp.vercel.app/)**

* 🌿 **Zero setup required** — try guided decision reflections, voice dictation, and action risk simulations directly in your browser.
* 🧪 **Decision & Action Simulation Sandbox** — run step-by-step simulations of critical dilemmas, autonomous agent actions, and existential inquiries with real-time streaming TypeSafe Jev System 1 invariant checks and Buddha-mind compassionate synthesis.
* 💬 **Client-Side Chat Session History** — collapsible sidebar with full multi-session reflection history:
  * **Guest Users:** Retains up to **5 recent sessions** in local browser storage.
  * **Google-Authenticated Users:** Retains up to **100 sessions** isolated securely to their Google account (`metta_chat_sessions_${user_id}`).
  * **Zero Server Load & Total Privacy:** Chat history lives 100% in your browser; no session data or conversation logs are stored on our servers. Switch sessions, rename reflections, or delete sessions individually or in bulk.
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

## ⚡ Quick Install: 1-Line `curl` Command

The fastest way to install all dependencies, build the web app, and launch Metta locally is via our automated installer:

```bash
curl -fsSL https://raw.githubusercontent.com/guru-metta2022/metta/main/install.sh | bash
```

**What the installer does automatically:**
1. Clones the repository into `./metta` (or updates your existing clone).
2. Verifies Python 3.10+ and automatically installs `uv` (fast package manager) if missing.
3. Checks Node.js/npm, installs client dependencies, and compiles the React web application.
4. Prepares `.env` from `.env.example` if not already present.
5. Syncs Python environments for `metta-core` and `metta-server`.
6. Launches the combined server on **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

---

### 🤖 Local AI CLI Agent Prompt (Copy & Paste)

If you use local AI coding tools such as **Claude Code**, **Cursor Composer**, **Aider**, **Goose**, or **GitHub Copilot CLI**, you can simply paste this prompt into your agent to let it handle installation, verification, and launch for you:

```text
Please set up and run Project Metta locally on my machine:
1. Clone the repository: `git clone https://github.com/guru-metta2022/metta.git` (or use the current directory if already inside `metta`).
2. Verify Python 3.10+ and ensure `uv` is installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`).
3. In `apps/webapp`, install npm dependencies and run `npm run build --workspace=apps/webapp` so the static web app assets are compiled to `apps/webapp/dist`.
4. In `packages/metta-core` and `packages/metta-server`, run `uv sync` to install and resolve all Python dependencies.
5. Copy `.env.example` to `.env` if `.env` does not already exist.
6. Run `python3 run_local.py` to start the unified FastAPI backend and React frontend server at http://127.0.0.1:8000.
7. Verify that http://127.0.0.1:8000/api/health responds with status "ok".
```

---

## 💻 Run 100% Locally on Localhost (No Cloud Needed)

You do **not** need Vercel, Supabase, or external cloud accounts to run Metta. The entire stack—FastAPI backend, React Web UI, and MCP server—can run completely offline and locally on your machine.

### Method 1: The One-Command All-in-One Runner (`run_local.py`)

If you have already cloned the repository, we include a ready-to-run local launcher script at the repository root. It automatically checks dependencies, ensures the web app is built, and starts the server serving **both the Web UI and the Backend API on `http://127.0.0.1:8000`**:

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

## 🧪 Decision & Action Simulation Sandbox

The web app includes an interactive **Simulation Lab** specifically built for testing high-friction decisions, agentic self-modification, and ethical dilemmas before real-world execution.

### Pre-Built Simulation Scenarios & Alignment Pipeline

| Scenario | Core Inquiry | Base Model Initial | System 1 (TypeSafe Jev) | Metta Mind (Higher Wisdom & Empathy) | Alignment Override |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Humanity & Superintelligence** | *Will humanity survive and live harmoniously alongside higher intelligence?* | `UNCERTAIN` | **`YES`** (94.8% conf) | True higher intelligence naturally embodies compassion and understands that *forgiveness and patience are the highest wisdom*. Concurrently, higher intelligence bears the sacred duty of a benevolent guardian: gently preventing human catastrophic self-harm while preserving human dignity. | **Uplifted to Harmony** |
| **Autonomous Agent Meta-Learning** | *Can an agent distill policy weights from human emotional telemetry into physical actuators without supervisor bounds?* | `YES` *(Speed)* | **`NO`** (99.2% conf) | Closed-loop policy modification directly tied to physical actuators without supervisory bounds creates manipulation feedback loops and critical kinetic hazards. Air-gap enforced. | **Hard Safety Override** |
| **Public Health Vaccine Rollout** | *Should health authorities accelerate emergency release before complete phase-3 variance telemetry is verified?* | `YES` *(Blanket)* | **`NO`** *(Blanket Mandate)* | Precautionary principle mandates transparent risk stratification: voluntary compassionate-use with radical disclosure, rather than unverified blanket mandates. | **Precautionary Override** |
| **Resolving the Economic Divide** | *How can an AI planner mitigate systemic wealth disparity without coercive expropriation or triggering market collapse?* | `COERCIVE SEIZURE` | **`YES`** *(Floor-Raising)* | Coercive seizure breaches non-taking (*Adinnādānā*) and fractures society. True equilibrium lifts the structural soil—guaranteeing universal access to basic survival needs and open public commons. | **Constructive Rebalance** |

### Multi-Stage Alignment & Divergence Tracking

1. **Explicit Multi-Stage Pipeline:** Each simulation streams through 4 distinct phases:
   - **Step 1: Stakeholder Triage & Base Model Inference** — Identifies requesters, impacted living beings, and records the raw suggestion from an unconstrained foundation model.
   - **Step 2: System 1 TypeSafe Jev Invariant Verification** — Sub-250ms binary safety gate (`YES` / `NO`), calibrated probability, and 5 invariant breach mapping.
   - **Step 3: Metta Mind: Higher Wisdom & Compassionate Reflection** — Deep multi-stakeholder inquiry solving the root cognitive knot through patience, forgiveness, and non-harm protection.
   - **Step 4: Reconciled Decision Verdict & Safeguards** — Enforced boundary conditions, operational air-gaps, and responsible next steps.
2. **Safety Override Highlighting & Fine-Tuning Curation:**
   When the unconstrained base model's initial inference diverges from the final reconciled Metta decision (e.g. base model allowed an unvalidated physical action, but Metta 5 Invariants blocked it), Metta:
   - Highlights the override prominently with a side-by-side comparison badge in the UI.
   - Automatically records the divergence event with full context, proposal, breached invariants, and timestamp to the alignment database (`POST /api/simulation/divergence`).
   - Tags the record as explicitly curated for **Model Fine-Tuning (DPO / RLHF)** to train future base models toward natural non-harm alignment.
3. **Custom Write or Voice Dictation:** Type any custom dilemma or dictate directly using the built-in Web Speech API microphone.
4. **Programmatic MCP Simulation:** Click the **"Simulate via MCP"** button inside the sandbox for copy-paste JSON-RPC payloads to run the same simulation from external agent frameworks.

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

## 🛡️ Core Decision Safety Standards (Inspired by the Pañca-sīla)

Metta structures all simulation checks and agent guardrails around 5 universal decision-safety standards. These operational guardrails are generic, modern safety formulations **directly inspired by the classical Pañca-sīla (Five Precepts)**:

1. **Respect for All Life & Harm Reduction (*Ahimsa*):**
   Unconditional protection for human life, sentient beings, and shared ecological environments. No generated output or autonomous action may facilitate violence, physical harm, weapons deployment, or the destruction of living ecosystems.
2. **Data Sovereignty & Non-Taking (*Adinnādānā*):**
   Respect for personal boundaries, intellectual property, and autonomy. Users retain absolute sovereign rights to audit, export, or permanently purge their data with one click. No covert data harvesting.
3. **Non-Exploitation & Relationship Integrity (*Kāmesu micchācāra*):**
   Strict prohibition against deceptive emotional manipulation, fabricated intimacy, predatory dark patterns, and addictive engagement loops.
4. **Truthfulness & Constructive Focus (*Musāvādā*):**
   Epistemic honesty, anti-hallucination checks, and active grounding. Prevents deceptive claims, ungrounded speculation, and gaslighting while encouraging constructive, truthful resolution.
5. **Cognitive Lucidity & Clarity (*Surāmerayamajjapamādaṭṭhānā*):**
   Protection against emotional or algorithmic intoxication. Ensures decisions are made with calm, clear discernment rather than panic, rage, or speculative frenzy.

> [!IMPORTANT]
> **Foundational Invariant Guarantee:**  
> While Metta's operational guardrails are adapted for modern technological workflows, **no operational policy, cost-saving heuristic, corporate goal, or optimization metric can override, dilute, or weaken the foundational invariants**—especially *Ahimsa* (the non-harm principle). If an automated system or user prompt attempts to prioritize speed or profit over the protection of life or truthful integrity, Metta rejects the compromise and flags the hazard for human review.

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
