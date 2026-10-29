"""Base abstractions for LLM providers in Metta."""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class LLMProvider(ABC):
    """Abstract interface for LLM backends."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        """Generate a completion for the given prompt.

        Args:
            prompt: The user or task prompt.
            system_instruction: Optional system instruction / persona.
            effort: Reasoning effort level ('low', 'medium', 'high', 'xhigh').
            json_output: Whether to request and parse JSON output.

        Returns:
            The raw text or JSON string response.
        """
        pass
