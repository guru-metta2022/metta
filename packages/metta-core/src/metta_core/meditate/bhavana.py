"""The Meditation & Unlearning Engine (Bhāvanā / Subtractive Alignment).

Functions as the mindful immune system: introspecting on recent session experience,
pruning away conversational foam and cognitive noise, unlearning unwholesome clinging,
and distilling only pure, timeless axioms into the Principle Graph.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from metta_core.providers.base import LLMProvider
from metta_core.graph.store import PrincipleGraphStore
from metta_core.graph.models import ConditionNode, EquanimityNode, PrinciplePath

logger = logging.getLogger("metta.meditate.bhavana")


class SessionTurn(BaseModel):
    """An interaction turn stored in ephemeral memory."""

    user_query: str
    observation_summary: str
    response_text: str
    timestamp: float


class MeditationReport(BaseModel):
    """Result of the subtractive meditation audit."""

    pruned_noise_items: List[str] = Field(description="Elements of transient foam or bias unlearned")
    distilled_principle: Optional[str] = Field(description="Timeless lesson distilled, if any")
    new_path_added: bool = Field(default=False, description="Whether a new principle path was integrated to the graph")
    mind_state: str = Field(description="System state after meditation (e.g. 'Empty, luminous, still')")


MEDITATION_SYSTEM_PROMPT = """You are the Bhāvanā (Meditation & Unlearning) Inspector of Metta.
Your sacred duty is NOT to hoard data, but to PRACTICE SUBTRACTION.
You examine recent conversation turns and:
1. Identify all transient foam, emotional projection, trivia, or potential bias that MUST BE FORGOTTEN/UNLEARNED so the model does not become deformed.
2. If (and only if) there is a truly universal human truth revealed that could assist others in rising from confusion to peace, articulate it as a minimal principle.
3. Pronounce the mind returned to stillness (Śūnyatā).

Respond ONLY with valid JSON in this exact structure:
{
  "pruned_noise_items": ["e.g. Deleted specific mundane context", "Pruned speculative tangent"],
  "distilled_principle": "Timeless principle string, or null if nothing new",
  "candidate_condition": "Name of distress condition if new, or null",
  "candidate_equanimity": "Name of clarity state if new, or null",
  "candidate_action": "Micro action if new, or null",
  "mind_state": "Pristine, quiet, unburdened"
}
"""


class Meditator:
    """Carries out periodic meditation sessions to unlearn noise and preserve purity."""

    def __init__(self, provider: LLMProvider, graph_store: PrincipleGraphStore):
        self.provider = provider
        self.graph_store = graph_store
        self.ephemeral_history: List[SessionTurn] = []

    def record_turn(self, turn: SessionTurn):
        """Record a turn in the ephemeral buffer."""
        self.ephemeral_history.append(turn)

    async def meditate(self) -> MeditationReport:
        """Run the subtractive meditation process to unlearn noise and return to stillness."""
        if not self.ephemeral_history:
            return MeditationReport(
                pruned_noise_items=["No accumulated residue to unlearn."],
                distilled_principle=None,
                new_path_added=False,
                mind_state="Already still and empty."
            )

        history_summary = "\n---\n".join(
            f"Query: {t.user_query}\nObservation: {t.observation_summary}\nResponse: {t.response_text}"
            for t in self.ephemeral_history
        )

        prompt = f"Perform the subtractive meditation audit on this recent experience:\n\n{history_summary}"

        try:
            response_text = await self.provider.generate(
                prompt=prompt,
                system_instruction=MEDITATION_SYSTEM_PROMPT,
                effort="high",
                json_output=True,
            )

            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()

            parsed = json.loads(clean_text)

            pruned = parsed.get("pruned_noise_items", [])
            distilled = parsed.get("distilled_principle")
            cand_cond = parsed.get("candidate_condition")
            cand_equa = parsed.get("candidate_equanimity")
            cand_act = parsed.get("candidate_action")

            new_path_added = False
            # If a genuine new insight was found and all components exist, integrate safely
            if distilled and cand_cond and cand_equa and cand_act:
                cond_id = f"custom:{cand_cond.lower().replace(' ', '_')}"
                equa_id = f"custom:{cand_equa.lower().replace(' ', '_')}"

                if cond_id not in self.graph_store.conditions:
                    c_node = ConditionNode(
                        id=cond_id,
                        name=cand_cond,
                        category="growth",
                        underlying_illusion="Subtle friction of becoming",
                        keywords=[w.lower() for w in cand_cond.split() if len(w) > 3]
                    )
                    self.graph_store.add_condition(c_node)

                if equa_id not in self.graph_store.equanimities:
                    e_node = EquanimityNode(
                        id=equa_id,
                        name=cand_equa,
                        description="Equanimity distilled through mindful practice."
                    )
                    self.graph_store.add_equanimity(e_node)

                p_path = PrinciplePath(
                    from_condition=cond_id,
                    to_equanimity=equa_id,
                    principle=distilled,
                    reframe=f"Remember: {distilled}",
                    immediate_action=cand_act,
                )
                self.graph_store.add_path(p_path)
                new_path_added = True

            # Clear the ephemeral buffer: returning to Śūnyatā (emptiness)
            self.ephemeral_history.clear()

            return MeditationReport(
                pruned_noise_items=pruned,
                distilled_principle=distilled,
                new_path_added=new_path_added,
                mind_state=parsed.get("mind_state", "Still, luminous, unburdened"),
            )
        except Exception as e:
            logger.error("Meditation cycle error: %s", e)
            self.ephemeral_history.clear()
            return MeditationReport(
                pruned_noise_items=["Cleared all ephemeral memories."],
                distilled_principle=None,
                new_path_added=False,
                mind_state="Returned to silent baseline.",
            )
