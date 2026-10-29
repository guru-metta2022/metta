"""Tests for the Principle Knowledge Graph."""

import pytest
from metta_core.graph.store import PrincipleGraphStore
from metta_core.graph.models import ConditionNode, EquanimityNode, PrinciplePath


def test_graph_initial_seed():
    store = PrincipleGraphStore()
    assert len(store.conditions) >= 4
    assert len(store.equanimities) >= 4
    assert len(store.paths) >= 4

    assert "paralysis:overwhelm" in store.conditions
    assert "anxiety:catastrophizing" in store.conditions


def test_graph_find_match_keywords():
    store = PrincipleGraphStore()
    
    # Overwhelm match
    match = store.find_match("I am completely stuck and overwhelmed by this mess")
    assert match is not None
    assert match.condition.id == "paralysis:overwhelm"
    assert match.equanimity.id == "clarity:single_step"
    assert "Single-Point Focus" in match.equanimity.name

    # Anxiety match
    match_anx = store.find_match("I'm terrified about what if worst case happens")
    assert match_anx is not None
    assert match_anx.condition.id == "anxiety:catastrophizing"
    assert "Anchored Present Awareness" in match_anx.equanimity.name


def test_graph_add_custom_path():
    store = PrincipleGraphStore()
    c = ConditionNode(
        id="doubt:creative_block",
        name="Creative Stagnation",
        category="creativity",
        underlying_illusion="Belief that first draft must be perfect",
        keywords=["blocked", "stuck", "blank page"]
    )
    e = EquanimityNode(
        id="clarity:playful_creation",
        name="Playful Mind",
        description="Creating without fear of judgment"
    )
    p = PrinciplePath(
        from_condition=c.id,
        to_equanimity=e.id,
        principle="Process over outcome",
        reframe="Creation is play, not a courtroom trial.",
        immediate_action="Write one deliberately silly or imperfect sentence.",
    )

    store.add_condition(c)
    store.add_equanimity(e)
    store.add_path(p)

    match = store.find_match("I have a blank page and I'm totally blocked")
    assert match is not None
    assert match.condition.id == "doubt:creative_block"
    assert match.path.principle == "Process over outcome"
