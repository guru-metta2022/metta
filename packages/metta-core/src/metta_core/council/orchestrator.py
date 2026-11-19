"""Central Orchestrator for Metta Council & Deliberation Protocol."""

import time
import logging
from typing import Optional, List, Dict, Any

from metta_core.council.models import (
    ModelTarget,
    CouncilPerspective,
    DisagreementMatrix,
    TransformativeGuidance,
    CouncilResult,
)
from metta_core.council.providers import CouncilProviderPool, BaseCouncilModelProvider
from metta_core.council.detector import DisagreementDetector
from metta_core.council.transformative import TransformativeReframer
from metta_core.council.synthesizer import CouncilSynthesizer
from metta_core.providers.base import LLMProvider

logger = logging.getLogger("metta.council.orchestrator")


class CouncilOrchestrator:
    """Coordinates multi-model consultation, dialectical tension detection, transformative guidance, and decision review."""

    def __init__(
        self,
        targets: Optional[List[ModelTarget]] = None,
        evaluator_provider: Optional[LLMProvider] = None,
        decision_agent: Optional[Any] = None,
        min_quorum: int = 2,
    ):
        """Initialize the Council Orchestrator.

        Args:
            targets: Configured list of model targets to consult. If None, uses default presets.
            evaluator_provider: Generative LLM provider used for disagreement detection and synthesis.
            decision_agent: Optional instance of AIAgent for Decision Layer evaluations.
            min_quorum: Minimum count of successful model perspectives required to form a valid council.
        """
        self.provider_pool = CouncilProviderPool(targets=targets)
        self.evaluator_provider = evaluator_provider
        self.decision_agent = decision_agent
        self.min_quorum = min_quorum

        self.detector = DisagreementDetector(evaluator_provider=self.evaluator_provider)
        self.transformative = TransformativeReframer(provider=self.evaluator_provider)
        self.synthesizer = CouncilSynthesizer(provider=self.evaluator_provider)

    async def deliberate(
        self,
        query: str,
        context: Optional[str] = None,
        evaluate_decision: bool = False,
        custom_targets: Optional[List[ModelTarget]] = None,
    ) -> CouncilResult:
        """Run an end-to-end multi-model deliberation pipeline.

        Args:
            query: Problem, dilemma, or proposed action to deliberate.
            context: Surrounding environmental or operational context.
            evaluate_decision: If True, hands off synthesis to Metta Decision Layer (YES/NO/CAUTION).
            custom_targets: Optional override of model participants for this turn.
        """
        start_time = time.perf_counter()
        pool = CouncilProviderPool(targets=custom_targets) if custom_targets else self.provider_pool

        # -------------------------------------------------------------
        # STEP 1: Parallel Model Consultation
        # -------------------------------------------------------------
        system_instruction = (
            "You are participating in the Metta Council of diverse intelligence. "
            "Analyze the following query independently, highlighting core assumptions, direct and indirect trade-offs, "
            "systemic risks, and constructive next steps. Speak with rigor, clarity, and intellectual honesty."
        )
        full_prompt = f"Context: {context}\n\nQuery/Proposal: {query}" if context else query

        perspectives = await pool.collect_perspectives(
            prompt=full_prompt,
            system_instruction=system_instruction,
        )

        successful_perspectives = [p for p in perspectives if p.is_successful]
        quorum_met = len(successful_perspectives) >= self.min_quorum

        # -------------------------------------------------------------
        # STEP 2: Dialectical Tension & Disagreement Detection
        # -------------------------------------------------------------
        matrix: DisagreementMatrix
        if quorum_met:
            matrix = await self.detector.detect_disagreements(
                query=query,
                perspectives=successful_perspectives,
                context=context,
            )
        else:
            matrix = DisagreementMatrix(
                consensus_points=[],
                tensions_and_disagreements=[],
                lone_blind_spots=[],
                unresolved_uncertainties=[
                    f"Council quorum failure: Only {len(successful_perspectives)} of {len(perspectives)} models responded. Minimum quorum is {self.min_quorum}."
                ],
            )

        # -------------------------------------------------------------
        # STEP 3: Transformative Guidance Check (Ethical Alchemy)
        # -------------------------------------------------------------
        transformative_guidance: Optional[TransformativeGuidance] = None
        try:
            transformative_guidance = await self.transformative.evaluate_and_transform(
                proposal=query,
                context=context,
            )
        except Exception as exc:
            logger.warning("Transformative guidance check encountered error: %s", exc)

        # -------------------------------------------------------------
        # STEP 4: Independent Synthesis
        # -------------------------------------------------------------
        synthesis: str
        if quorum_met:
            synthesis = await self.synthesizer.synthesize(
                query=query,
                perspectives=successful_perspectives,
                matrix=matrix,
                context=context,
            )
        else:
            synthesis = (
                f"Metta Council could not establish deliberation quorum ({len(successful_perspectives)}/{len(perspectives)} responded). "
                f"Please verify model endpoint availability or retry with responsive providers."
            )

        # -------------------------------------------------------------
        # STEP 5: Optional Metta Decision Layer Handoff
        # -------------------------------------------------------------
        decision_review: Optional[Dict[str, Any]] = None
        if evaluate_decision:
            if self.decision_agent:
                try:
                    decision_review = await self.decision_agent.guardrail(
                        proposal=query,
                        context=f"Context: {context}\nCouncil Synthesis: {synthesis[:500]}",
                        verbose=True,
                    )
                except Exception as exc:
                    logger.error("Decision layer handoff failed: %s", exc, exc_info=True)
                    decision_review = {
                        "decision": "CAUTION",
                        "allow": False,
                        "evaluation_status": "uncertain",
                        "reason": f"Decision layer handoff encountered error: {exc}",
                    }
            else:
                decision_review = {
                    "decision": "CAUTION",
                    "allow": False,
                    "evaluation_status": "uncertain",
                    "reason": "Decision Agent not bound to Council Orchestrator. Pause action and request human sign-off.",
                }

        duration_ms = (time.perf_counter() - start_time) * 1000.0

        return CouncilResult(
            query=query,
            context=context,
            quorum_met=quorum_met,
            perspectives_count=len(perspectives),
            successful_perspectives=len(successful_perspectives),
            perspectives=perspectives,
            disagreement_matrix=matrix,
            consolidated_synthesis=synthesis,
            transformative_guidance=transformative_guidance,
            decision_review=decision_review,
            deliberation_duration_ms=round(duration_ms, 2),
        )
