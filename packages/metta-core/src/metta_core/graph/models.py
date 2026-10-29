"""Models for the Principle Knowledge Graph (Dhamma)."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ConditionNode(BaseModel):
    """A recognized node of distress, cognitive knot, or human struggle."""

    id: str = Field(description="Unique identifier (e.g. 'anxiety:future_catastrophizing')")
    name: str = Field(description="Human readable name")
    category: str = Field(description="Category e.g. 'fear', 'grief', 'anger', 'exhaustion', 'craving'")
    underlying_illusion: str = Field(description="The underlying cognitive distortion or clinging (e.g. 'Belief that certainty is required to act')")
    keywords: List[str] = Field(default_factory=list, description="Keywords and patterns that indicate this state")


class EquanimityNode(BaseModel):
    """A target state of clarity, calm, or grounded agency."""

    id: str = Field(description="Unique identifier (e.g. 'clarity:immediate_presence')")
    name: str = Field(description="Name of the grounded state")
    description: str = Field(description="Description of the peaceful state")


class PrinciplePath(BaseModel):
    """A transformative principle or practice connecting a condition to equanimity."""

    from_condition: str = Field(description="Source ConditionNode id")
    to_equanimity: str = Field(description="Target EquanimityNode id")
    principle: str = Field(description="Core timeless insight (e.g. 'Anicca / Impermanence of sensation')")
    reframe: str = Field(description="Cognitive reframe to offer the user")
    immediate_action: str = Field(description="Concrete, gentle micro-action to take right now")
    sutta_reference: Optional[str] = Field(default=None, description="Optional classical philosophical anchor")


class GraphMatch(BaseModel):
    """Result of matching a user state to a graph path."""

    condition: ConditionNode
    equanimity: EquanimityNode
    path: PrinciplePath
    relevance_score: float = Field(default=1.0)
