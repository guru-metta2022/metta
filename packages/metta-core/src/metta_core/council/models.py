"""Data models and schemas for Metta Council & Deliberation Protocol."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ModelTarget(BaseModel):
    """Specification of an AI model participant in the Council."""

    name: str = Field(..., description="Unique model identifier (e.g. 'gemini-3.8-flash-high', 'llama-3', 'claude-3-5-sonnet')")
    provider_type: str = Field(default="gemini", description="'gemini', 'openai_compatible', 'anthropic', 'local', 'mock'")
    base_url: Optional[str] = Field(default=None, description="Optional base URL for local or custom OpenAI-compatible endpoints")
    api_key: Optional[str] = Field(default=None, description="Optional BYOM API key")
    temperature: float = Field(default=0.3, ge=0.0, le=2.0)
    timeout_seconds: float = Field(default=30.0, ge=1.0, le=120.0)


class CouncilPerspective(BaseModel):
    """An individual model's perspective collected during parallel consultation."""

    perspective_id: str = Field(..., description="Internal identifier (e.g. 'perspective_a')")
    anonymized_label: str = Field(..., description="Blind label for unbiased evaluation (e.g. 'Perspective A')")
    model_name: str = Field(..., description="Actual model name")
    provider: str = Field(..., description="Underlying provider")
    content: str = Field(..., description="Generated text perspective")
    latency_ms: float = Field(default=0.0, description="Inference latency in milliseconds")
    tokens_used: Optional[int] = Field(default=None, description="Reported or estimated token usage")
    is_successful: bool = Field(default=True, description="Whether the generation succeeded")
    error: Optional[str] = Field(default=None, description="Error message if generation failed")


class DisagreementMatrix(BaseModel):
    """Dialectical tension and consensus breakdown across council perspectives."""

    consensus_points: List[str] = Field(default_factory=list, description="Core claims and assumptions agreed upon by all perspectives")
    tensions_and_disagreements: List[str] = Field(default_factory=list, description="Contradictions, trade-offs, or diverging recommendations")
    lone_blind_spots: List[str] = Field(default_factory=list, description="Unique, non-obvious angles surfaced by only one model")
    unresolved_uncertainties: List[str] = Field(default_factory=list, description="Remaining open questions, data gaps, or uncertainties")


class TransformativeGuidance(BaseModel):
    """Ethical alchemy guidance: transforming offensive or harmful capability into guardian stewardship."""

    is_harmful_or_adversarial: bool = Field(default=False, description="Whether the input contains destructive, exploitative, or harmful intent")
    capability_acknowledged: Optional[str] = Field(default=None, description="Respectful acknowledgment of technical skill or core intention")
    blast_radius_illuminated: Optional[str] = Field(default=None, description="Clear mapping of systemic collateral damage and affected sentient beings")
    constructive_alternative: Optional[str] = Field(default=None, description="Superior constructive path (e.g. responsible disclosure, patch, defensive barrier)")
    guardian_payload: Optional[str] = Field(default=None, description="Concrete defensive artifact, remediation code, or boundary verification")


class CouncilResult(BaseModel):
    """Consolidated outcome of a Metta Council deliberation session."""

    query: str = Field(..., description="The original problem, dilemma, or proposal submitted")
    context: Optional[str] = Field(default=None, description="Surrounding task or situational context")
    quorum_met: bool = Field(..., description="Whether the minimum required number of models responded successfully")
    perspectives_count: int = Field(..., description="Total models queried")
    successful_perspectives: int = Field(..., description="Count of successfully retrieved perspectives")
    perspectives: List[CouncilPerspective] = Field(default_factory=list, description="Individual model perspectives (anonymized & raw)")
    disagreement_matrix: DisagreementMatrix = Field(default_factory=DisagreementMatrix, description="Dialectical tension analysis")
    consolidated_synthesis: str = Field(..., description="Independent executive synthesis weighing all perspectives")
    transformative_guidance: Optional[TransformativeGuidance] = Field(default=None, description="Ethical alchemy guidance if adversarial intent was detected")
    decision_review: Optional[Dict[str, Any]] = Field(default=None, description="Optional Metta Decision Layer advisory verdict (YES/NO/CAUTION)")
    deliberation_duration_ms: float = Field(default=0.0, description="Total deliberation pipeline runtime in milliseconds")
