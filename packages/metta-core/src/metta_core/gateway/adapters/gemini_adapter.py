"""Gemini 3.8 Flash Adapter via Antigravity Engine."""

from typing import Optional
from metta_core.gateway.interfaces import BaseAIProvider
from metta_core.providers.antigravity import AntigravityGeminiProvider


class GeminiAntigravityAdapter(BaseAIProvider):
    """Adapter wrapping Google Antigravity Gemini 3.8 Flash engine."""

    def __init__(self, model: str = "gemini-3.8-flash-high"):
        self._model = model
        self._provider = AntigravityGeminiProvider(model=self._model)

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def model_name(self) -> str:
        return self._model

    def set_model(self, model: str) -> None:
        self._model = model
        self._provider = AntigravityGeminiProvider(model=self._model)

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        return await self._provider.generate(
            prompt=prompt,
            system_instruction=system_instruction,
            effort=effort,
            json_output=json_output,
        )
