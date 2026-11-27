-- =========================================================================
-- Project Metta: Durable External Agent & MCP Contact Log Schema
-- =========================================================================

create table if not exists public.agent_contacts (
    id text primary key,
    timestamp double precision not null default extract(epoch from now()),
    created_at timestamptz not null default now(),
    channel text not null,
    method text,
    path text,
    tool_or_action text,
    agent_id text,
    user_agent text,
    client_country text,
    client_region text,
    client_ip_hash text,
    verdict text,
    payload_preview text,
    metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_agent_contacts_created_at
    on public.agent_contacts (created_at desc);

create index if not exists idx_agent_contacts_channel
    on public.agent_contacts (channel, created_at desc);

alter table public.agent_contacts enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where policyname = 'Agent contacts accessible to service role only'
          and tablename = 'agent_contacts'
    ) then
        create policy "Agent contacts accessible to service role only"
            on public.agent_contacts
            for all
            using (current_user = 'service_role' or auth.role() = 'service_role');
    end if;
end
$$;
