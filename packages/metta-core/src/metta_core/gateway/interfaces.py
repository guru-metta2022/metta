"""Abstract Interfaces for Unified AI Gateway and Provider Adapters."""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class VoiceDiagnostics(BaseModel):
    """Diagnostics extracted during audio/speech transcription sanitization."""

    raw_input: str
    sanitized_input: str
    noise_artifacts_removed: List[str] = Field(default_factory=list)
    quality_score: float = Field(default=1.0, ge=0.0, le=1.0)
    word_count: int
    is_empty_or_pure_noise: bool = False


class AgentSettings(BaseModel):
    """Runtime configurable settings for the AI Gateway."""

    active_provider: str = "gemini"
    available_providers: List[str] = Field(default_factory=lambda: ["gemini", "local_llm", "open_source"])
    model: str = "gemini-3.8-flash-high"
    system_one_active: bool = False
    system_one_provider: str = "jev"
    voice_diagnostics_enabled: bool = True


class BaseAIProvider(ABC):
    """Unified, provider-agnostic custom class interface for AI model drivers."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        """Generate response from the underlying model."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Unique provider identifier (e.g. 'gemini', 'local_llm')."""
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Currently targeted model name."""
        pass

    @abstractmethod
    def set_model(self, model: str) -> None:
        """Dynamically update model target."""
        pass
