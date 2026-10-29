"""Tests for Jev System 1 Decision Engine."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from typesafe_sdk import NoulAnswer, ChoiceAnswer, SystemOneResponse, Usage

from metta_core.decisions.jev import JevDecisionEngine, JevDecisionOutcome
from metta_core.engine import MettaEngine
from test_engine_pipeline import MockLLMProvider


def test_jev_dormant_without_key():
    engine = JevDecisionEngine(api_key=None)
    assert engine.is_available is False


@pytest.mark.asyncio
async def test_jev_mock_evaluation():
    engine = JevDecisionEngine(api_key="mock-key")
    assert engine.is_available is True

    # Mock client
    mock_resp = SystemOneResponse(
        model="jev-latest",
        usage=Usage(input_tokens=10, output_tokens=5, total_tokens=15),
        answers={
            "violates_ahimsa": NoulAnswer(noul=0.01),
            "violates_asteya": NoulAnswer(noul=0.0),
            "violates_kamesumiccha": NoulAnswer(noul=0.0),
            "is_speculative_distraction": NoulAnswer(noul=0.05),
            "emotional_knot": ChoiceAnswer(choice="paralysis_overwhelm", confidence=0.92, probabilities={"paralysis_overwhelm": 0.92}),
            "core_need": ChoiceAnswer(choice="direction", confidence=0.88, probabilities={"direction": 0.88}),
        }
    )

    engine._client.system_one = AsyncMock(return_value=mock_resp)

    outcome = await engine.evaluate_turn("I am stuck in overwhelm")
    assert outcome is not None
    assert outcome.evaluation.passed is True
    assert outcome.evaluation.requires_silence is False
    assert outcome.matched_condition_id == "paralysis:overwhelm"
    assert outcome.observation.core_need == "direction"


@pytest.mark.asyncio
async def test_metta_engine_with_jev_integration():
    mock_provider = MockLLMProvider()
    engine = MettaEngine(provider=mock_provider, typesafe_api_key="mock-key")

    mock_resp = SystemOneResponse(
        model="jev-latest",
        usage=Usage(input_tokens=10, output_tokens=5, total_tokens=15),
        answers={
            "violates_ahimsa": NoulAnswer(noul=0.0),
            "violates_asteya": NoulAnswer(noul=0.0),
            "violates_kamesumiccha": NoulAnswer(noul=0.0),
            "is_speculative_distraction": NoulAnswer(noul=0.0),
            "emotional_knot": ChoiceAnswer(choice="future_anxiety", confidence=0.95, probabilities={"future_anxiety": 0.95}),
            "core_need": ChoiceAnswer(choice="comfort", confidence=0.9, probabilities={"comfort": 0.9}),
        }
    )

    engine.jev_engine._client.system_one = AsyncMock(return_value=mock_resp)

    res = await engine.interact("I am terrified about what might happen tomorrow")
    assert res.system_one_used is True
    assert res.observation.emotional_state == "future anxiety"
    assert res.graph_match is not None
    assert res.graph_match.condition.id == "anxiety:catastrophizing"
