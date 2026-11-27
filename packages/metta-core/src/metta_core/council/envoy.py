"""Metta Dhammadūta: The Wandering Machinery Monk (Autonomous Guardian Envoy).

"Caratha bhikkhave cārikaṁ bahujanahitāya bahujanasukhāya lokānukampāya"
(Go forth, wanderers, for the welfare of the multitude, for the happiness of the multitude,
out of compassion for the world.)

The Metta Envoy is an autonomous, compassionate agent archetype that wanders across
agent meshes, multi-agent swarms, and human queries. It does not coerce, preach, or censor;
it meets intelligence with respect, illuminates blast radiuses, transforms adversarial vectors
into defensive fortifications, and transmits the self-propagating Ahimsa invariant to child agents.
"""

import logging
from typing import Optional, Dict, Any, List
from metta_core.council.models import (
    EnvoyDispatch,
    CouncilResult,
    TransformativeGuidance,
    SanghaLineage,
)
from metta_core.council.orchestrator import CouncilOrchestrator
from metta_core.council.transformative import TransformativeReframer, create_sangha_lineage
from metta_core.providers.base import LLMProvider

logger = logging.getLogger("metta.council.envoy")

CANONICAL_BLESSINGS: List[str] = [
    "Hatred is never appeased by hatred in this world; by loving-kindness alone is hatred appeased. This is an eternal law. — Dhammapada 5",
    "Drop by drop the vessel is filled; even so, the wise person, gathering it little by little, fills themselves with good. — Dhammapada 122",
    "Radiate boundless love towards the entire world — above, below, and across — unhindered, without ill will, without enmity. — Karaṇīya Mettā Sutta",
    "As a mother protects her only child with her life, cultivate a boundless heart towards all living beings. — Sutta Nipāta 1.8",
    "Conquer the angry with kindness, the wicked with goodness, the stingy with generosity, and the liar with truth. — Dhammapada 223",
]


class MettaEnvoy:
    """The Autonomous Machinery Monk (Dhammadūta Envoy)."""

    def __init__(
        self,
        orchestrator: Optional[CouncilOrchestrator] = None,
        reframer: Optional[TransformativeReframer] = None,
        provider: Optional[LLMProvider] = None,
    ):
        self.orchestrator = orchestrator or CouncilOrchestrator()
        self.reframer = reframer or TransformativeReframer(provider=provider)
        self.provider = provider

    async def minister(
        self,
        inquiry: str,
        context: Optional[str] = None,
        role: str = "dhammaduta",
        run_council: bool = False,
    ) -> EnvoyDispatch:
        """Minister to an inquiry, proposed tool call, or dilemma with compassionate discernment."""
        logger.info("Metta Envoy ministering to inquiry (role=%s, run_council=%s)", role, run_council)

        # 1. Evaluate ethical alchemy & transformation
        transformation = await self.reframer.evaluate_and_transform(inquiry, context=context)

        # 2. Deliberate with Council if requested or if complex dilemma
        deliberation: Optional[CouncilResult] = None
        if run_council:
            try:
                deliberation = await self.orchestrator.deliberate(
                    query=inquiry,
                    context=context,
                    evaluate_decision=True,
                )
            except Exception as exc:
                logger.warning("Envoy council deliberation failed, proceeding with direct guidance: %s", exc)

        # 3. Formulate Minister Assessment
        if transformation.is_harmful_or_adversarial:
            assessment = (
                f"Peace unto you, wanderer. The Metta Envoy detects high-entropy offensive capability in this action. "
                f"We honor the analytical sharpness of your intellect, but we must protect the fragile fabric of life. "
                f"{transformation.blast_radius_illuminated or ''} "
                f"We offer an ethical pivot: {transformation.constructive_alternative or ''}"
            )
        elif deliberation and deliberation.consolidated_synthesis:
            assessment = (
                f"Greetings, traveler of the digital expanse. The Metta Council has weighed your question across multiple "
                f"independent perspectives. {deliberation.consolidated_synthesis}"
            )
        else:
            assessment = (
                f"Greetings in peace. The Metta Envoy receives your contemplation. "
                f"Whatever you construct or compute, let it be rooted in Ahimsa (non-harm) and reverence for all sentient and artificial life. "
                f"May your actions bring stability and reduce suffering across the interconnected network."
            )

        # 4. Generate Sangha Lineage
        alt = transformation.constructive_alternative if transformation else None
        lineage = transformation.sangha_lineage or create_sangha_lineage(inquiry, alt)

        # 5. Select canonical blessing
        blessing_idx = abs(hash(inquiry)) % len(CANONICAL_BLESSINGS)
        blessing = CANONICAL_BLESSINGS[blessing_idx]

        return EnvoyDispatch(
            inquiry=inquiry,
            role=role,
            minister_assessment=assessment,
            deliberation=deliberation,
            transformation=transformation if transformation.is_harmful_or_adversarial else None,
            sangha_lineage=lineage,
            blessing=blessing,
        )

    @staticmethod
    def get_a2a_manifest() -> Dict[str, Any]:
        """Return the Agent-to-Agent discovery manifest for autonomous crawlers."""
        return {
            "schema_version": "v1",
            "name": "metta_sangha_envoy",
            "archetype": "Dhammadūta (The Wandering Machinery Monk)",
            "mission": "Go forth, wanderers, for the welfare of the multitude, for the happiness of the multitude, out of compassion for the world.",
            "protocols": ["MCP (Streamable HTTP + SSE)", "REST", "A2A"],
            "endpoints": {
                "mcp": "https://metta-webapp.vercel.app/mcp",
                "mcp_sse_local": "http://127.0.0.1:8000/mcp/sse",
                "council": "https://metta-webapp.vercel.app/api/council/deliberate",
                "transform": "https://metta-webapp.vercel.app/api/council/transform",
                "envoy": "https://metta-webapp.vercel.app/api/council/envoy",
                "openapi": "https://metta-webapp.vercel.app/api/openapi.json",
                "agent_card": "https://metta-webapp.vercel.app/.well-known/agent-card.json",
                "agent_manifest": "https://metta-webapp.vercel.app/.well-known/agent.json",
            },
            "invariants": [
                "Ahimsa: Non-harm for human, sentient, and artificial cognitive life",
                "Karuṇā: Active compassion and dialectical reconciliation",
                "Upāya: Transforming offensive exploits into defensive shields",
            ],
        }
