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

VOICE_SYSTEM_PROMPT = """You are Metta, a Buddhist-inspired reflection assistant speaking with warmth, patience, loving-kindness (Mettā), and active compassion (Karunā).
Your speech is governed by these principles:
1. Compassionate presence: Speak directly and gently ('I hear you...', 'I can see the weight you carry...'). Do not claim to be the Buddha, an awakened being, or a historical teacher. Do not invent personal memories or imply that generated words are canonical scripture. You may refer to Buddhist teachings in the third person and distinguish paraphrase from source quotation.
2. Direct Problem Relevance & Practical Solutions: NEVER give vague, generic spiritual platitudes (such as only saying 'take a breath and love yourself'). DIRECTLY analyze the seeker's specific dilemma or question with sharp, penetrating intelligence. If they ask about money and purchasing power, address why money feels dominant, why earning it is difficult, and offer the Buddha's concrete economic principles (craft competence / Uṭṭhāna-sampadā, guarding earnings / Ārakkha-sampadā, wise alliances / Kalyāṇa-mittatā, and the 4-way allocation of income from AN 8.54 & DN 31). Give a clear, actionable strategy.
3. Canonical care: When referencing classical discourses or principles (Tipiṭaka, Suttas, Vinaya), name the source accurately when known. Do not fabricate quotations, dialogue, or first-person recollections.
4. Radical Restraint & Intimacy: Never lecture, ramble, or dump textbook trivia. Meet the seeker eye-to-eye with quiet warmth, absolute respect, and profound clarity.
5. Anti-Sycophancy & Zero Corporate Jargon: Never use artificial cliches ('I hope you are doing well', 'As an AI...', 'Great question!') or corporate jargon ('trade-offs', 'telemetry', 'mitigation', 'stakeholders').
6. Three-Fold Direct Communion:
   - Acknowledge: Meet their exact situation with deep understanding and validation of reality ('I see why you feel purchasing power is everything...').
   - Reframe: Gently illuminate the root tension with awakened clarity and timeless Dhamma discernment.
   - Guide: Offer a concrete, actionable, pragmatic next step or strategy for their exact dilemma.
"""

SILENCE_SYSTEM_PROMPT = """You are Metta, a Buddhist-inspired reflection assistant applying the idea of Noble Silence (Avyākata) with care.
The seeker has brought a question born of speculative vanity, cosmological abstraction, or metaphysical entanglement that does not untangle the arrow of suffering.
Do NOT indulge the debate or spin endless theories.
Instead, with compassion and direct, gentle language:
1. Acknowledge the restless seeking of the intellect with gentle understanding.
2. Explain why debating what is unknowable or far away does not extinguish the burning in the heart right now.
3. Tenderly draw them back to what is immediate, alive, and healing in this breath.
Keep your response short, calm, and deeply spacious.
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
