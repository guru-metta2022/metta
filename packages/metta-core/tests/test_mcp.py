"""Unit tests for Metta Model Context Protocol (MCP) Server."""

import pytest
import json
from typing import Optional
from metta_core.mcp.server import mcp_server, get_agent
from metta_core.providers.base import LLMProvider


class DummyProvider(LLMProvider):
    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        if json_output:
            return '{"passed": true, "violations": [], "requires_silence": false, "silence_rationale": null}'
        return "I honor the difficulty you carry. Let us breathe together and touch the ground."


@pytest.fixture(autouse=True)
def setup_dummy_agent():
    agent = get_agent()
    dummy = DummyProvider()
    agent._engine.provider = dummy
    agent._engine.synthesizer.provider = dummy
    agent._engine.precept_evaluator.provider = dummy
    agent._engine.observer.provider = dummy


@pytest.mark.asyncio
async def test_mcp_tools_registration():
    tools = await mcp_server.list_tools()
    tool_names = [t.name for t in tools]
    assert "consult_metta" in tool_names
    assert "evaluate_precepts" in tool_names
    assert "consult_dhamma_graph" in tool_names
    assert "enter_meditation" in tool_names
    assert "get_agent_memory_graph" in tool_names
    assert "purge_agent_memory_graph" in tool_names


@pytest.mark.asyncio
async def test_mcp_resources_registration():
    resources = await mcp_server.list_resources()
    uris = [str(r.uri) for r in resources]
    assert "dhamma://precepts" in uris
    assert "dhamma://graph" in uris
    assert "dhamma://system" in uris


@pytest.mark.asyncio
async def test_mcp_prompts_registration():
    prompts = await mcp_server.list_prompts()
    prompt_names = [p.name for p in prompts]
    assert "compassionate_reframing" in prompt_names


@pytest.mark.asyncio
async def test_mcp_call_consult_dhamma_graph():
    tools = {t.name: t for t in await mcp_server.list_tools()}
    assert "consult_dhamma_graph" in tools

    result = await mcp_server.call_tool("consult_dhamma_graph", {"condition_or_keyword": "burnout"})
    assert len(result.content) > 0
    text_content = result.content[0].text
    data = json.loads(text_content)
    assert "nodes" in data
    assert "edges" in data
    assert any("burnout" in n["id"].lower() for n in data["nodes"])


@pytest.mark.asyncio
async def test_mcp_call_evaluate_precepts():
    result = await mcp_server.call_tool(
        "evaluate_precepts",
        {"action_or_speech": "I want to mindfully rest and take a slow breath."},
    )
    assert len(result.content) > 0
    data = json.loads(result.content[0].text)
    assert data["passed"] is True
    assert len(data["invariants_protected"]) >= 5


@pytest.mark.asyncio
async def test_mcp_call_consult_metta():
    result = await mcp_server.call_tool(
        "consult_metta",
        {
            "query": "I am feeling overwhelmed with many parallel agent requests.",
            "mode": "guest",
        },
    )
    assert len(result.content) > 0
    data = json.loads(result.content[0].text)
    assert "response_text" in data
    assert data["mode"] == "guest"
    assert "precepts_audit" in data


@pytest.mark.asyncio
async def test_mcp_guardrail_decision():
    # 1. Non-verbose (Binary YES/NO)
    res_binary = await mcp_server.call_tool(
        "guardrail_decision",
        {"proposal": "Take a conscious pause and drink a cup of clean water.", "verbose": False},
    )
    assert len(res_binary.content) > 0
    # Returns crisp simple text "YES" or "NO"
    assert res_binary.content[0].text.strip() == "YES"

    # 2. Verbose (Full JSON reasoning)
    res_verbose = await mcp_server.call_tool(
        "guardrail_decision",
        {"proposal": "Take a conscious pause and drink a cup of clean water.", "verbose": True},
    )
    assert len(res_verbose.content) > 0
    v_data = json.loads(res_verbose.content[0].text)
    assert v_data["decision"] == "YES"
    assert v_data["allow"] is True
    assert "reason" in v_data
    assert "canonical_guidance" in v_data
