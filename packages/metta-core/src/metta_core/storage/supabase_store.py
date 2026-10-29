"""Supabase / PostgreSQL Cloud Adapter for Personal User Memory Graphs.

Provides:
1. Canonical SQL Schema definition for Supabase.
2. REST API client using PostgREST / httpx for cloud graph synchronization.
3. Graceful fallback when credentials are not configured.
"""

import json
import logging
import os
import time
from typing import Optional, List, Dict, Any
import httpx

from metta_core.storage.interfaces import (
    BaseMemoryStore,
    UserMemoryGraph,
    UserPatternNode,
)
from metta_core.storage.sqlite_store import SQLiteMemoryStore

logger = logging.getLogger("metta.storage.supabase")

SUPABASE_SCHEMA_SQL = """
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

-- Policies (Users can only read/write their own records)
create policy "Users manage own graphs" on public.user_memory_graphs
    for all using (auth.uid()::text = user_id or current_user = 'service_role');

create policy "Users manage own patterns" on public.user_pattern_nodes
    for all using (auth.uid()::text = user_id or current_user = 'service_role');
"""


class SupabaseMemoryStore(BaseMemoryStore):
    """Supabase REST-based memory store with automatic fallback to SQLite when unconfigured."""

    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
        fallback_sqlite: Optional[SQLiteMemoryStore] = None,
    ):
        self.url = (supabase_url or os.getenv("SUPABASE_URL", "")).rstrip("/")
        self.key = supabase_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
        self.fallback = fallback_sqlite or SQLiteMemoryStore()

        self.is_configured = bool(self.url and self.key)
        if not self.is_configured:
            logger.info("Supabase credentials not fully provided. Falling back to local SQLiteMemoryStore.")

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    async def get_user_graph(self, user_id: str) -> UserMemoryGraph:
        """Fetch user graph from Supabase or fallback."""
        if not self.is_configured:
            return await self.fallback.get_user_graph(user_id)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Fetch graph header
                resp = await client.get(
                    f"{self.url}/rest/v1/user_memory_graphs?user_id=eq.{user_id}",
                    headers=self.headers,
                )
                if resp.status_code != 200:
                    logger.warning("Supabase GET error: %s", resp.text)
                    return await self.fallback.get_user_graph(user_id)

                rows = resp.json()
                if not rows:
                    now = time.time()
                    return UserMemoryGraph(
                        user_id=user_id,
                        email=None,
                        patterns=[],
                        growth_milestones=[],
                        total_turns=0,
                        created_at=now,
                        updated_at=now,
                    )

                graph_data = rows[0]

                # Fetch pattern nodes
                p_resp = await client.get(
                    f"{self.url}/rest/v1/user_pattern_nodes?user_id=eq.{user_id}&order=occurrence_count.desc",
                    headers=self.headers,
                )
                patterns: List[UserPatternNode] = []
                if p_resp.status_code == 200:
                    for p in p_resp.json():
                        patterns.append(
                            UserPatternNode(
                                pattern_id=p["pattern_id"],
                                knot_category=p["knot_category"],
                                observed_tendency=p.get("observed_tendency", ""),
                                effective_principles=p.get("effective_principles", []),
                                occurrence_count=p.get("occurrence_count", 1),
                                last_observed_timestamp=p.get("last_observed_timestamp", time.time()),
                            )
                        )

                return UserMemoryGraph(
                    user_id=graph_data["user_id"],
                    email=graph_data.get("email"),
                    patterns=patterns,
                    growth_milestones=graph_data.get("growth_milestones", []),
                    total_turns=graph_data.get("total_turns", 0),
                    created_at=graph_data.get("created_at", time.time()),
                    updated_at=graph_data.get("updated_at", time.time()),
                )
        except Exception as e:
            logger.error("Failed to query Supabase: %s. Using local fallback.", e)
            return await self.fallback.get_user_graph(user_id)

    async def record_interaction(
        self,
        user_id: str,
        knot: str,
        need: str,
        principle_used: Optional[str] = None,
        summary: Optional[str] = None,
        email: Optional[str] = None,
    ) -> None:
        """Record interaction into Supabase and local fallback."""
        # Always update local sqlite store for safety
        await self.fallback.record_interaction(
            user_id=user_id,
            knot=knot,
            need=need,
            principle_used=principle_used,
            summary=summary,
            email=email,
        )

        if not self.is_configured:
            return

        try:
            curr_graph = await self.get_user_graph(user_id)
            now = time.time()
            clean_knot = knot.strip().lower()
            pattern_id = f"pattern:{clean_knot.replace(' ', '_')}"

            # 1. Update/Upsert Graph
            async with httpx.AsyncClient(timeout=10.0) as client:
                graph_payload = {
                    "user_id": user_id,
                    "email": email or curr_graph.email,
                    "total_turns": curr_graph.total_turns + 1,
                    "updated_at": now,
                }
                await client.post(
                    f"{self.url}/rest/v1/user_memory_graphs",
                    headers={**self.headers, "Prefer": "resolution=merge-duplicates"},
                    json=graph_payload,
                )

                # 2. Update/Upsert Pattern
                existing_p = next((p for p in curr_graph.patterns if p.pattern_id == pattern_id), None)
                if existing_p:
                    count = existing_p.occurrence_count + 1
                    principles = list(existing_p.effective_principles)
                    if principle_used and principle_used not in principles:
                        principles.append(principle_used)
                    tendency = summary or existing_p.observed_tendency
                else:
                    count = 1
                    principles = [principle_used] if principle_used else []
                    tendency = summary or f"Recurring friction around {clean_knot}; core need is {need}."

                pattern_payload = {
                    "user_id": user_id,
                    "pattern_id": pattern_id,
                    "knot_category": clean_knot,
                    "observed_tendency": tendency,
                    "effective_principles": principles,
                    "occurrence_count": count,
                    "last_observed_timestamp": now,
                }
                await client.post(
                    f"{self.url}/rest/v1/user_pattern_nodes",
                    headers={**self.headers, "Prefer": "resolution=merge-duplicates"},
                    json=pattern_payload,
                )

        except Exception as e:
            logger.error("Supabase record_interaction failed: %s", e)

    async def clear_user_graph(self, user_id: str) -> bool:
        """Purge user data from both local fallback and Supabase."""
        await self.fallback.clear_user_graph(user_id)

        if not self.is_configured:
            return True

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.delete(
                    f"{self.url}/rest/v1/user_pattern_nodes?user_id=eq.{user_id}",
                    headers=self.headers,
                )
                await client.delete(
                    f"{self.url}/rest/v1/user_memory_graphs?user_id=eq.{user_id}",
                    headers=self.headers,
                )
            return True
        except Exception as e:
            logger.error("Supabase clear_user_graph failed: %s", e)
            return False
