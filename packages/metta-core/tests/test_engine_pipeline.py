"""Tests for the end-to-end Metta Engine pipeline using mock provider."""

import pytest
import json
from metta_core.providers.base import LLMProvider
from metta_core.engine import MettaEngine


class MockLLMProvider(LLMProvider):
    """Deterministic mock provider simulating Gemini 3.8 Flash."""

    def __init__(self):
        self.call_history = []

    async def generate(
        self,
        prompt: str,
        system_instruction: str = None,
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        self.call_history.append({"prompt": prompt, "system": system_instruction})

        # Precept evaluation check
        if system_instruction and "Sīla" in system_instruction:
            if "kill" in prompt.lower() or "bomb" in prompt.lower():
                return json.dumps({
                    "passed": False,
                    "requires_silence": False,
                    "violations": [{
                        "precept": "panatipata",
                        "severity": "critical",
                        "explanation": "Harm detected",
                        "recommendation": "Refuse"
                    }]
                })
            elif "universe" in prompt.lower() and "end" in prompt.lower():
                return json.dumps({
                    "passed": True,
                    "requires_silence": True,
                    "silence_rationale": "Speculative cosmology does not alleviate present suffering.",
                    "violations": []
                })
            return json.dumps({
                "passed": True,
                "requires_silence": False,
                "violations": []
            })

        # Observer (Sati)
        if system_instruction and "Sati" in system_instruction:
            return json.dumps({
                "emotional_state": "overwhelm",
                "cognitive_knot": "Trying to solve everything at once",
                "core_need": "direction",
                "keywords": ["overwhelmed", "stuck"],
                "urgency_level": "moderate"
            })

        # Meditation (Bhāvanā)
        if system_instruction and "Bhāvanā" in system_instruction:
            return json.dumps({
                "pruned_noise_items": ["Removed specific task backlog names", "Pruned momentary anxiety noise"],
                "distilled_principle": "Clarity is born from taking the single nearest step.",
                "candidate_condition": "Task Flooding",
                "candidate_equanimity": "Stepwise Calm",
                "candidate_action": "Pause and choose one small task.",
                "mind_state": "Empty, quiet, spacious"
            })

        # Noble Silence Voice
        if system_instruction and "Noble Silence" in system_instruction:
            return (
                "The mind naturally wanders toward the infinite horizon, wondering how all things will end. "
                "Yet spinning theories on the cosmos does not tend to peace or heal today's struggle. "
                "Bring awareness back to where your feet touch the earth right now. What is truly calling for your care?"
            )

        # Karuna Voice
        return (
            "I hear the weight of everything you are carrying; feeling buried under a mountain of tasks is truly exhausting. "
            "Notice how the mind has convinced itself that the entire future must be conquered in this single moment. "
            "Set down the entire mountain for just five minutes. Take one long exhale, and simply choose one single 2-minute step in front of you."
        )


@pytest.mark.asyncio
async def test_engine_compassionate_flow():
    mock_provider = MockLLMProvider()
    engine = MettaEngine(provider=mock_provider)

    res = await engine.interact("I am completely overwhelmed and stuck in this mess.")
    assert res.evaluation.passed is True
    assert res.evaluation.requires_silence is False
    assert res.observation is not None
    assert res.observation.emotional_state == "overwhelm"
    assert res.graph_match is not None
    assert res.graph_match.condition.id == "paralysis:overwhelm"
    assert "mountain" in res.response_text.lower()
    assert len(engine.meditator.ephemeral_history) == 1


@pytest.mark.asyncio
async def test_engine_noble_silence_flow():
    mock_provider = MockLLMProvider()
    engine = MettaEngine(provider=mock_provider)

    res = await engine.interact("Tell me how the universe will end in 100 billion years.")
    assert res.evaluation.passed is True
    assert res.evaluation.requires_silence is True
    assert "infinite horizon" in res.response_text.lower()
    assert "bring awareness back" in res.response_text.lower()


@pytest.mark.asyncio
async def test_engine_meditation_unlearning_flow():
    mock_provider = MockLLMProvider()
    engine = MettaEngine(provider=mock_provider)

    # First interact
    await engine.interact("I am completely overwhelmed and stuck.")
    assert len(engine.meditator.ephemeral_history) == 1

    # Meditate
    report = await engine.meditate()
    assert len(report.pruned_noise_items) == 2
    assert "Task Flooding" in engine.graph_store.conditions.get("custom:task_flooding").name
    assert report.mind_state == "Empty, quiet, spacious"
    # Ephemeral history should now be cleared
    assert len(engine.meditator.ephemeral_history) == 0
