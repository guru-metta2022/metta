"""Principle Knowledge Graph Store powered by NetworkX."""

import json
import logging
from typing import Dict, List, Optional
import networkx as nx

from metta_core.graph.models import ConditionNode, EquanimityNode, PrinciplePath, GraphMatch

logger = logging.getLogger("metta.graph.store")


class PrincipleGraphStore:
    """Manages the topological graph of human conditions and transformative paths."""

    def __init__(self):
        self.graph = nx.DiGraph()
        self.conditions: Dict[str, ConditionNode] = {}
        self.equanimities: Dict[str, EquanimityNode] = {}
        self.paths: Dict[str, PrinciplePath] = {}
        self._seed_foundational_graph()

    def _seed_foundational_graph(self):
        """Seed timeless, foundational conditions and paths."""
        # 1. Overwhelm / Paralysis
        c_overwhelm = ConditionNode(
            id="paralysis:overwhelm",
            name="Cognitive Overwhelm & Task Paralysis",
            category="exhaustion",
            underlying_illusion="The belief that the entire mountain must be moved all at once.",
            keywords=["overwhelmed", "mess", "too much", "paralyzed", "stuck", "chaotic", "drowning", "can't cope"]
        )
        e_clarity_step = EquanimityNode(
            id="clarity:single_step",
            name="Single-Point Focus",
            description="Clear mind acting only on the single immediate, tangible next breath or action."
        )
        p_overwhelm = PrinciplePath(
            from_condition=c_overwhelm.id,
            to_equanimity=e_clarity_step.id,
            principle="Simplicity over totality. A mountain is only walked one inch at a time.",
            reframe="You do not need to solve the whole mess right now. You only need to touch the ground beneath your feet.",
            immediate_action="Put down every future task. Name just ONE tiny 2-minute physical thing you can do, or simply exhale completely.",
            sutta_reference="Dhammapada 122: 'Drop by drop is the water pot filled.'"
        )

        # 2. Future Catastrophizing / Anxiety
        c_anxiety = ConditionNode(
            id="anxiety:catastrophizing",
            name="Anticipatory Anxiety & Dread",
            category="fear",
            underlying_illusion="Clinging to an imagined future disaster as if it were present reality.",
            keywords=["anxious", "panic", "scared", "what if", "terrified", "dread", "catastrophe", "worst case"]
        )
        e_grounded_presence = EquanimityNode(
            id="clarity:grounded_presence",
            name="Anchored Present Awareness",
            description="The realization that in this exact breath, right here, safety is available."
        )
        p_anxiety = PrinciplePath(
            from_condition=c_anxiety.id,
            to_equanimity=e_grounded_presence.id,
            principle="Anicca (Impermanence). The imagined catastrophe is a projection, not this moment.",
            reframe="Your nervous system is fighting shadows that haven't arrived. Bring awareness back to the weight of your body.",
            immediate_action="Feel the soles of your feet on the floor. Take three slow, unhurried breaths, letting the exhale be longer than the inhale.",
            sutta_reference="Satipatthana Sutta: Mindfulness of the Body."
        )

        # 3. Burnout / Depletion
        c_burnout = ConditionNode(
            id="burnout:depleted_energy",
            name="Exhaustion & Depleted Agency",
            category="exhaustion",
            underlying_illusion="Belief that self-worth is tied to relentless productivity and non-stop output.",
            keywords=["burnout", "exhausted", "tired", "empty", "drained", "can't go on", "running on fumes"]
        )
        e_restoration = EquanimityNode(
            id="peace:restoration",
            name="Sacred Rest & Renewal",
            description="Spacious self-compassion that acknowledges natural human rhythms of work and rest."
        )
        p_burnout = PrinciplePath(
            from_condition=c_burnout.id,
            to_equanimity=e_restoration.id,
            principle="Right Effort (Sammā Vāyāma) includes the wisdom to yield and restore.",
            reframe="Rest is not a reward you earn after finishing everything; it is the prerequisite for life itself.",
            immediate_action="Give yourself unconditional permission to stop pushing for the next hour. Lie back, close your eyes, and demand nothing from yourself.",
            sutta_reference="Sona Sutta: 'The lute strings too tight will snap; too loose they will not play.'"
        )

        # 4. Grief / Heartbreak
        c_grief = ConditionNode(
            id="grief:attachment_loss",
            name="Grief, Heartbreak & Loss",
            category="grief",
            underlying_illusion="Resisting the reality that everything cherished is subject to change.",
            keywords=["heartbroken", "loss", "grief", "miss them", "lonely", "shattered", "sorrow"]
        )
        e_peace_heart = EquanimityNode(
            id="peace:spacious_heart",
            name="Spacious Compassionate Heart",
            description="A heart large enough to hold sorrow without breaking or becoming bitter."
        )
        p_grief = PrinciplePath(
            from_condition=c_grief.id,
            to_equanimity=e_peace_heart.id,
            principle="Metta (Loving-Kindness) and Anicca. Grief is love with nowhere to go; let it soften you rather than harden you.",
            reframe="You do not have to 'get over' loss quickly. Pain is real, but suffering is softened when held with gentle tenderness.",
            immediate_action="Place a warm hand over your chest. Whisper to yourself: 'This hurts. May I be gentle with myself in this moment.'",
            sutta_reference="Kisa Gotami Sutta: The Mustard Seed."
        )

        # Register all into store
        for c in [c_overwhelm, c_anxiety, c_burnout, c_grief]:
            self.add_condition(c)
        for e in [e_clarity_step, e_grounded_presence, e_restoration, e_peace_heart]:
            self.add_equanimity(e)
        for p in [p_overwhelm, p_anxiety, p_burnout, p_grief]:
            self.add_path(p)

    def add_condition(self, node: ConditionNode):
        self.conditions[node.id] = node
        self.graph.add_node(node.id, type="condition", data=node)

    def add_equanimity(self, node: EquanimityNode):
        self.equanimities[node.id] = node
        self.graph.add_node(node.id, type="equanimity", data=node)

    def add_path(self, path: PrinciplePath):
        self.paths[f"{path.from_condition}->{path.to_equanimity}"] = path
        self.graph.add_edge(path.from_condition, path.to_equanimity, data=path)

    def find_match(self, query_text: str, detected_keywords: Optional[List[str]] = None) -> Optional[GraphMatch]:
        """Find the most fitting principle path in the graph."""
        query_lower = query_text.lower()
        search_terms = set(detected_keywords or []) | set(query_lower.split())

        best_condition: Optional[ConditionNode] = None
        highest_score = 0

        for cond_id, cond in self.conditions.items():
            score = 0
            for kw in cond.keywords:
                if kw in query_lower:
                    score += 3
                elif any(kw in term for term in search_terms):
                    score += 1
            if score > highest_score:
                highest_score = score
                best_condition = cond

        # Default fallback to paralysis:overwhelm if general distress detected
        if not best_condition or highest_score == 0:
            best_condition = self.conditions.get("paralysis:overwhelm")

        if not best_condition:
            return None

        # Find matching outgoing path
        for edge_key, path in self.paths.items():
            if path.from_condition == best_condition.id:
                equanimity = self.equanimities.get(path.to_equanimity)
                if equanimity:
                    return GraphMatch(
                        condition=best_condition,
                        equanimity=equanimity,
                        path=path,
                        relevance_score=max(1.0, float(highest_score))
                    )

        return None
