"""Tests for Voice Dictation Sanitizer and Unified AIAgent Gateway."""

import pytest
from metta_core.gateway.diagnostics import VoiceSanitizer
from metta_core.gateway.agent import AIAgent


def test_voice_sanitizer_removes_artifacts():
    raw_speech = "Um, uh, [noise] I am... I am feeling so overwhelmed with with work umm."
    diag = VoiceSanitizer.run_diagnostics(raw_speech)

    assert diag.is_empty_or_pure_noise is False
    assert "um" in [a.lower() for a in diag.noise_artifacts_removed]
    assert "I am feeling so overwhelmed" in diag.sanitized_input
    assert diag.word_count >= 5
    assert diag.quality_score < 1.0  # artifacts lowered score appropriately


def test_voice_sanitizer_flags_pure_noise():
    empty_diag = VoiceSanitizer.run_diagnostics("   [noise]  ... ")
    assert empty_diag.is_empty_or_pure_noise is True
    assert empty_diag.quality_score == 0.0


def test_ai_agent_settings_and_swapping():
    agent = AIAgent(default_provider="gemini", default_model="gemini-3.8-flash-high")
    settings = agent.get_settings()

    assert settings.active_provider == "gemini"
    assert "gemini-3.8-flash-high" in settings.model
    assert "local_llm" in settings.available_providers

    # Swap to local_llm
    new_settings = agent.set_provider("local_llm", model="qwen-2.5-7b")
    assert new_settings.active_provider == "local_llm"
    assert new_settings.model == "qwen-2.5-7b"


@pytest.mark.asyncio
async def test_ai_agent_voice_empty_noise_fast_response():
    agent = AIAgent(default_provider="gemini")
    res = await agent.ask(payload="[noise] ... ", source="voice")

    assert res.diagnostics is not None
    assert res.diagnostics.is_empty_or_pure_noise is True
    assert "whisper" in res.response_text.lower()
