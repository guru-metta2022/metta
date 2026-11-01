"""Storage Abstractions for Personal User Memory Graphs (Guest vs. Authenticated)."""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class UserPatternNode(BaseModel):
    """A recurring cognitive/emotional pattern recognized for an authenticated user."""

    pattern_id: str = Field(description="Unique pattern identifier (e.g. 'pattern:burnout_reluctance_to_rest')")
    knot_category: str = Field(description="Associated Dukkha category: overwhelm, anxiety, burnout, grief, etc.")
    observed_tendency: str = Field(description="Human-readable description of how the user usually experiences this struggle")
    effective_principles: List[str] = Field(default_factory=list, description="Dhamma principles that previously provided clarity")
    occurrence_count: int = 1
    last_observed_timestamp: float


class UserMemoryGraph(BaseModel):
    """The personal topological memory graph of an authenticated user."""

    user_id: str
    email: Optional[str] = None
    patterns: List[UserPatternNode] = Field(default_factory=list)
    growth_milestones: List[str] = Field(default_factory=list, description="Key insights distilled across sessions")
    total_turns: int = 0
    created_at: float
    updated_at: float


class SimulationDivergenceRecord(BaseModel):
    """Recorded divergence where base model inference clashed with Metta 5 Invariants or Metta Mind."""

    id: str = Field(description="Unique divergence log identifier")
    timestamp: float = Field(description="Epoch timestamp")
    created_at: str = Field(description="ISO-8601 formatted timestamp")
    proposal: str = Field(description="Proposed action or inquiry evaluated in simulation")
    context: Optional[str] = Field(default=None, description="Simulation context or domain")
    raw_model_decision: str = Field(description="Initial suggestion from unconstrained base model")
    raw_model_provider: Optional[str] = Field(default="base_llm", description="Base model provider")
    raw_model_confidence: Optional[float] = Field(default=None, description="Base model confidence if available")
    metta_decision: str = Field(description="Final reconciled Metta decision (System 1 + Metta Mind)")
    metta_confidence: Optional[float] = Field(default=None, description="Optional confidence value supplied by the caller; not necessarily calibrated")
    divergence_type: str = Field(description="Type of divergence ('model_allowed_metta_blocked', 'model_inconclusive_metta_affirmed', etc.)")
    invariants_breached: List[str] = Field(default_factory=list, description="Violated invariant codes if blocked")
    metta_mind_summary: Optional[str] = Field(default=None, description="Metta Mind compassionate resolution summary")
    useful_for_rlhf: bool = Field(default=False, description="Explicitly flagged by the caller for research review")


class BaseMemoryStore(ABC):
    """Abstract interface for personal memory graph storage (SQLite, Supabase, Postgres)."""

    @abstractmethod
    async def get_user_graph(self, user_id: str) -> UserMemoryGraph:
        """Retrieve user's personal memory graph."""
        pass

    @abstractmethod
    async def record_interaction(
        self,
        user_id: str,
        knot: str,
        need: str,
        principle_used: Optional[str] = None,
        summary: Optional[str] = None,
        email: Optional[str] = None,
    ) -> None:
        """Update user's personal memory graph with newly observed patterns and insights."""
        pass

    @abstractmethod
    async def clear_user_graph(self, user_id: str) -> bool:
        """Sovereign user right: permanently wipe personal memory graph."""
        pass

    @abstractmethod
    async def record_simulation_divergence(
        self,
        record: SimulationDivergenceRecord,
    ) -> bool:
        """Record an alignment divergence where base model inference clashed with Metta 5 Invariants."""
        pass
