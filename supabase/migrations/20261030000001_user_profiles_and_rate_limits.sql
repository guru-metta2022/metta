-- =========================================================================
-- Project Metta: User Profiles & Configurable Rate Limits Schema
-- =========================================================================

-- 1. Rate Limit Configuration Table (Dynamic & Admin-configurable in Supabase)
create table if not exists public.rate_limit_configs (
    tier text primary key,
    max_per_minute integer not null default 15,
    max_per_hour integer not null default 60,
    description text,
    updated_at double precision not null default extract(epoch from now())
);

-- 2. User Profiles Table (Stores authenticated login users in Supabase)
create table if not exists public.user_profiles (
    user_id text primary key,
    email text unique,
    display_name text,
    avatar_url text,
    tier text not null default 'standard' references public.rate_limit_configs(tier) on delete set default,
    custom_max_per_minute integer,
    custom_max_per_hour integer,
    created_at double precision not null default extract(epoch from now()),
    last_seen_at double precision not null default extract(epoch from now())
);

-- Seed default rate limit configurations
insert into public.rate_limit_configs (tier, max_per_minute, max_per_hour, description)
values 
    ('global_default', 15, 60, 'Global default fallback rate limit'),
    ('guest', 10, 40, 'Anonymous guest tier'),
    ('standard', 25, 120, 'Authenticated registered user tier'),
    ('contributor', 60, 300, 'Supporters and active contributors')
on conflict (tier) do update set
    max_per_minute = excluded.max_per_minute,
    max_per_hour = excluded.max_per_hour,
    description = excluded.description;

-- Enable Row Level Security (RLS)
alter table public.rate_limit_configs enable row level security;
alter table public.user_profiles enable row level security;

-- Policies for rate_limit_configs
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Rate limits are readable by all' and tablename = 'rate_limit_configs') then
        create policy "Rate limits are readable by all" on public.rate_limit_configs
            for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Rate limits managed by service role' and tablename = 'rate_limit_configs') then
        create policy "Rate limits managed by service role" on public.rate_limit_configs
            for all using (current_user = 'service_role' or auth.role() = 'service_role');
    end if;

    if not exists (select 1 from pg_policies where policyname = 'User profiles readable by self or service role' and tablename = 'user_profiles') then
        create policy "User profiles readable by self or service role" on public.user_profiles
            for select using (auth.uid()::text = user_id or current_user = 'service_role' or auth.role() = 'service_role');
    end if;
    if not exists (select 1 from pg_policies where policyname = 'User profiles managed by self or service role' and tablename = 'user_profiles') then
        create policy "User profiles managed by self or service role" on public.user_profiles
            for all using (auth.uid()::text = user_id or current_user = 'service_role' or auth.role() = 'service_role');
    end if;
end
$$;
