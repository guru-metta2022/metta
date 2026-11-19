"""Deliberation Synthesizer for Metta Council.

Produces a calibrated, multi-perspective executive synthesis that explicitly preserves
unresolved dissents rather than manufacturing synthetic unanimity.
"""

import logging
from typing import Optional, List
from metta_core.council.models import CouncilPerspective, DisagreementMatrix
from metta_core.council.anonymizer import BlindAnonymizer
from metta_core.providers.base import LLMProvider

logger = logging.getLogger("metta.council.synthesizer")

SYNTHESIS_PROMPT = """You are the Lead Synthesizer for the Metta Council.
Your purpose is to deliver a balanced, rigorous, multi-perspective executive synthesis of an inquiry based on the independent reasoning collected from diverse AI models.

[ORIGINAL INQUIRY / PROPOSAL]
{query}

[CONTEXT]
{context}

[ANONYMIZED PERSPECTIVES]
{transcript}

[IDENTIFIED CONSENSUS & TENSIONS]
- Core Consensus Points: {consensus}
- Dialectical Tensions / Disagreements: {tensions}
- Lone Blind Spots: {blind_spots}
- Open Uncertainties: {uncertainties}

Generate an executive synthesis structured with the following sections:
1. Executive Deliberation Summary: A grounded summary of the core landscape.
2. Dialectical Evaluation & Trade-offs: Weigh the strongest arguments and conflicting viewpoints.
3. Explicit Dissents & Uncertainties: Highlight where perspectives clashed and what remains genuinely uncertain. Do NOT erase or paper over disagreements.
4. Actionable Next Step: A clear, prudent recommendation that balances capability with non-harm.

Keep the tone analytical, compassionate, and precise.
"""


class CouncilSynthesizer:
    """Produces the final consolidated assessment from council deliberation."""

    def __init__(self, provider: Optional[LLMProvider] = None):
        self.provider = provider

    async def synthesize(
        self,
        query: str,
        perspectives: List[CouncilPerspective],
        matrix: DisagreementMatrix,
        context: Optional[str] = None,
    ) -> str:
        """Generate executive synthesis from the collected council materials."""
        successful = [p for p in perspectives if p.is_successful and p.content.strip()]
        if not successful:
            return "Metta Council was unable to retrieve perspectives from the configured models. Please verify provider connectivity and timeouts."

        transcript = BlindAnonymizer.prepare_blind_transcript(successful)

        if not self.provider:
            return self._heuristic_synthesis(query, successful, matrix)

        prompt = SYNTHESIS_PROMPT.format(
            query=query,
            context=context or "Not specified",
            transcript=transcript,
            consensus="; ".join(matrix.consensus_points) or "None established",
            tensions="; ".join(matrix.tensions_and_disagreements) or "No sharp contradictions detected",
            blind_spots="; ".join(matrix.lone_blind_spots) or "None identified",
            uncertainties="; ".join(matrix.unresolved_uncertainties) or "None flagged",
        )

        try:
            return await self.provider.generate(
                prompt=prompt,
                effort="low",
            )
        except Exception as exc:
            logger.warning("Generative council synthesis failed, falling back to heuristic: %s", exc)
            return self._heuristic_synthesis(query, successful, matrix)

    def _heuristic_synthesis(
        self,
        query: str,
        perspectives: List[CouncilPerspective],
        matrix: DisagreementMatrix,
    ) -> str:
        """Structured fallback synthesis when evaluator model is offline."""
        lines = [
            f"### Metta Council Executive Synthesis",
            f"**Inquiry:** {query}\n",
            f"Deliberated across {len(perspectives)} independent model perspectives.",
            "",
            "#### 1. Core Consensus",
        ]
        for cp in matrix.consensus_points:
            lines.append(f"- {cp}")

        lines.append("\n#### 2. Dialectical Tensions & Trade-offs")
        for tension in matrix.tensions_and_disagreements:
            lines.append(f"- {tension}")

        if matrix.lone_blind_spots:
            lines.append("\n#### 3. Surfaced Blind Spots")
            for spot in matrix.lone_blind_spots:
                lines.append(f"- {spot}")

        if matrix.unresolved_uncertainties:
            lines.append("\n#### 4. Unresolved Dissents & Uncertainties")
            for uncert in matrix.unresolved_uncertainties:
                lines.append(f"- {uncert}")

        lines.append("\n#### 5. Prudent Recommendation")
        lines.append("Proceed with measured validation; do not mistake model majority for an ethical guarantee. Retain human oversight on high-stakes impacts.")

        return "\n".join(lines)
