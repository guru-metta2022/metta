-- =========================================================================
-- Project Metta: Personal Memory Graph Schema for Supabase / PostgreSQL
-- =========================================================================

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

-- Policies (Users can only read/write their own records, service_role has administrative access)
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users manage own graphs' and tablename = 'user_memory_graphs') then
        create policy "Users manage own graphs" on public.user_memory_graphs
            for all using (auth.uid()::text = user_id or current_user = 'service_role');
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users manage own patterns' and tablename = 'user_pattern_nodes') then
        create policy "Users manage own patterns" on public.user_pattern_nodes
            for all using (auth.uid()::text = user_id or current_user = 'service_role');
    end if;
end
$$;
