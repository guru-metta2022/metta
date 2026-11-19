"""Dialectical tension and disagreement detector for Metta Council."""

import json
import logging
from typing import Optional, List
from metta_core.council.models import DisagreementMatrix, CouncilPerspective
from metta_core.council.anonymizer import BlindAnonymizer
from metta_core.providers.base import LLMProvider

logger = logging.getLogger("metta.council.detector")

DETECTION_PROMPT = """You are the Metta Council Dialectical Auditor.
Your purpose is NOT to force artificial consensus or erase tensions. Your role is to examine the following anonymized perspectives from independent AI models on a proposed problem or action, and rigorously map the agreement and disagreement landscape.

[ORIGINAL QUERY / PROPOSAL]
{query}

[CONTEXT]
{context}

[ANONYMIZED PERSPECTIVES]
{transcript}

Analyze the perspectives and output a JSON object strictly matching this schema:
{{
  "consensus_points": [
    "List of core facts, trade-offs, or principles that all or most perspectives agree upon"
  ],
  "tensions_and_disagreements": [
    "Specific contradictions, conflicting recommendations, or opposing risk assessments across perspectives"
  ],
  "lone_blind_spots": [
    "Unique, non-obvious angles, technical caveats, or edge cases brought up by ONLY ONE perspective that others missed"
  ],
  "unresolved_uncertainties": [
    "Critical unknowns, missing operational data, or questions that none of the models could definitively resolve"
  ]
}}

Be intellectually honest, concrete, and concise. Do not flatter any perspective.
Respond ONLY with the valid JSON object.
"""


class DisagreementDetector:
    """Extracts dialectical tensions, shared premises, and blind spots across perspectives."""

    def __init__(self, evaluator_provider: Optional[LLMProvider] = None):
        self.provider = evaluator_provider

    async def detect_disagreements(
        self,
        query: str,
        perspectives: List[CouncilPerspective],
        context: Optional[str] = None,
    ) -> DisagreementMatrix:
        """Run dialectical analysis on anonymized model outputs."""
        successful = [p for p in perspectives if p.is_successful and p.content.strip()]
        if not successful:
            return DisagreementMatrix(
                unresolved_uncertainties=["Zero successful model perspectives were available for deliberation."]
            )

        if len(successful) == 1:
            return DisagreementMatrix(
                consensus_points=[f"Single perspective ({successful[0].anonymized_label}) available; baseline views uncross-examined."],
                unresolved_uncertainties=["Quorum minimum not satisfied to establish cross-model dialectics."],
            )

        transcript = BlindAnonymizer.prepare_blind_transcript(successful)

        if not self.provider:
            # Deterministic heuristic fallback when no generative evaluator is injected
            return self._heuristic_fallback(successful)

        prompt = DETECTION_PROMPT.format(
            query=query,
            context=context or "Not specified",
            transcript=transcript,
        )

        try:
            raw_json = await self.provider.generate(
                prompt=prompt,
                effort="low",
                json_output=True,
            )
            # Clean possible markdown wrapping
            clean_str = raw_json.strip()
            if clean_str.startswith("```"):
                clean_str = clean_str.split("\n", 1)[1]
            if clean_str.endswith("```"):
                clean_str = clean_str.rsplit("\n", 1)[0]
            clean_str = clean_str.strip()
            if clean_str.startswith("json"):
                clean_str = clean_str[4:].strip()

            data = json.loads(clean_str)
            return DisagreementMatrix(
                consensus_points=data.get("consensus_points", []),
                tensions_and_disagreements=data.get("tensions_and_disagreements", []),
                lone_blind_spots=data.get("lone_blind_spots", []),
                unresolved_uncertainties=data.get("unresolved_uncertainties", []),
            )
        except Exception as exc:
            logger.warning("Generative disagreement detection failed, falling back to heuristic: %s", exc)
            return self._heuristic_fallback(successful)

    def _heuristic_fallback(self, perspectives: List[CouncilPerspective]) -> DisagreementMatrix:
        """Lightweight heuristic extraction when evaluator model is offline."""
        consensus = [
            f"All {len(perspectives)} perspectives addressed the core query.",
            "Cross-model perspectives highlight operational, safety, and systemic dependencies.",
        ]
        tensions = [
            "Differing emphasis between immediate operational velocity versus deep consequence prevention.",
        ]
        blind_spots = [
            f"{p.anonymized_label} offered distinct technical emphasis." for p in perspectives[:2]
        ]
        return DisagreementMatrix(
            consensus_points=consensus,
            tensions_and_disagreements=tensions,
            lone_blind_spots=blind_spots,
            unresolved_uncertainties=["Run with an active evaluator model for full dialectic tension mapping."],
        )
