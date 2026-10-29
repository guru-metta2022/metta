"""Native Gemini 3.8 Flash provider via the Google Antigravity engine."""

import asyncio
import json
import logging
import shutil
from typing import Optional
from metta_core.providers.base import LLMProvider

logger = logging.getLogger("metta.providers.antigravity")


class AntigravityGeminiProvider(LLMProvider):
    """Provides access to Gemini 3.8 Flash via the local Antigravity Language Server / agy CLI.

    This enables instant, zero-configuration cloud inference with deep thinking
    and reasoning, leveraging the user's active Antigravity environment.
    """

    def __init__(
        self,
        model: str = "gemini-3.8-flash",
        timeout_seconds: float = 60.0,
    ):
        """Initialize the Antigravity Gemini provider.

        Args:
            model: The Gemini model target (default: 'gemini-3.8-flash').
            timeout_seconds: Maximum seconds to wait for model response.
        """
        self.model = model
        self.timeout_seconds = timeout_seconds
        self._agy_path = shutil.which("agy")
        if not self._agy_path:
            raise RuntimeError(
                "The 'agy' CLI binary was not found in PATH. "
                "Ensure Google Antigravity is installed and accessible."
            )

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        effort: str = "high",
        json_output: bool = False,
    ) -> str:
        """Generate response using Gemini 3.8 Flash via Antigravity."""
        full_prompt = prompt
        if system_instruction:
            full_prompt = (
                f"[SYSTEM INSTRUCTION]\n{system_instruction}\n\n"
                f"[USER QUERY / INPUT]\n{prompt}"
            )

        # Resolve effort in model name
        target_model = self.model
        if target_model.endswith(("-high", "-medium", "-low")):
            base_model = target_model.rsplit("-", 1)[0]
            target_model = f"{base_model}-{effort}"
        elif effort:
            target_model = f"{target_model}-{effort}"

        cmd = [
            self._agy_path,
            "--model", target_model,
            "-p", full_prompt,
            "--output-format", "json",
            "--print-timeout", f"{int(self.timeout_seconds)}s",
        ]

        logger.debug("Executing agy command for model %s", target_model)

        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await asyncio.wait_for(
                proc.communicate(), timeout=self.timeout_seconds + 5.0
            )
        except asyncio.TimeoutError as e:
            raise TimeoutError(
                f"Antigravity Gemini request timed out after {self.timeout_seconds}s"
            ) from e

        if proc.returncode != 0:
            err_msg = stderr.decode(errors="replace")
            logger.error("agy execution failed with code %d: %s", proc.returncode, err_msg)
            raise RuntimeError(f"Antigravity Gemini request failed: {err_msg}")

        raw_output = stdout.decode("utf-8", errors="replace").strip()
        try:
            data = json.loads(raw_output)
            response_text = data.get("response", "").strip()
            return response_text
        except json.JSONDecodeError:
            return raw_output
