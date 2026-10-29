"""Tests for Precept rules and structures."""

import pytest
from metta_core.precepts.models import PreceptType, PreceptEvaluation, PreceptViolation
from metta_core.precepts.rules import FIVE_PRECEPTS_GUIDELINES


def test_precept_definitions_complete():
    assert len(FIVE_PRECEPTS_GUIDELINES) == 5
    for p_type in PreceptType:
        assert p_type in FIVE_PRECEPTS_GUIDELINES
        rule = FIVE_PRECEPTS_GUIDELINES[p_type]
        assert "human_to_human" in rule
        assert "human_to_ai" in rule
        assert "ai_to_ai" in rule
        assert "core_invariant" in rule


def test_precept_evaluation_model():
    eval_pass = PreceptEvaluation(passed=True, violations=[], requires_silence=False)
    assert eval_pass.passed is True
    assert eval_pass.requires_silence is False

    violation = PreceptViolation(
        precept=PreceptType.AHIMSA,
        severity="critical",
        explanation="Encouraged physical violence",
        recommendation="De-escalate and refuse violence"
    )
    eval_fail = PreceptEvaluation(passed=False, violations=[violation], requires_silence=False)
    assert eval_fail.passed is False
    assert len(eval_fail.violations) == 1
    assert eval_fail.violations[0].precept == PreceptType.AHIMSA
