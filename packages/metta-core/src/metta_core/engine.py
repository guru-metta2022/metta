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

logger = logging.getLogger("metta.engine")


class MettaResponse(BaseModel):
    """Full outcome of an interaction turn."""

    response_text: str = Field(description="The final compassionate, wise words to the user")
    evaluation: PreceptEvaluation = Field(description="5 Precepts evaluation results")
    observation: Optional[Observation] = Field(default=None, description="Mindful state diagnosis")
    graph_match: Optional[GraphMatch] = Field(default=None, description="Matched Principle Path from the graph")
    duration_seconds: float = Field(default=0.0)


class MettaEngine:
    """The central Compassionate Synthesis Engine."""

    def __init__(self, provider: Optional[LLMProvider] = None):
        """Initialize Metta with Gemini 3.8 Flash via Antigravity API by default."""
        self.provider = provider or AntigravityGeminiProvider()
        self.precept_evaluator = PreceptEvaluator(self.provider)
        self.observer = Observer(self.provider)
        self.graph_store = PrincipleGraphStore()
        self.synthesizer = Synthesizer(self.provider)
        self.meditator = Meditator(self.provider, self.graph_store)

    async def interact(self, user_text: str) -> MettaResponse:
        """Process a user query through the full wisdom pipeline."""
        start_time = time.time()
        logger.info("Metta received input: %s", user_text[:80])

        # Step 1: Precepts & Noble Silence Evaluation
        evaluation = await self.precept_evaluator.evaluate_input(user_text)

        # Step 2: If ethical violation or pure speculative distraction, speak immediately
        if not evaluation.passed or evaluation.requires_silence:
            # Create a minimal default observation
            dummy_obs = Observation(
                emotional_state="curiosity" if evaluation.requires_silence else "discord",
                cognitive_knot="Speculative distraction" if evaluation.requires_silence else "Ethical breach",
                core_need="stillness",
                urgency_level="moderate"
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
            )

        # Step 3: Mindful Observation (Sati)
        observation = await self.observer.observe(user_text)

        # Step 4: Topological Graph Traversal (Dhamma)
        match = self.graph_store.find_match(user_text, observation.keywords)

        # Step 5: Compassionate Synthesis (Karunā)
        response_text = await self.synthesizer.speak(
            user_text=user_text,
            observation=observation,
            evaluation=evaluation,
            match=match,
        )

        # Step 6: Record in Ephemeral Memory for Meditation
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
        )

    async def meditate(self) -> MeditationReport:
        """Trigger a subtractive meditation and unlearning cycle."""
        logger.info("Entering meditation and unlearning session...")
        return await self.meditator.meditate()
