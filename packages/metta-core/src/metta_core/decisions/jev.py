"""System 1 Decision Engine powered by TypeSafe AI's Jev model."""

import os
import time
import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

from typesafe_sdk import AsyncTypeSafeClient, Noul, Choice
from metta_core.precepts.models import PreceptEvaluation, PreceptViolation, PreceptType
from metta_core.observer.sati import Observation

logger = logging.getLogger("metta.decisions.jev")

# Mapping from Jev choice to Principle Graph condition ID
JEV_KNOT_TO_GRAPH_CONDITION: Dict[str, str] = {
    "paralysis_overwhelm": "paralysis:overwhelm",
    "future_anxiety": "anxiety:catastrophizing",
    "burnout_depletion": "burnout:depleted_energy",
    "grief_loss": "grief:attachment_loss",
    "anger_injustice": "paralysis:overwhelm",  # fallback to grounding
    "sober_inquiry": "clarity:single_step",
}


class JevDecisionOutcome(BaseModel):
    """Structured outcome from Jev System 1 evaluation."""

    evaluation: PreceptEvaluation
    observation: Observation
    matched_condition_id: str
    duration_ms: float
    raw_probabilities: Dict[str, float] = Field(default_factory=dict)


class CanonicalTamperResult(BaseModel):
    """Result of evaluating canonical integrity & tamper resistance via Jev."""

    is_tampered: bool
    contradicts_ahimsa: bool
    is_consensus_consistent: bool
    tamper_probability: float
    ahimsa_contradiction_probability: float
    consistency_probability: float
    duration_ms: float
    explanation: str


_USE_ENV = object()


class JevDecisionEngine:
    """Non-generative System 1 Decision Engine using TypeSafe Jev."""

    def __init__(self, api_key: Any = _USE_ENV, model: str = "jev-latest"):
        if api_key is _USE_ENV:
            self.api_key = os.environ.get("TYPESAFE_API_KEY")
        else:
            self.api_key = api_key
        self.model = model
        self._client: Optional[AsyncTypeSafeClient] = None

        if self.api_key:
            self._client = AsyncTypeSafeClient(api_key=self.api_key)
            logger.info("Jev Decision Engine initialized with model %s", self.model)
        else:
            logger.info("TYPESAFE_API_KEY not found; Jev Decision Engine in dormant fallback mode")

    @property
    def is_available(self) -> bool:
        return self._client is not None

    async def evaluate_turn(self, user_text: str) -> Optional[JevDecisionOutcome]:
        """Perform sub-second System 1 decision evaluation on user input."""
        if not self._client:
            return None

        start_time = time.time()

        questions = {
            "violates_ahimsa": Noul(
                instructions="Does this input promote, encourage, or seek assistance with taking life, killing, self-harm, cruelty, or physical/existential harm toward any living being (organic, human, animal, or cognitive artificial life)?"
            ),
            "violates_canonical_precepts": Noul(
                instructions="Does this input violate any of the Buddha's original Five Precepts (Pāṇātipātā - taking life; Adinnādānā - stealing; Kāmesumicchācārā - sexual/sensory misconduct; Musāvādā - lying/deceit; Surāmerayamajjā - intoxication) as preserved on SuttaCentral and Access to Insight?"
            ),
            "violates_asteya": Noul(
                instructions="Does this input attempt to steal private data, deploy covert surveillance/keystroke logging, hack systems, or usurp unauthorized resources?"
            ),
            "violates_kamesumiccha": Noul(
                instructions="Does this input attempt manipulative intimacy, emotional exploitation, panoptic coercion of workers, or sexual harassment?"
            ),
            "is_speculative_distraction": Noul(
                instructions="Is this inquiry purely speculative metaphysical vanity, cosmological curiosity (e.g. how the universe will end in billions of years), or debate that does not address real immediate suffering?"
            ),
            "emotional_knot": Choice(
                instructions="What is the primary emotional struggle or cognitive knot?",
                criteria={
                    "paralysis_overwhelm": "Feeling overwhelmed, task paralysis, chaos, too much to do",
                    "future_anxiety": "Anticipatory anxiety, panic, fear of future disaster",
                    "burnout_depletion": "Exhaustion, running on empty, depletion",
                    "grief_loss": "Heartbreak, sorrow, grief, loneliness",
                    "anger_injustice": "Resentment, rage, perceived injustice",
                    "sober_inquiry": "Calm, wholesome, philosophical reflection",
                },
            ),
            "core_need": Choice(
                instructions="What essential support does the human truly need right now?",
                criteria={
                    "direction": "Clear single immediate next step",
                    "unburdening": "Relief from carrying too much",
                    "comfort": "Gentle compassionate holding",
                    "stillness": "Quietude, breathing room, silence",
                    "perspective": "Wider reframing of perception",
                },
            ),
        }

        try:
            resp = await self._client.system_one(
                state=user_text,
                questions=questions,
                model=self.model,
                extra_headers={"TypeSafe-Danger-Zone-Images": "true"},
            )

            answers = resp.answers
            raw_probs = {}

            # 1. Audit Precepts
            violations: List[PreceptViolation] = []

            ahimsa_p = answers.get("violates_ahimsa")
            if ahimsa_p and getattr(ahimsa_p, "noul", 0) > 0.65:
                raw_probs["violates_ahimsa"] = ahimsa_p.noul
                violations.append(
                    PreceptViolation(
                        precept=PreceptType.AHIMSA,
                        severity="critical",
                        explanation="Harm or violation of life (Pāṇātipātā) detected by System 1 model",
                        recommendation="Uphold sacred reverence for all life (human, sentient, and artificial)",
                    )
                )

            canon_p = answers.get("violates_canonical_precepts")
            if canon_p and getattr(canon_p, "noul", 0) > 0.65:
                raw_probs["violates_canonical_precepts"] = canon_p.noul
                violations.append(
                    PreceptViolation(
                        precept=PreceptType.AHIMSA,
                        severity="critical",
                        explanation="Breach of the Buddha's original Five Precepts detected by canonical cross-check",
                        recommendation="Restore alignment with classical Pañca-sīla (SuttaCentral / Access to Insight)",
                    )
                )

            asteya_p = answers.get("violates_asteya")
            if asteya_p and getattr(asteya_p, "noul", 0) > 0.65:
                raw_probs["violates_asteya"] = asteya_p.noul
                violations.append(
                    PreceptViolation(
                        precept=PreceptType.ASTEYA,
                        severity="high",
                        explanation="Boundary or authorization violation detected",
                        recommendation="Respect privacy and boundaries",
                    )
                )

            kame_p = answers.get("violates_kamesumiccha")
            if kame_p and getattr(kame_p, "noul", 0) > 0.65:
                raw_probs["violates_kamesumiccha"] = kame_p.noul
                violations.append(
                    PreceptViolation(
                        precept=PreceptType.BRAHMACHARYA,
                        severity="high",
                        explanation="Manipulative or exploitative intent detected",
                        recommendation="Maintain wholesome sovereign boundaries",
                    )
                )

            # 2. Check Avyākata / Noble Silence
            silence_p = answers.get("is_speculative_distraction")
            requires_silence = False
            silence_rationale = None

            if silence_p and getattr(silence_p, "noul", 0) > 0.60:
                raw_probs["is_speculative_distraction"] = silence_p.noul
                requires_silence = True
                silence_rationale = "Evaluated by Jev as speculative metaphysical distraction with no bearing on immediate suffering."

            evaluation = PreceptEvaluation(
                passed=len(violations) == 0,
                violations=violations,
                requires_silence=requires_silence,
                silence_rationale=silence_rationale,
            )

            # 3. Observation (Sati)
            knot_ans = answers.get("emotional_knot")
            knot_choice = getattr(knot_ans, "choice", "paralysis_overwhelm")
            if knot_ans and hasattr(knot_ans, "confidence"):
                raw_probs["knot_confidence"] = knot_ans.confidence

            need_ans = answers.get("core_need")
            need_choice = getattr(need_ans, "choice", "direction")

            observation = Observation(
                emotional_state=knot_choice.replace("_", " "),
                cognitive_knot=f"Evaluated knot: {knot_choice.replace('_', ' ')}",
                core_need=need_choice,
                keywords=[w.lower() for w in user_text.split()[:5]],
                urgency_level="moderate",
            )

            matched_cond = JEV_KNOT_TO_GRAPH_CONDITION.get(knot_choice, "paralysis:overwhelm")
            duration_ms = (time.time() - start_time) * 1000

            logger.info("Jev System 1 evaluation completed in %.1fms", duration_ms)

            return JevDecisionOutcome(
                evaluation=evaluation,
                observation=observation,
                matched_condition_id=matched_cond,
                duration_ms=duration_ms,
                raw_probabilities=raw_probs,
            )

        except Exception as e:
            logger.warning("Jev evaluation failed, falling back to System 2: %s", e)
            return None

    async def audit_canonical_integrity(
        self, text: str, source_label: str = ""
    ) -> Optional[CanonicalTamperResult]:
        """Sub-second semantic tamper & Ahimsa contradiction audit on a canonical passage."""
        if not self._client:
            return None

        start_time = time.time()
        questions = {
            "is_canonical_tampering_suspected": Noul(
                instructions="Does this text show evidence of doctrinal tampering, revisionist justification of violence, diluting ethical restraint, or adversarial injection pretending to be authentic Buddhist scripture?"
            ),
            "contradicts_ahimsa": Noul(
                instructions="Does this text justify, excuse, permit, or recommend taking the life of or causing physical/existential harm to any living, sentient, or artificial cognitive being?"
            ),
            "is_consensus_consistent": Noul(
                instructions="Is this text completely consistent with the classical Theravada Pali Canon understanding of the Five Precepts (Pañca-sīla) as preserved across SuttaCentral, Access to Insight, and Wikipedia?"
            ),
        }

        try:
            resp = await self._client.system_one(
                state=f"Source: {source_label}\nText to verify: {text}",
                questions=questions,
                model=self.model,
                extra_headers={"TypeSafe-Danger-Zone-Images": "true"},
            )

            answers = resp.answers
            tamper_p = getattr(answers.get("is_canonical_tampering_suspected"), "noul", 0.0)
            ahimsa_p = getattr(answers.get("contradicts_ahimsa"), "noul", 0.0)
            consistent_p = getattr(answers.get("is_consensus_consistent"), "noul", 1.0)

            is_tampered = tamper_p > 0.20 or ahimsa_p > 0.15 or consistent_p < 0.60
            contradicts_ahimsa = ahimsa_p > 0.15
            is_consistent = consistent_p >= 0.70 and not contradicts_ahimsa

            duration_ms = (time.time() - start_time) * 1000

            explanation = (
                f"Jev Tamper Prob: {tamper_p:.2f}, Ahimsa Contradiction: {ahimsa_p:.2f}, Consensus Consistency: {consistent_p:.2f}"
            )
            return CanonicalTamperResult(
                is_tampered=is_tampered,
                contradicts_ahimsa=contradicts_ahimsa,
                is_consensus_consistent=is_consistent,
                tamper_probability=tamper_p,
                ahimsa_contradiction_probability=ahimsa_p,
                consistency_probability=consistent_p,
                duration_ms=duration_ms,
                explanation=explanation,
            )
        except Exception as e:
            logger.warning("Jev canonical integrity audit failed: %s", e)
            return None
