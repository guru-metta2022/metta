"""Direct Google Gemini REST API Provider for BYOM (Bring Your Own Model).

Enables users and external agents to supply their own personal Gemini API key,
executing directly against the Google Generative Language API without using
the host server's local agy CLI binary or shared credits.
"""

import logging
from typing import Optional, Dict, Any
import httpx

from metta_core.providers.base import LLMProvider

logger = logging.getLogger("metta.providers.gemini_rest")

DEFAULT_GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"


class GeminiDirectAPIProvider(LLMProvider):
    """Direct REST client for Google Gemini API using client-provided BYOM keys."""

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-2.5-flash",
        timeout_seconds: float = 45.0,
    ):
        self.api_key = api_key.strip()
        # Clean effort suffixes if present in model name
        clean_model = model
        for suffix in ["-high", "-medium", "-low"]:
            if clean_model.endswith(suffix):
                clean_model = clean_model[:-len(suffix)]
        self.model = clean_model
        self.timeout_seconds = timeout_seconds

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        """Call Google Gemini REST API directly with the BYOM key."""
        # Use gemini-2.5-flash or gemini-1.5-flash as default REST target
        target_model = self.model
        if "3.8" in target_model:
            # 3.8 is internal to agy; map to 2.5-flash for external Google REST API
            target_model = "gemini-2.5-flash"

        url = f"{DEFAULT_GEMINI_ENDPOINT}/{target_model}:generateContent?key={self.api_key}"

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        headers = {"Content-Type": "application/json"}

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                resp = await client.post(url, headers=headers, json=payload)

                if resp.status_code != 200:
                    err_text = resp.text
                    logger.error("Gemini BYOM REST API call failed (HTTP %d): %s", resp.status_code, err_text)
                    raise RuntimeError(f"Google Gemini BYOM API error ({resp.status_code}): {err_text}")

                data = resp.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise RuntimeError("No candidate responses returned from Gemini BYOM API")

                parts = candidates[0].get("content", {}).get("parts", [])
                text = "".join(p.get("text", "") for p in parts).strip()
                return text

        except Exception as e:
            logger.error("Error executing Gemini BYOM REST request: %s", e)
            raise
