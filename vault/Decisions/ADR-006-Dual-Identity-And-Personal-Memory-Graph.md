# ADR-006: Dual-Mode Identity & Personal Memory Graph Storage

## Status
Accepted

## Context
The user requested dual operational modes:
1. **Guest Mode:** Treats the user as a new person asking for help or guidance (ephemeral, zero memory retained).
2. **Logged-in Mode (Gmail/Google):** Maintains a persistent personal memory graph that maps the user's recurring cognitive knots, emotional friction points, and past effective Dhamma reframings.
3. **Strict Inviolability:** This personal graph must be queried *only* when the user asks a question, synthesizing personalized wisdom without violating the Second Precept (Asteya/User Data Sovereignty) or cluttering the general Dhamma graph.

## Decision
1. Implemented abstract `BaseMemoryStore` with methods `get_user_graph`, `record_interaction`, and `clear_user_graph`.
2. Created dual storage backends:
   - `SQLiteMemoryStore`: Sovereign local database (`metta_memory.db`) for immediate offline execution.
   - `SupabaseMemoryStore`: Multi-tenant PostgreSQL adapter with full SQL schema and RLS policies.
3. Integrated into `AIAgent.ask(..., mode="guest"|"authenticated")`:
   - Guest mode bypasses memory retrieval and storage completely.
   - Authenticated mode retrieves the user's graph on demand, passes it into `karuna.Synthesizer` for continuity synthesis, and records newly observed knots.
4. Embedded sovereign purge (`DELETE /api/user/graph`) allowing users to permanently erase their graph and return to Beginner's Mind (*Anatta*).
5. Built interactive frontend UI:
   - Identity Mode Pill in Header (`👤 Guest Mode` vs `🌿 Authenticated Seeker`).
   - `AuthModal` for one-click switching and Google OAuth simulation.
   - `UserGraphModal` displaying pattern cards, recurrence counts, effective Dhamma principles, and one-click sovereign purge.

## Consequences
- **Positive:** Full data sovereignty; clean separation of concerns; zero-configuration local runs with cloud-ready Supabase migration.
- **Philosophical alignment:** Deeply honors *Shoshin* (Beginner's Mind) and *Anatta* (Non-attachment to mental records).
