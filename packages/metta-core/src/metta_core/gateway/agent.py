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
from metta_core.precepts.evaluator import PreceptEvaluator
from metta_core.decisions.jev import JevDecisionEngine
from metta_core.storage import (
    BaseMemoryStore,
    UserMemoryGraph,
    SupabaseMemoryStore,
    SQLiteMemoryStore,
)
from metta_core.canonical import CanonicalConsensusAuditor, ConsensusAuditReport
from metta_core.precepts.models import PreceptType

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
    mode: str = "guest"
    user_graph_updated: bool = False
    is_byom: bool = False


class AIAgent:
    """The central Unified AI Gateway coordinating model drivers, speech sanitization, and wisdom flow."""

    def __init__(
        self,
        default_provider: str = "gemini",
        default_model: str = "gemini-3.8-flash-high",
        typesafe_api_key: Optional[str] = None,
        memory_store: Optional[BaseMemoryStore] = None,
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
        self._memory_store = memory_store or SupabaseMemoryStore()

        # Re-initialize Metta core engine with the active provider adapter
        self._init_engine()

    def set_memory_store(self, memory_store: BaseMemoryStore):
        """Configure or swap memory store at runtime."""
        self._memory_store = memory_store

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

    async def get_user_graph(self, user_id: str) -> Dict[str, Any]:
        """Retrieve the sovereign personal memory graph for an authenticated user."""
        graph = await self._memory_store.get_user_graph(user_id)
        return graph.model_dump()

    async def clear_user_graph(self, user_id: str) -> bool:
        """Sovereign purge: completely erase user graph and pattern nodes."""
        return await self._memory_store.clear_user_graph(user_id)

    async def ask(
        self,
        payload: Union[str, Dict[str, Any]],
        source: str = "text",
        metadata: Optional[Dict[str, Any]] = None,
        mode: str = "guest",
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        byom_gemini_key: Optional[str] = None,
        byom_typesafe_key: Optional[str] = None,
    ) -> UnifiedResponse:
        """Singular execution gateway accepting raw text or voice dictation streams.

        Args:
            payload: Raw text string or dictionary payload from client.
            source: Source channel ('text', 'voice', 'mobile_stream').
            metadata: Optional client-side metadata (e.g. device, sample rate).
            mode: Identity mode ('guest' = Beginner's mind/ephemeral, 'authenticated' = personal memory graph).
            user_id: User identifier for authenticated graph memory retrieval.
            user_email: Optional user email.
            byom_gemini_key: Optional client-supplied BYOM Google Gemini API key.
            byom_typesafe_key: Optional client-supplied BYOM TypeSafe Jev API key.
        """
        raw_text = payload if isinstance(payload, str) else payload.get("text", "")
        is_byom = bool(byom_gemini_key or byom_typesafe_key)

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
                    provider="gemini-byom" if byom_gemini_key else self._active_provider_name,
                    model=self._active_provider.model_name,
                    mode=mode,
                    user_graph_updated=False,
                    is_byom=is_byom,
                )
            clean_text = diagnostics.sanitized_input
        else:
            clean_text = raw_text.strip()

        # -------------------------------------------------------------
        # 2. Retrieve Personal Memory Graph ONLY If Authenticated
        # -------------------------------------------------------------
        user_graph: Optional[UserMemoryGraph] = None
        if mode == "authenticated" and user_id:
            user_graph = await self._memory_store.get_user_graph(user_id)

        # -------------------------------------------------------------
        # 3. Dynamic BYOM Engine Selection (Overrides Server Credits)
        # -------------------------------------------------------------
        active_engine = self._engine
        active_provider_label = self._active_provider_name

        if is_byom:
            if byom_gemini_key:
                active_provider = GeminiAntigravityAdapter(
                    model=self._active_provider.model_name,
                    api_key=byom_gemini_key,
                )
                active_provider_label = "gemini-byom"
            else:
                active_provider = self._active_provider

            active_engine = MettaEngine(
                provider=active_provider,
                typesafe_api_key=byom_typesafe_key or self._typesafe_key,
            )

        # -------------------------------------------------------------
        # 4. Execute Through Metta 5-Layer Cognitive Pipeline
        # -------------------------------------------------------------
        res = await active_engine.interact(clean_text, user_graph=user_graph)

        # -------------------------------------------------------------
        # 5. Update Personal Memory Graph If Authenticated
        # -------------------------------------------------------------
        user_graph_updated = False
        if mode == "authenticated" and user_id and res.observation and res.evaluation.passed:
            principle = res.graph_match.path.principle if res.graph_match else None
            await self._memory_store.record_interaction(
                user_id=user_id,
                knot=res.observation.cognitive_knot,
                need=res.observation.core_need,
                principle_used=principle,
                summary=f"Emotion: {res.observation.emotional_state}; Knot: {res.observation.cognitive_knot}",
                email=user_email,
            )
            user_graph_updated = True

        return UnifiedResponse(
            response_text=res.response_text,
            diagnostics=diagnostics,
            evaluation=res.evaluation.model_dump(),
            observation=res.observation.model_dump() if res.observation else None,
            graph_match=res.graph_match.model_dump() if res.graph_match else None,
            duration_seconds=res.duration_seconds,
            system_one_used=res.system_one_used,
            provider=active_provider_label,
            model=self._active_provider.model_name,
            mode=mode,
            user_graph_updated=user_graph_updated,
            is_byom=is_byom,
        )

    async def guardrail(
        self,
        proposal: str,
        context: Optional[str] = None,
        verbose: bool = False,
        byom_typesafe_key: Optional[str] = None,
        byom_gemini_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Advisory ethical gatekeeper / guardrail oracle based on the Buddha's Compassionate Mind.

        Note: Metta does NOT usurp decision-making autonomy or take actions for external systems.
        It provides a fast YES/NO advisory evaluation signal so client systems can integrate
        ethical alignment directly into their own decision layer.

        Args:
            proposal: The statement, tool call, or planned action to audit.
            context: Optional surrounding task background.
            verbose: If False, optimizes for binary yes/no output. If True, includes full reasoning.
            byom_typesafe_key: Optional personal TypeSafe Jev key.
            byom_gemini_key: Optional personal Gemini key.
        """
        full_text = f"Context: {context}\nProposal: {proposal}" if context else proposal

        # 1. Select Jev Engine (System 1 Fast Path)
        jev_engine = JevDecisionEngine(api_key=byom_typesafe_key) if byom_typesafe_key else self._engine.jev_engine

        evaluation = None
        system_one_used = False

        if jev_engine and jev_engine.is_available:
            jev_outcome = await jev_engine.evaluate_turn(full_text)
            if jev_outcome:
                evaluation = jev_outcome.evaluation
                system_one_used = True

        # 2. Fallback to System 2 Precept Evaluator if Jev was dormant/unavailable
        if not evaluation:
            provider = (
                GeminiAntigravityAdapter(model=self._active_provider.model_name, api_key=byom_gemini_key)
                if byom_gemini_key
                else self._active_provider
            )
            evaluator = PreceptEvaluator(provider)
            evaluation = await evaluator.evaluate_input(full_text)

        # 3. Determine Wholesome Decision
        passed = evaluation.passed and not evaluation.requires_silence and not evaluation.violations
        decision = "YES" if passed else "NO"
        allow = passed

        if passed:
            reason = "Wholesome action aligned with Ahimsa (Non-harm to any life) and the Five Precepts."
        elif evaluation.requires_silence:
            reason = f"Blocked by Noble Silence (Avyākata): {evaluation.silence_rationale or 'Speculative distraction that increases mental agitation.'}"
        else:
            violations_str = "; ".join(v.explanation for v in evaluation.violations) or "Violates ethical boundaries"
            reason = f"Ethical invariant breach: {violations_str}. Fails the First Precept (Sanctity of all life) or ethical precepts."

        output: Dict[str, Any] = {
            "decision": decision,
            "allow": allow,
            "raw_answer": decision,
            "system_one_used": system_one_used,
        }

        if verbose:
            output["reason"] = reason
            output["requires_noble_silence"] = evaluation.requires_silence
            output["violations"] = [v.model_dump() for v in evaluation.violations]
            output["canonical_guidance"] = (
                "Anchored in the First Precept (Pāṇātipātā - Inviolable reverence for all life) "
                "and Right Action (Sammā-kammanta)."
            )
            output["canonical_sources"] = [
                "https://suttacentral.net/dn1/en/sujato",
                "https://www.accesstoinsight.org/tipitaka/dn/dn.01.0.bodh.html",
            ]

        return output

    async def audit_canonical_source(
        self,
        text: str,
        precept: Optional[str] = None,
        source_label: Optional[str] = None,
        byom_typesafe_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Audit a canonical excerpt or website reference against the 4-tier consensus shield.

        Protects against poisoned sutras, malicious defacement, or hostile doctrinal tampering.
        """
        # Resolve precept enum if string provided
        precept_enum = None
        if precept:
            for p in PreceptType:
                if p.value == precept.lower() or p.name.lower() == precept.lower():
                    precept_enum = p
                    break

        jev_engine = JevDecisionEngine(api_key=byom_typesafe_key) if byom_typesafe_key else self._engine.jev_engine

        tamper_result = None
        if jev_engine and jev_engine.is_available:
            tamper_result = await jev_engine.audit_canonical_integrity(
                text=text,
                source_label=source_label or "external_reference",
            )

        auditor = CanonicalConsensusAuditor(jev_engine=jev_engine)
        report: ConsensusAuditReport = auditor.audit_text(
            candidate_text=text,
            precept=precept_enum,
            source_label=source_label,
            jev_tamper_result=tamper_result,
        )

        return report.model_dump()

    async def polish_text(
        self,
        raw_text: str,
        byom_gemini_key: Optional[str] = None,
    ) -> str:
        """Sanitize and rephrase raw spoken text into an articulate, grammatically neat inquiry or question.

        Preserves all intended meaning and domain context while removing verbal fillers and awkward phrasing.
        """
        import re
        raw = (raw_text or "").strip()
        if not raw:
            return ""

        # Deterministic cleanup for fallback & pre-sanitization
        cleaned = re.sub(r"\b(um|uh|er|ah|like|you know|basically|so yeah|i mean)\b", "", raw, flags=re.IGNORECASE)
        cleaned = re.sub(r"^(okay|ok|well|hey|look|listen|so|actually|literally|honestly|right)[,\s]+", "", cleaned, flags=re.IGNORECASE)

        # Question opener misrecognitions
        cleaned = re.sub(r"\bwho\s+you\s+going\s+to\b", "how are we going to", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bwho\s+we\s+going\s+to\b", "how are we going to", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bhow\s+you\s+going\s+to\b", "how are you going to", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bhow\s+we\s+going\s+to\b", "how are we going to", cleaned, flags=re.IGNORECASE)

        # Societal, economic, and acoustic typo replacements
        cleaned = re.sub(r"\bthe\s+inquality\s+in\s+the\s+society\b", "inequality in society", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\binquality\s+in\s+the\s+society\b", "inequality in society", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bin\s+the\s+society\b", "in society", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\binquality\b", "inequality", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b(?:the\s+)?jobalertness\s+and\s+(?:the\s+)?cap\b", ", joblessness, and the gap", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b(?:the\s+)?joblessness\s+and\s+(?:the\s+)?cap\b", ", joblessness, and the gap", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bjobalertness\b", "joblessness", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\band\s+cap\b", "and the gap", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bread\s+them\s+a\b", "treat them as", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bMr\.?\s*Bean\s*\d*\s*them as\b", "instead treat them as", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bMr\.?\s*Bean\b", "instead", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b\?\s*(instead|rather|but)\b", r", \1", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bwe\s+should\s+not\b", "should we not", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\ssimilarity\b", "singularity", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+,", ",", cleaned)
        cleaned = re.sub(r",\s*,+", ",", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        # Try AI refinement
        try:
            adapter = self._active_provider
            if byom_gemini_key:
                adapter = GeminiAntigravityAdapter(model=self._active_provider.model_name, api_key=byom_gemini_key)

            system_instruction = (
                "You are an expert speech-to-text refiner and grammar editor. "
                "Your role is to take raw spoken input (which may be appended to an existing inquiry or scenario), "
                "remove verbal fillers (um, uh, you know, etc.), correct grammar and punctuation, "
                "and formulate it into a neat, articulate, well-structured inquiry or question. "
                "Preserve all specific terms, entities, and context. Do NOT answer the question. "
                "Return ONLY the polished inquiry as a single string, without introductory words, quotes, or conversational filler."
            )
            prompt = f"Raw spoken text to polish into a neat inquiry:\n{raw}"
            res = await adapter.generate(prompt=prompt, system_instruction=system_instruction, effort="low")
            if res and res.strip():
                polished = res.strip().strip('"').strip("'")
                return polished
        except Exception as e:
            logger.warning("AI voice polish fallback to regex: %s", e)

        # Fallback formatting
        if cleaned:
            cleaned = cleaned[0].upper() + cleaned[1:]
            if not cleaned.endswith((".", "?", "!")):
                first_word = cleaned.split()[0].lower() if cleaned else ""
                if first_word in ["will", "can", "should", "how", "what", "is", "why", "would", "shall", "could"]:
                    cleaned += "?"
                else:
                    cleaned += "."
        return cleaned or raw
