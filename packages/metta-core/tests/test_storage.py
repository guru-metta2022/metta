"""Unit tests for Personal Memory Graph Storage & Dual-Mode Identity."""

import pytest
import tempfile
from pathlib import Path

from metta_core.storage.sqlite_store import SQLiteMemoryStore
from metta_core.gateway.agent import AIAgent
from metta_core.providers.base import LLMProvider


class DummyProvider(LLMProvider):
    async def generate(self, prompt: str, system_instruction: str = "", effort: str = "high") -> str:
        return "I see the weight you carry. Let us breathe together and pause."


@pytest.mark.asyncio
async def test_sqlite_memory_store_lifecycle():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_memory.db"
        store = SQLiteMemoryStore(str(db_path))

        # 1. Empty initial graph
        graph = await store.get_user_graph("user_test_1")
        assert graph.user_id == "user_test_1"
        assert len(graph.patterns) == 0
        assert graph.total_turns == 0

        # 2. Record first interaction
        await store.record_interaction(
            user_id="user_test_1",
            knot="burnout",
            need="rest",
            principle_used="Viriya (Balanced Energy)",
            summary="Feeling overwhelmed with endless tasks",
            email="test@example.com",
        )

        graph = await store.get_user_graph("user_test_1")
        assert graph.total_turns == 1
        assert len(graph.patterns) == 1
        assert graph.patterns[0].knot_category == "burnout"
        assert graph.patterns[0].occurrence_count == 1
        assert "Viriya (Balanced Energy)" in graph.patterns[0].effective_principles

        # 3. Record second interaction with same knot
        await store.record_interaction(
            user_id="user_test_1",
            knot="burnout",
            need="rest",
            principle_used="Khandha (Non-identification)",
            summary="Still experiencing burnout",
        )

        graph = await store.get_user_graph("user_test_1")
        assert graph.total_turns == 2
        assert len(graph.patterns) == 1
        assert graph.patterns[0].occurrence_count == 2
        assert len(graph.patterns[0].effective_principles) == 2

        # 4. Third occurrence triggers growth milestone distillation
        await store.record_interaction(
            user_id="user_test_1",
            knot="burnout",
            need="rest",
            principle_used="Viriya (Balanced Energy)",
        )

        graph = await store.get_user_graph("user_test_1")
        assert graph.total_turns == 3
        assert graph.patterns[0].occurrence_count == 3
        assert len(graph.growth_milestones) >= 1
        assert "Recognized recurring tendency around 'burnout'" in graph.growth_milestones[0]

        # 5. Sovereign Purge (Clear User Graph)
        cleared = await store.clear_user_graph("user_test_1")
        assert cleared is True
        cleared_graph = await store.get_user_graph("user_test_1")
        assert cleared_graph.total_turns == 0
        assert len(cleared_graph.patterns) == 0
        assert len(cleared_graph.growth_milestones) == 0


@pytest.mark.asyncio
async def test_ai_agent_guest_vs_authenticated():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_agent_memory.db"
        store = SQLiteMemoryStore(str(db_path))

        agent = AIAgent(default_provider="gemini")
        # Replace provider with mock and attach test store
        agent._engine.provider = DummyProvider()
        agent._engine.synthesizer.provider = DummyProvider()
        agent._engine.precept_evaluator.provider = DummyProvider()
        agent._engine.observer.provider = DummyProvider()
        agent.set_memory_store(store)

        # 1. Guest Mode: No memory should be stored
        guest_res = await agent.ask(
            payload="I am feeling exhausted and burned out by work.",
            source="text",
            mode="guest",
            user_id="guest_session_1",
        )
        assert guest_res.mode == "guest"
        assert guest_res.user_graph_updated is False

        guest_graph = await store.get_user_graph("guest_session_1")
        assert guest_graph.total_turns == 0
        assert len(guest_graph.patterns) == 0

        # 2. Authenticated Mode: Memory must be recorded
        auth_res = await agent.ask(
            payload="I am experiencing deep burnout and struggle to stop.",
            source="text",
            mode="authenticated",
            user_id="user_bodhi_99",
            user_email="bodhi@example.com",
        )
        assert auth_res.mode == "authenticated"
        assert auth_res.user_graph_updated is True

        auth_graph = await store.get_user_graph("user_bodhi_99")
        assert auth_graph.total_turns == 1
        assert len(auth_graph.patterns) >= 1
        assert auth_graph.email == "bodhi@example.com"
