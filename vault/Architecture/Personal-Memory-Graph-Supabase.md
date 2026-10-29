# Personal Memory Graph Architecture & Supabase Adapter

Project Metta stores the personal cognitive trajectory of authenticated users as a topological graph rather than a flat, raw chat transcript.

```
                      [ User Memory Graph ]
                     (user_id, email, turns)
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
       [ UserPatternNode ]            [ Growth Milestone ]
  - Knot Category (e.g. Overwhelm)   - "Recognized exhaustion early"
  - Occurrence Count (e.g. 3x)        - Distilled across sessions
  - Effective Dhamma Principles
```

---

## 1. Abstract Storage Contract (`BaseMemoryStore`)

To uphold the [[Unified-Interface-Adapter-Pattern|Unified Interface (Adapter Pattern)]], storage engines implement a strictly decoupled abstract interface:

```python
class BaseMemoryStore(ABC):
    @abstractmethod
    async def get_user_graph(self, user_id: str) -> UserMemoryGraph: ...

    @abstractmethod
    async def record_interaction(
        self,
        user_id: str,
        knot: str,
        need: str,
        principle_used: Optional[str] = None,
        summary: Optional[str] = None,
        email: Optional[str] = None,
    ) -> None: ...

    @abstractmethod
    async def clear_user_graph(self, user_id: str) -> bool: ...
```

---

## 2. Implementation Tiers

| Tier | Driver | Target Environment | Storage Path |
| :--- | :--- | :--- | :--- |
| **Local** | `SQLiteMemoryStore` | Local offline dev, privacy-first single node | `packages/metta-core/data/metta_memory.db` |
| **Cloud** | `SupabaseMemoryStore` | Production multi-user deployment | PostgreSQL via Supabase PostgREST |

---

## 3. Supabase Schema Migration (SQL)

To deploy to Supabase, run the following SQL script directly in the **Supabase SQL Editor**:

```sql
-- 1. User Memory Graphs Table
create table if not exists public.user_memory_graphs (
    user_id text primary key,
    email text,
    growth_milestones jsonb default '[]'::jsonb,
    total_turns integer default 0,
    created_at double precision not null default extract(epoch from now()),
    updated_at double precision not null default extract(epoch from now())
);

-- 2. User Pattern Nodes Table (Recurring knots & effective principles)
create table if not exists public.user_pattern_nodes (
    user_id text references public.user_memory_graphs(user_id) on delete cascade,
    pattern_id text not null,
    knot_category text not null,
    observed_tendency text,
    effective_principles jsonb default '[]'::jsonb,
    occurrence_count integer default 1,
    last_observed_timestamp double precision not null default extract(epoch from now()),
    primary key (user_id, pattern_id)
);

-- Row Level Security (RLS) setup
alter table public.user_memory_graphs enable row level security;
alter table public.user_pattern_nodes enable row level security;

-- Policies (Users can only read/write their own records)
create policy "Users manage own graphs" on public.user_memory_graphs
    for all using (auth.uid()::text = user_id or current_user = 'service_role');

create policy "Users manage own patterns" on public.user_pattern_nodes
    for all using (auth.uid()::text = user_id or current_user = 'service_role');
```

---

## 4. Automatic Local Fallback
When `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is not present in `.env`, `SupabaseMemoryStore` automatically delegates all operations to `SQLiteMemoryStore`. This guarantees seamless zero-configuration local runs while remaining fully prepared for cloud deployment.

---

## Related Notes
- [[Dual-Mode-Identity-Guest-Vs-Authenticated]]
- [[Unified-Interface-Adapter-Pattern]]
- [[ADR-006-Dual-Identity-And-Personal-Memory-Graph]]
