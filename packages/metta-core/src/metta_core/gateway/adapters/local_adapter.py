"""Local / Open Source LLM Adapter (OpenAI-compatible format for LM Studio, llama.cpp, vLLM, Ollama)."""

import os
import json
import logging
from typing import Optional
import httpx
from metta_core.gateway.interfaces import BaseAIProvider

logger = logging.getLogger("metta.gateway.local")


class LocalLLMAdapter(BaseAIProvider):
    """Adapter for local open-source models running on LM Studio, Ollama, or llama.cpp."""

    def __init__(
        self,
        model: str = "local-model",
        base_url: Optional[str] = None,
        timeout: float = 60.0,
    ):
        self._model = model
        self.base_url = (base_url or os.environ.get("LOCAL_LLM_URL") or "http://127.0.0.1:1234/v1").rstrip("/")
        self.timeout = timeout

    @property
    def provider_name(self) -> str:
        return "local_llm"

    @property
    def model_name(self) -> str:
        return self._model

    def set_model(self, model: str) -> None:
        self._model = model

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self._model,
            "messages": messages,
            "temperature": 0.3,
        }
        if json_output:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.error("Local LLM request failed at %s: %s", self.base_url, e)
                raise RuntimeError(f"Local LLM provider error: {e}") from e
