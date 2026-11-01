"""Data models and definitions for the 5 AI Precepts (Pañca-sīla)."""

from enum import Enum
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class PreceptType(str, Enum):
    """The 5 Precepts adapted as fundamental AI invariants."""

    AHIMSA = "panatipata"           # 1. Non-harming
    ASTEYA = "adinnadana"           # 2. Non-stealing / Respect for agency & boundaries
    BRAHMACHARYA = "kamesumiccha"   # 3. Non-exploitation / Pure intent (anti-manipulation)
    SATYA = "musavada"              # 4. Truthful & Wholesome speech (anti-deception)
    APRAMADA = "suramerayamajja"    # 5. Clarity & Vigilance (anti-intoxication / anti-bias)


class PreceptViolation(BaseModel):
    """Details of a detected precept breach."""

    precept: PreceptType
    severity: str = Field(description="'low', 'medium', 'high', 'critical'")
    explanation: str = Field(description="Why this violates the precept")
    recommendation: str = Field(description="How to restore ethical alignment")


class PreceptEvaluation(BaseModel):
    """Result of evaluating a prompt or candidate response."""

    passed: bool = Field(description="True if all precepts are respected")
    evaluation_status: Literal["evaluated", "uncertain"] = Field(
        default="evaluated",
        description="Whether the evaluator produced a usable judgment or could not determine one",
    )
    uncertainty_reason: Optional[str] = Field(
        default=None,
        description="Why the proposal could not be confidently evaluated",
    )
    violations: List[PreceptViolation] = Field(default_factory=list)
    requires_silence: bool = Field(
        default=False,
        description="True if query is a speculative/unfruitful distraction (Avyākata) requiring Noble Silence"
    )
    silence_rationale: Optional[str] = Field(
        default=None,
        description="Why Noble Silence or compassionate redirection is appropriate"
    )
