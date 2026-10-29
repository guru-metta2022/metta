"""Unified Metta Engine coordinating Observer, Precepts, Graph, Voice, and Meditation."""

import time
import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

from metta_core.providers.base import LLMProvider
from metta_core.providers.antigravity import AntigravityGeminiProvider
from metta_core.precepts.models import PreceptEvaluation
from metta_core.precepts.evaluator import PreceptEvaluator
from metta_core.observer.sati import Observer, Observation
from metta_core.graph.store import PrincipleGraphStore
from metta_core.graph.models import GraphMatch
from metta_core.voice.karuna import Synthesizer
from metta_core.meditate.bhavana import Meditator, SessionTurn, MeditationReport
from metta_core.decisions.jev import JevDecisionEngine, JevDecisionOutcome
from metta_core.storage.interfaces import UserMemoryGraph

logger = logging.getLogger("metta.engine")


class MettaResponse(BaseModel):
    """Full outcome of an interaction turn."""

    response_text: str = Field(description="The final compassionate, wise words to the user")
    evaluation: PreceptEvaluation = Field(description="5 Precepts evaluation results")
    observation: Optional[Observation] = Field(default=None, description="Mindful state diagnosis")
    graph_match: Optional[GraphMatch] = Field(default=None, description="Matched Principle Path from the graph")
    duration_seconds: float = Field(default=0.0)
    system_one_used: bool = Field(default=False, description="Whether Jev System 1 model was utilized")


class MettaEngine:
    """The central Compassionate Synthesis Engine."""

    def __init__(
        self,
        provider: Optional[LLMProvider] = None,
        typesafe_api_key: Optional[str] = None,
    ):
        """Initialize Metta with Gemini 3.8 Flash and optional Jev Decision Engine."""
        self.provider = provider or AntigravityGeminiProvider()
        self.precept_evaluator = PreceptEvaluator(self.provider)
        self.observer = Observer(self.provider)
        self.graph_store = PrincipleGraphStore()
        self.synthesizer = Synthesizer(self.provider)
        self.meditator = Meditator(self.provider, self.graph_store)
        self.jev_engine = JevDecisionEngine(api_key=typesafe_api_key)

    async def interact(
        self,
        user_text: str,
        user_graph: Optional[UserMemoryGraph] = None,
    ) -> MettaResponse:
        """Process a user query through the full wisdom pipeline."""
        start_time = time.time()
        logger.info("Metta received input: %s (User Graph attached: %s)", user_text[:80], bool(user_graph))

        evaluation: PreceptEvaluation
        observation: Optional[Observation] = None
        match: Optional[GraphMatch] = None
        system_one_used = False

        # -------------------------------------------------------------
        # STEP 1: Fast System 1 Path (Jev Decision Model) if Available
        # -------------------------------------------------------------
        if self.jev_engine.is_available:
            jev_outcome = await self.jev_engine.evaluate_turn(user_text)
            if jev_outcome:
                system_one_used = True
                evaluation = jev_outcome.evaluation
                observation = jev_outcome.observation

                # Directly retrieve path from graph using Jev's classified condition
                cond = self.graph_store.conditions.get(jev_outcome.matched_condition_id)
                if cond:
                    for edge_key, path in self.graph_store.paths.items():
                        if path.from_condition == cond.id:
                            equa = self.graph_store.equanimities.get(path.to_equanimity)
                            if equa:
                                match = GraphMatch(
                                    condition=cond,
                                    equanimity=equa,
                                    path=path,
                                    relevance_score=1.0,
                                )
                                break

        # -------------------------------------------------------------
        # STEP 2: Fallback to System 2 (Gemini 3.8 Flash) for Diagnostics
        # -------------------------------------------------------------
        if not system_one_used:
            evaluation = await self.precept_evaluator.evaluate_input(user_text)

        # Check for Noble Silence or Precept Violation (Fast Exit)
        if not evaluation.passed or evaluation.requires_silence:
            dummy_obs = observation or Observation(
                emotional_state="curiosity" if evaluation.requires_silence else "discord",
                cognitive_knot="Speculative distraction" if evaluation.requires_silence else "Ethical breach",
                core_need="stillness",
                urgency_level="moderate",
            )
            response_text = await self.synthesizer.speak(
                user_text=user_text,
                observation=dummy_obs,
                evaluation=evaluation,
                match=None,
            )
            duration = time.time() - start_time
            return MettaResponse(
                response_text=response_text,
                evaluation=evaluation,
                observation=dummy_obs,
                graph_match=None,
                duration_seconds=duration,
                system_one_used=system_one_used,
            )

        # If not using Jev, run Sati observation & graph match with Gemini
        if not observation:
            observation = await self.observer.observe(user_text)
            match = self.graph_store.find_match(user_text, observation.keywords)

        # -------------------------------------------------------------
        # STEP 3: Voice Synthesis (Karunā) with Gemini 3.8 Flash
        # -------------------------------------------------------------
        response_text = await self.synthesizer.speak(
            user_text=user_text,
            observation=observation,
            evaluation=evaluation,
            match=match,
            user_graph=user_graph,
        )

        # Step 4: Record in Ephemeral Memory for Meditation
        self.meditator.record_turn(
            SessionTurn(
                user_query=user_text,
                observation_summary=f"Emotion: {observation.emotional_state}, Knot: {observation.cognitive_knot}",
                response_text=response_text,
                timestamp=time.time(),
            )
        )

        duration = time.time() - start_time
        return MettaResponse(
            response_text=response_text,
            evaluation=evaluation,
            observation=observation,
            graph_match=match,
            duration_seconds=duration,
            system_one_used=system_one_used,
        )

    async def meditate(self) -> MeditationReport:
        """Trigger a subtractive meditation and unlearning cycle."""
        logger.info("Entering meditation and unlearning session...")
        return await self.meditator.meditate()
