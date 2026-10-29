"""Gemini Adapter supporting both Native Antigravity (shared server) and Direct REST API (BYOM)."""

from typing import Optional
from metta_core.gateway.interfaces import BaseAIProvider
from metta_core.providers.antigravity import AntigravityGeminiProvider
from metta_core.providers.gemini_rest import GeminiDirectAPIProvider


class GeminiAntigravityAdapter(BaseAIProvider):
    """Adapter wrapping Gemini inference via Antigravity or direct BYOM API key."""

    def __init__(self, model: str = "gemini-3.8-flash-high", api_key: Optional[str] = None):
        self._model = model
        self._api_key = api_key
        self._init_provider()

    def _init_provider(self):
        if self._api_key:
            self._provider = GeminiDirectAPIProvider(api_key=self._api_key, model=self._model)
        else:
            self._provider = AntigravityGeminiProvider(model=self._model)

    @property
    def provider_name(self) -> str:
        return "gemini-byom" if self._api_key else "gemini"

    @property
    def model_name(self) -> str:
        return self._model

    def set_model(self, model: str) -> None:
        self._model = model
        self._init_provider()

    def set_api_key(self, api_key: Optional[str]) -> None:
        """Set or swap BYOM API key."""
        self._api_key = api_key
        self._init_provider()

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
