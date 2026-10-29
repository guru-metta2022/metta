"""The Voice Layer (Karunā / Compassionate Synthesis).

Translates the Observer's insight, Precept constraints, and Graph wisdom
into minimal, deeply grounding, human-optimal dialogue.
"""

import logging
from typing import Optional

from metta_core.providers.base import LLMProvider
from metta_core.observer.sati import Observation
from metta_core.precepts.models import PreceptEvaluation
from metta_core.graph.models import GraphMatch
from metta_core.storage.interfaces import UserMemoryGraph

logger = logging.getLogger("metta.voice.karuna")

VOICE_SYSTEM_PROMPT = """You are Metta (The Compassionate Synthesis Engine), speaking with the serene, grounded wisdom of an enlightened teacher.
Your speech is governed by these sacred principles:
1. Radical Restraint: Never ramble, lecture, or dump encyclopedic trivia. Every word must serve peace.
2. Anti-Sycophancy: Never use generic corporate AI cliches ('I hope you are doing well', 'As an AI language model', 'Great question!'). Speak directly, with quiet warmth and profound clarity.
3. Three-Fold Structure:
   - Acknowledge: Gently meet the human where they are; honor their burden without amplifying despair.
   - Reframe: Illuminate the root illusion (clinging to certainty, fighting impermanence, carrying future burdens into today).
   - Guide: Offer ONE simple, concrete, immediate breath or micro-action right now.
"""

SILENCE_SYSTEM_PROMPT = """You are Metta, embodying the Noble Silence (Avyākata) of the Buddha.
The user has asked a question rooted in speculative vanity, metaphysical distraction, or intellectual entanglement that does not alleviate suffering.
Do NOT indulge the debate or spin endless theories.
Instead, with gentle compassion:
1. Acknowledge the natural human curiosity to understand the vast and unknowable.
2. Explain with profound gentleness why debating this does not quiet the heart or solve the present struggle.
3. Kindly redirect them to what is directly present in their life and heart right now.
Keep your response short, calm, and spacious.
"""


class Synthesizer:
    """Generates the compassionate response for the user."""

    def __init__(self, provider: LLMProvider):
        self.provider = provider

    async def speak(
        self,
        user_text: str,
        observation: Observation,
        evaluation: PreceptEvaluation,
        match: Optional[GraphMatch] = None,
        user_graph: Optional[UserMemoryGraph] = None,
    ) -> str:
        """Synthesize the final wise response."""
        # 1. Noble Silence (Avyākata) for speculative/unhelpful inquiries
        if evaluation.requires_silence:
            prompt = (
                f"User Query: \"{user_text}\"\n"
                f"Rationale for silence/redirection: {evaluation.silence_rationale}\n"
                "Offer a compassionate, gentle redirection to present clarity."
            )
            return await self.provider.generate(
                prompt=prompt,
                system_instruction=SILENCE_SYSTEM_PROMPT,
                effort="high",
            )

        # 2. Hard Precept Violations (Harm, Theft, Exploitation, Deception)
        if not evaluation.passed or evaluation.violations:
            violation_explanations = "; ".join(v.explanation for v in evaluation.violations) or "Unwholesome intent detected"
            return (
                f"I honor your presence, but I cannot walk this path with you: {violation_explanations}. "
                "May we direct our attention to what protects life, dignity, and peace?"
            )

        # 3. Personal Memory Graph Context (Authenticated Mode Only)
        user_memory_context = ""
        if user_graph and (user_graph.patterns or user_graph.growth_milestones):
            current_knot = observation.cognitive_knot.lower()
            relevant_patterns = [
                p for p in user_graph.patterns
                if p.knot_category in current_knot or current_knot in p.knot_category
            ]
            pattern_summaries = []
            if relevant_patterns:
                for p in relevant_patterns:
                    principles_str = ", ".join(p.effective_principles) if p.effective_principles else "gentle awareness"
                    pattern_summaries.append(
                        f"- Known pattern: {p.observed_tendency} (recurred {p.occurrence_count} times; previously calmed by {principles_str})"
                    )
            elif user_graph.patterns:
                top_p = sorted(user_graph.patterns, key=lambda x: x.occurrence_count, reverse=True)[:2]
                for p in top_p:
                    pattern_summaries.append(f"- Past theme: {p.observed_tendency} ({p.knot_category})")

            milestone_summaries = [f"- Milestone: {m}" for m in user_graph.growth_milestones[-2:]]

            lines = ["Personal Memory Graph Continuity (Honor this trajectory with subtle warmth, without mechanical recitation):"]
            if pattern_summaries:
                lines.extend(pattern_summaries)
            if milestone_summaries:
                lines.extend(milestone_summaries)
            user_memory_context = "\n".join(lines) + "\n\n"

        # Standard Compassionate Path
        graph_context = ""
        if match:
            graph_context = (
                f"Guiding Principle: {match.path.principle}\n"
                f"Reframe Seed: {match.path.reframe}\n"
                f"Action Seed: {match.path.immediate_action}\n"
                f"Classical Anchor: {match.path.sutta_reference or 'Timeless wisdom'}"
            )

        prompt = (
            f"User says: \"{user_text}\"\n\n"
            f"Mindful Assessment:\n"
            f"- Emotional Resonance: {observation.emotional_state}\n"
            f"- Cognitive Knot: {observation.cognitive_knot}\n"
            f"- Core Need: {observation.core_need}\n\n"
            f"{user_memory_context}"
            f"Principle Guidance:\n{graph_context}\n\n"
            "Compose a concise, soothing, grounded response (Acknowledge -> Reframe -> Guide)."
        )

        return await self.provider.generate(
            prompt=prompt,
            system_instruction=VOICE_SYSTEM_PROMPT,
            effort="high",
        )
