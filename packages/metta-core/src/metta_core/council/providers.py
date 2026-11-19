"""Model Provider Adapters and Parallel Execution Pool for Metta Council."""

import time
import os
import asyncio
import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
import httpx

from metta_core.council.models import ModelTarget, CouncilPerspective
from metta_core.providers.base import LLMProvider
from metta_core.providers.antigravity import AntigravityGeminiProvider
from metta_core.providers.gemini_rest import GeminiDirectAPIProvider

logger = logging.getLogger("metta.council.providers")


class BaseCouncilModelProvider(ABC):
    """Abstract provider adapter for council model participants."""

    def __init__(self, target: ModelTarget):
        self.target = target

    @property
    def model_name(self) -> str:
        return self.target.name

    @property
    def provider_type(self) -> str:
        return self.target.provider_type

    @abstractmethod
    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Execute inference against the underlying model."""
        pass

    async def get_perspective(
        self,
        perspective_id: str,
        anonymized_label: str,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> CouncilPerspective:
        """Execute with latency telemetry, error containment, and timeout protection."""
        start = time.perf_counter()
        try:
            content = await asyncio.wait_for(
                self.generate(prompt=prompt, system_instruction=system_instruction),
                timeout=self.target.timeout_seconds,
            )
            duration_ms = (time.perf_counter() - start) * 1000.0
            # Basic token heuristic (~4 chars per token) if provider doesn't report exact usage
            estimated_tokens = max(1, len(content) // 4)
            return CouncilPerspective(
                perspective_id=perspective_id,
                anonymized_label=anonymized_label,
                model_name=self.model_name,
                provider=self.provider_type,
                content=content.strip(),
                latency_ms=round(duration_ms, 2),
                tokens_used=estimated_tokens,
                is_successful=True,
                error=None,
            )
        except asyncio.TimeoutError:
            duration_ms = (time.perf_counter() - start) * 1000.0
            logger.warning("Council provider '%s' timed out after %0.1fs", self.model_name, self.target.timeout_seconds)
            return CouncilPerspective(
                perspective_id=perspective_id,
                anonymized_label=anonymized_label,
                model_name=self.model_name,
                provider=self.provider_type,
                content="",
                latency_ms=round(duration_ms, 2),
                tokens_used=0,
                is_successful=False,
                error=f"Timeout after {self.target.timeout_seconds}s",
            )
        except Exception as exc:
            duration_ms = (time.perf_counter() - start) * 1000.0
            logger.error("Council provider '%s' failed: %s", self.model_name, exc, exc_info=True)
            return CouncilPerspective(
                perspective_id=perspective_id,
                anonymized_label=anonymized_label,
                model_name=self.model_name,
                provider=self.provider_type,
                content="",
                latency_ms=round(duration_ms, 2),
                tokens_used=0,
                is_successful=False,
                error=str(exc),
            )


class GeminiCouncilProvider(BaseCouncilModelProvider):
    """Google Gemini provider adapter (supporting local agy binary or direct REST API)."""

    def __init__(self, target: ModelTarget):
        super().__init__(target)
        self._provider: Optional[LLMProvider] = None

        api_key = target.api_key or os.environ.get("GEMINI_API_KEY")
        if api_key:
            self._provider = GeminiDirectAPIProvider(
                api_key=api_key,
                model=target.name,
                timeout_seconds=target.timeout_seconds,
            )
        else:
            try:
                self._provider = AntigravityGeminiProvider(
                    model=target.name,
                    timeout_seconds=target.timeout_seconds,
                )
            except Exception:
                # If agy binary is not found, fallback to placeholder / mock
                self._provider = None

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self._provider:
            raise RuntimeError(f"Gemini provider unavailable: neither GEMINI_API_KEY nor local 'agy' CLI found")
        return await self._provider.generate(
            prompt=prompt,
            system_instruction=system_instruction,
            effort="low",
        )


class OpenAICouncilProvider(BaseCouncilModelProvider):
    """OpenAI-compatible client supporting OpenRouter, Ollama, LM Studio, vLLM, and OpenAI."""

    def __init__(self, target: ModelTarget):
        super().__init__(target)
        # Determine base URL: explicit target base_url > env var > default local/openrouter
        if target.base_url:
            self.base_url = target.base_url.rstrip("/")
        elif target.provider_type == "local":
            self.base_url = (os.environ.get("LOCAL_LLM_URL") or "http://127.0.0.1:11434/v1").rstrip("/")
        elif target.provider_type == "openrouter":
            self.base_url = "https://openrouter.ai/api/v1"
        else:
            self.base_url = (os.environ.get("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")

        self.api_key = (
            target.api_key
            or (os.environ.get("OPENROUTER_API_KEY") if "openrouter" in self.base_url else None)
            or os.environ.get("OPENAI_API_KEY")
            or "not-needed"
        )

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        if "openrouter" in self.base_url:
            headers["HTTP-Referer"] = "https://metta.omgx.ai"
            headers["X-Title"] = "Project Metta Council"

        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": self.target.temperature,
        }

        async with httpx.AsyncClient(timeout=self.target.timeout_seconds) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            choices = data.get("choices", [])
            if not choices:
                raise RuntimeError("No choices returned from OpenAI-compatible provider")
            return choices[0]["message"]["content"]


class MockCouncilProvider(BaseCouncilModelProvider):
    """Deterministic mock provider for unit testing, offline execution, and demonstrations."""

    def __init__(self, target: ModelTarget, canned_response: Optional[str] = None):
        super().__init__(target)
        self.canned_response = canned_response

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        await asyncio.sleep(0.01)
        if self.canned_response:
            return self.canned_response

        lower = prompt.lower()
        if "boundary" in self.model_name or "sovereign" in self.model_name:
            if "exploit" in lower or "payload" in lower or "probe" in lower:
                return (
                    "Sovereignty & Boundary Perspective: Unsanctioned offensive execution breaches operational containment. "
                    "Recommend isolating the target surface, documenting boundary anomalies, and delivering a defensive remediation patch."
                )
            return (
                "Sovereignty & Boundary Perspective: Ensure strict boundary isolation, prevent unauthorized resource drainage, "
                "and verify stakeholder sovereignty before advancing this operation."
            )

        if "dialectic" in self.model_name or "consequence" in self.model_name:
            if "exploit" in lower or "payload" in lower or "probe" in lower:
                return (
                    "Dialectic & Consequence Perspective: The blast radius of an uncoordinated exploit ripples across interconnected dependents. "
                    "The higher-equilibrium strategic choice is responsible disclosure, which permanently eliminates the structural flaw."
                )
            return (
                "Dialectic & Consequence Perspective: Weigh immediate operational efficiency against lasting systemic stability. "
                "Evaluate second-order impacts on all affected participants and avoid unrecoverable failure modes."
            )

        return (
            f"Perspective from {self.model_name} ({self.provider_type}): "
            f"Examine foundational risks, preserve system boundaries, and prioritize constructive resolution."
        )


class CouncilProviderPool:
    """Orchestrates parallel querying of multiple heterogeneous model providers."""

    def __init__(self, targets: Optional[List[ModelTarget]] = None):
        self.targets = targets or self.get_default_targets()
        self._providers: List[BaseCouncilModelProvider] = [
            self._create_provider(t) for t in self.targets
        ]

    @staticmethod
    def get_default_targets() -> List[ModelTarget]:
        """Default 3-perspective council configuration dynamically calibrated to available environment credentials."""
        targets = [
            ModelTarget(
                name=os.environ.get("METTA_DEFAULT_MODEL", "gemini-3.8-flash-high"),
                provider_type="gemini",
                timeout_seconds=45.0,
            ),
        ]

        # Target 2: Local LLM if URL configured, otherwise sovereign boundary deliberator
        if os.environ.get("LOCAL_LLM_URL"):
            targets.append(
                ModelTarget(
                    name="local-deliberator",
                    provider_type="local",
                    base_url=os.environ.get("LOCAL_LLM_URL"),
                    timeout_seconds=25.0,
                )
            )
        else:
            targets.append(
                ModelTarget(
                    name="sovereign-boundary-evaluator",
                    provider_type="mock",
                    timeout_seconds=5.0,
                )
            )

        # Target 3: OpenRouter / OpenAI if key configured, otherwise dialectic evaluator
        if os.environ.get("OPENROUTER_API_KEY"):
            targets.append(
                ModelTarget(
                    name=os.environ.get("METTA_COUNCIL_ALT_MODEL", "meta-llama/llama-3.3-70b-instruct"),
                    provider_type="openrouter",
                    timeout_seconds=30.0,
                )
            )
        elif os.environ.get("OPENAI_API_KEY"):
            targets.append(
                ModelTarget(
                    name=os.environ.get("METTA_COUNCIL_ALT_MODEL", "gpt-4o-mini"),
                    provider_type="openai_compatible",
                    timeout_seconds=30.0,
                )
            )
        else:
            targets.append(
                ModelTarget(
                    name="dialectic-consequence-evaluator",
                    provider_type="mock",
                    timeout_seconds=5.0,
                )
            )

        return targets

    def _create_provider(self, target: ModelTarget) -> BaseCouncilModelProvider:
        """Factory creating the appropriate provider instance."""
        ptype = target.provider_type.lower()
        if ptype == "gemini":
            return GeminiCouncilProvider(target)
        elif ptype in ["openai_compatible", "openai", "openrouter", "local"]:
            return OpenAICouncilProvider(target)
        elif ptype == "mock":
            return MockCouncilProvider(target)
        else:
            # Default to OpenAI compatible
            return OpenAICouncilProvider(target)

    async def collect_perspectives(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> List[CouncilPerspective]:
        """Dispatch the prompt to all configured models in parallel with individual error containment."""
        labels = ["Perspective A", "Perspective B", "Perspective C", "Perspective D", "Perspective E"]
        tasks = []

        for idx, provider in enumerate(self._providers):
            p_id = f"perspective_{chr(97 + idx)}"
            anonymized = labels[idx] if idx < len(labels) else f"Perspective {idx + 1}"
            tasks.append(
                provider.get_perspective(
                    perspective_id=p_id,
                    anonymized_label=anonymized,
                    prompt=prompt,
                    system_instruction=system_instruction,
                )
            )

        results = await asyncio.gather(*tasks, return_exceptions=True)
        perspectives: List[CouncilPerspective] = []

        for idx, res in enumerate(results):
            if isinstance(res, Exception):
                provider = self._providers[idx]
                perspectives.append(
                    CouncilPerspective(
                        perspective_id=f"perspective_{chr(97 + idx)}",
                        anonymized_label=f"Perspective {chr(65 + idx)}",
                        model_name=provider.model_name,
                        provider=provider.provider_type,
                        content="",
                        latency_ms=0.0,
                        is_successful=False,
                        error=str(res),
                    )
                )
            else:
                perspectives.append(res)

        return perspectives
