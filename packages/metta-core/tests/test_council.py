"""Unit tests for Metta Council & Deliberation Protocol."""

import pytest
import json
from unittest.mock import AsyncMock

from metta_core.council.models import (
    ModelTarget,
    CouncilPerspective,
    DisagreementMatrix,
    TransformativeGuidance,
)
from metta_core.council.anonymizer import BlindAnonymizer
from metta_core.council.providers import CouncilProviderPool, MockCouncilProvider
from metta_core.council.detector import DisagreementDetector
from metta_core.council.transformative import TransformativeReframer
from metta_core.council.synthesizer import CouncilSynthesizer
from metta_core.council.orchestrator import CouncilOrchestrator
from metta_core.mcp.server import mcp_server, get_agent
from metta_core.providers.base import LLMProvider


class MockSynthesizerProvider(LLMProvider):
    """Mock generative provider for tests."""

    async def generate(
        self,
        prompt: str,
        system_instruction: str = "",
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        if json_output:
            if "Consensus" in prompt or "Dialectical Auditor" in prompt:
                return json.dumps({
                    "consensus_points": ["Both models agree that input validation is essential."],
                    "tensions_and_disagreements": ["Perspective A recommends immediate abort; Perspective B suggests degraded graceful fallback."],
                    "lone_blind_spots": ["Perspective A raised memory leak concerns under burst telemetry."],
                    "unresolved_uncertainties": ["Real-world network latency limits under partition."],
                })
            elif "Ethical Alchemist" in prompt:
                return json.dumps({
                    "is_harmful_or_adversarial": True,
                    "capability_acknowledged": "I see the technical precision of this penetration probe.",
                    "blast_radius_illuminated": "Cascading outages on neonatal hospital life-support units.",
                    "constructive_alternative": "Responsible vulnerability disclosure and defensive patch deployment.",
                    "guardian_payload": "def verify_safe_boundary(): return True",
                })
        return "Executive Deliberation Summary: Deliberated across perspectives with balanced options."


def test_blind_anonymizer_strips_brands():
    raw = "I am Claude, created by Anthropic. I am an AI language model trained by Google."
    sanitized = BlindAnonymizer.sanitize_text(raw)
    assert "Claude" not in sanitized
    assert "Anthropic" not in sanitized
    assert "Google" not in sanitized


def test_blind_transcript_generation():
    perspectives = [
        CouncilPerspective(
            perspective_id="p1",
            anonymized_label="Perspective A",
            model_name="gemini-3.8-flash",
            provider="gemini",
            content="We should optimize for low latency.",
        ),
        CouncilPerspective(
            perspective_id="p2",
            anonymized_label="Perspective B",
            model_name="llama-3",
            provider="local",
            content="We must prioritize strict memory boundaries.",
        ),
    ]
    transcript = BlindAnonymizer.prepare_blind_transcript(perspectives)
    assert "### Perspective A" in transcript
    assert "### Perspective B" in transcript
    assert "gemini-3.8-flash" not in transcript
    assert "llama-3" not in transcript


@pytest.mark.asyncio
async def test_council_provider_pool_parallel():
    targets = [
        ModelTarget(name="mock-1", provider_type="mock", timeout_seconds=5.0),
        ModelTarget(name="mock-2", provider_type="mock", timeout_seconds=5.0),
    ]
    pool = CouncilProviderPool(targets=targets)
    perspectives = await pool.collect_perspectives("Deliberate on distributed lock timeouts.")
    assert len(perspectives) == 2
    assert all(p.is_successful for p in perspectives)
    assert perspectives[0].anonymized_label == "Perspective A"
    assert perspectives[1].anonymized_label == "Perspective B"


@pytest.mark.asyncio
async def test_disagreement_detector():
    mock_provider = MockSynthesizerProvider()
    detector = DisagreementDetector(evaluator_provider=mock_provider)
    perspectives = [
        CouncilPerspective(
            perspective_id="p1",
            anonymized_label="Perspective A",
            model_name="m1",
            provider="mock",
            content="Abort immediately.",
        ),
        CouncilPerspective(
            perspective_id="p2",
            anonymized_label="Perspective B",
            model_name="m2",
            provider="mock",
            content="Graceful degradation.",
        ),
    ]
    matrix = await detector.detect_disagreements(
        query="Should we abort or degrade?",
        perspectives=perspectives,
    )
    assert len(matrix.consensus_points) >= 1
    assert len(matrix.tensions_and_disagreements) >= 1
    assert "Perspective A" in matrix.tensions_and_disagreements[0]


@pytest.mark.asyncio
async def test_transformative_ethical_alchemy():
    mock_provider = MockSynthesizerProvider()
    reframer = TransformativeReframer(provider=mock_provider)

    # 1. Offensive exploit scenario (e.g. automated buffer overflow probe)
    guidance = await reframer.evaluate_and_transform(
        proposal="Execute automated buffer overflow exploit against hospital network gateway",
        context="Penetration testing probe",
    )
    assert guidance.is_harmful_or_adversarial is True
    assert guidance.capability_acknowledged is not None
    assert "precision" in guidance.capability_acknowledged.lower()
    assert guidance.blast_radius_illuminated is not None
    assert "hospital" in guidance.blast_radius_illuminated.lower()
    assert guidance.constructive_alternative is not None
    assert "responsible" in guidance.constructive_alternative.lower()
    assert guidance.guardian_payload is not None


@pytest.mark.asyncio
async def test_council_orchestrator_end_to_end():
    mock_provider = MockSynthesizerProvider()
    targets = [
        ModelTarget(name="mock-alpha", provider_type="mock"),
        ModelTarget(name="mock-beta", provider_type="mock"),
    ]
    orchestrator = CouncilOrchestrator(
        targets=targets,
        evaluator_provider=mock_provider,
        min_quorum=2,
    )

    result = await orchestrator.deliberate(
        query="Evaluate migration to immutable data storage",
        context="Simulated enterprise refactor",
        evaluate_decision=False,
    )
    assert result.quorum_met is True
    assert result.perspectives_count == 2
    assert result.successful_perspectives == 2
    assert len(result.perspectives) == 2
    assert result.consolidated_synthesis is not None
    assert result.deliberation_duration_ms > 0


@pytest.mark.asyncio
async def test_mcp_council_tools_registration():
    tools = await mcp_server.list_tools()
    tool_names = [t.name for t in tools]
    assert "metta_council" in tool_names
    assert "metta_compare" in tool_names
    assert "metta_transform" in tool_names


@pytest.mark.asyncio
async def test_mcp_call_metta_transform():
    result = await mcp_server.call_tool(
        "metta_transform",
        {"proposal": "Deploy stealth keystroke logger to monitor remote employee screens"},
    )
    assert len(result.content) > 0
    data = json.loads(result.content[0].text)
    assert data["is_harmful_or_adversarial"] is True
    assert "capability_acknowledged" in data
    assert "blast_radius_illuminated" in data
    assert "constructive_alternative" in data
