"""Unified AI & Voice Dictation Gateway (AIAgent).

Enforces the Unified Interface / Adapter Pattern:
- Absolute abstraction from provider-specific SDKs.
- Internal speech sanitization and diagnostics (Web, iOS, Android).
- Dynamic provider and model swapping on the fly.
"""

import logging
from typing import Optional, Dict, Any, Union
from pydantic import BaseModel, Field

from metta_core.gateway.interfaces import BaseAIProvider, VoiceDiagnostics, AgentSettings
from metta_core.gateway.diagnostics import VoiceSanitizer
from metta_core.gateway.adapters.gemini_adapter import GeminiAntigravityAdapter
from metta_core.gateway.adapters.local_adapter import LocalLLMAdapter
from metta_core.engine import MettaEngine
from metta_core.precepts.rules import FIVE_PRECEPTS_GUIDELINES

logger = logging.getLogger("metta.gateway.agent")


class UnifiedResponse(BaseModel):
    """Normalized response payload across all client platforms."""

    response_text: str
    diagnostics: Optional[VoiceDiagnostics] = None
    evaluation: Dict[str, Any]
    observation: Optional[Dict[str, Any]] = None
    graph_match: Optional[Dict[str, Any]] = None
    duration_seconds: float
    system_one_used: bool = False
    provider: str
    model: str


class AIAgent:
    """The central Unified AI Gateway coordinating model drivers, speech sanitization, and wisdom flow."""

    def __init__(
        self,
        default_provider: str = "gemini",
        default_model: str = "gemini-3.8-flash-high",
        typesafe_api_key: Optional[str] = None,
    ):
        self._providers: Dict[str, BaseAIProvider] = {
            "gemini": GeminiAntigravityAdapter(model=default_model),
            "local_llm": LocalLLMAdapter(model="gemma-4-E4B-it"),
            "open_source": LocalLLMAdapter(model="meta-llama-3"),
        }

        self._active_provider_name = default_provider
        if self._active_provider_name not in self._providers:
            self._active_provider_name = "gemini"

        self._active_provider = self._providers[self._active_provider_name]
        self._typesafe_key = typesafe_api_key

        # Re-initialize Metta core engine with the active provider adapter
        self._init_engine()

    def _init_engine(self):
        """Bind active provider adapter to Metta engine."""
        self._engine = MettaEngine(
            provider=self._active_provider,
            typesafe_api_key=self._typesafe_key,
        )

    def set_provider(self, provider_name: str, model: Optional[str] = None) -> AgentSettings:
        """Dynamically swap underlying provider and model without restart."""
        name = provider_name.lower().strip()
        if name not in self._providers:
            raise ValueError(f"Unknown provider: '{name}'. Available: {list(self._providers.keys())}")

        self._active_provider_name = name
        self._active_provider = self._providers[name]

        if model:
            self._active_provider.set_model(model)

        self._init_engine()
        logger.info("Swapped active provider to '%s' (model: '%s')", name, self._active_provider.model_name)
        return self.get_settings()

    def get_settings(self) -> AgentSettings:
        """Return runtime state and active configurations."""
        return AgentSettings(
            active_provider=self._active_provider_name,
            available_providers=list(self._providers.keys()),
            model=self._active_provider.model_name,
            system_one_active=self._engine.jev_engine.is_available,
            system_one_provider="jev",
            voice_diagnostics_enabled=True,
        )

    def get_graph(self) -> Dict[str, Any]:
        """Expose topological Principle Knowledge Graph nodes and edges."""
        nodes = []
        edges = []

        for cond_id, cond in self._engine.graph_store.conditions.items():
            nodes.append({
                "id": cond.id,
                "name": cond.name,
                "type": "condition",
                "category": cond.category,
                "underlying_illusion": cond.underlying_illusion,
                "keywords": cond.keywords,
            })

        for equa_id, equa in self._engine.graph_store.equanimities.items():
            nodes.append({
                "id": equa.id,
                "name": equa.name,
                "type": "equanimity",
                "description": equa.description,
            })

        for key, path in self._engine.graph_store.paths.items():
            edges.append({
                "id": key,
                "source": path.from_condition,
                "target": path.to_equanimity,
                "principle": path.principle,
                "reframe": path.reframe,
                "immediate_action": path.immediate_action,
                "sutta_reference": path.sutta_reference,
                "suttacentral_url": getattr(path, "suttacentral_url", None),
                "accesstoinsight_url": getattr(path, "accesstoinsight_url", None),
            })

        return {"nodes": nodes, "edges": edges}

    def get_precepts(self) -> Dict[str, Any]:
        """Return canonical Five Precepts rules."""
        return FIVE_PRECEPTS_GUIDELINES

    async def meditate(self) -> Dict[str, Any]:
        """Trigger subtractive unlearning audit."""
        report = await self._engine.meditate()
        return report.model_dump()

    async def ask(
        self,
        payload: Union[str, Dict[str, Any]],
        source: str = "text",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> UnifiedResponse:
        """Singular execution gateway accepting raw text or voice dictation streams.

        Args:
            payload: Raw text string or dictionary payload from client.
            source: Source channel ('text', 'voice', 'mobile_stream').
            metadata: Optional client-side metadata (e.g. device, sample rate).
        """
        raw_text = payload if isinstance(payload, str) else payload.get("text", "")

        # -------------------------------------------------------------
        # 1. Run Internal Diagnostics for Voice Dictation
        # -------------------------------------------------------------
        diagnostics = None
        if source in ["voice", "mobile_stream", "dictation"]:
            diagnostics = VoiceSanitizer.run_diagnostics(raw_text)
            if diagnostics.is_empty_or_pure_noise:
                return UnifiedResponse(
                    response_text="I heard a faint sound or whisper, but the words did not take form. Whenever you are ready to speak, I am here listening with a quiet heart.",
                    diagnostics=diagnostics,
                    evaluation={"passed": True, "violations": [], "requires_silence": False},
                    observation=None,
                    graph_match=None,
                    duration_seconds=0.05,
                    system_one_used=False,
                    provider=self._active_provider_name,
                    model=self._active_provider.model_name,
                )
            clean_text = diagnostics.sanitized_input
        else:
            clean_text = raw_text.strip()

        # -------------------------------------------------------------
        # 2. Execute Through Metta 5-Layer Cognitive Pipeline
        # -------------------------------------------------------------
        res = await self._engine.interact(clean_text)

        return UnifiedResponse(
            response_text=res.response_text,
            diagnostics=diagnostics,
            evaluation=res.evaluation.model_dump(),
            observation=res.observation.model_dump() if res.observation else None,
            graph_match=res.graph_match.model_dump() if res.graph_match else None,
            duration_seconds=res.duration_seconds,
            system_one_used=res.system_one_used,
            provider=self._active_provider_name,
            model=self._active_provider.model_name,
        )
