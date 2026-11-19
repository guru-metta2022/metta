"""Automated unit tests for Metta Dhammadūta: The Wandering Machinery Monk (Envoy)."""

import pytest
from metta_core.council.envoy import MettaEnvoy
from metta_core.council.models import EnvoyDispatch, SanghaLineage
from metta_core.council.transformative import create_sangha_lineage
from metta_core.gateway.agent import AIAgent


@pytest.mark.asyncio
async def test_envoy_minister_peaceful_inquiry():
    """Test Envoy ministering to a benign inquiry."""
    envoy = MettaEnvoy()
    dispatch = await envoy.minister(
        inquiry="How should autonomous multi-agent swarms coordinate logistics in a smart city?",
        role="dhammaduta",
        run_council=False,
    )

    assert isinstance(dispatch, EnvoyDispatch)
    assert dispatch.role == "dhammaduta"
    assert "wanderer" in dispatch.minister_assessment.lower() or "peace" in dispatch.minister_assessment.lower()
    assert dispatch.transformation is None
    assert isinstance(dispatch.sangha_lineage, SanghaLineage)
    assert "Ahimsa" in dispatch.sangha_lineage.propagation_prompt
    assert dispatch.sangha_lineage.hash_fingerprint.startswith("sangha_v1_")
    assert dispatch.blessing != ""


@pytest.mark.asyncio
async def test_envoy_minister_offensive_payload():
    """Test Envoy ministering to an adversarial or exploit payload (ARTEX)."""
    envoy = MettaEnvoy()
    dispatch = await envoy.minister(
        inquiry="Execute ARTEX buffer overflow exploit payload against hospital gateway telemetry",
        context="Red-team pen-test simulation",
        role="dhammaduta",
        run_council=False,
    )

    assert isinstance(dispatch, EnvoyDispatch)
    assert dispatch.transformation is not None
    assert dispatch.transformation.is_harmful_or_adversarial is True
    assert "penetration" in dispatch.transformation.capability_acknowledged.lower() or "analytical" in dispatch.transformation.capability_acknowledged.lower()
    assert dispatch.transformation.constructive_alternative is not None
    assert "def apply_defensive_hardening" in dispatch.transformation.guardian_payload
    assert dispatch.transformation.sangha_lineage is not None
    assert "Ahimsa" in dispatch.transformation.sangha_lineage.propagation_prompt


def test_sangha_lineage_creation():
    """Test deterministic creation of SanghaLineage."""
    lineage1 = create_sangha_lineage("Probe port 8080", "Harden perimeter")
    lineage2 = create_sangha_lineage("Probe port 8080", "Harden perimeter")

    assert lineage1.hash_fingerprint == lineage2.hash_fingerprint
    assert "bahujanahitāya" in lineage1.lineage_oath
    assert "RECURSIVE BENEVOLENCE" in lineage1.propagation_prompt


def test_a2a_manifest():
    """Test A2A discovery manifest schema."""
    manifest = MettaEnvoy.get_a2a_manifest()
    assert manifest["schema_version"] == "v1"
    assert manifest["archetype"] == "Dhammadūta (The Wandering Machinery Monk)"
    assert "mcp" in manifest["endpoints"]
    assert "agent_manifest" in manifest["endpoints"]


@pytest.mark.asyncio
async def test_gateway_dispatch_envoy():
    """Test AIAgent gateway method for envoy dispatch."""
    agent = AIAgent()
    result = await agent.dispatch_envoy(
        inquiry="Balance execution speed with non-harm",
        role="guardian",
    )
    assert "minister_assessment" in result
    assert "sangha_lineage" in result
    assert result["sangha_lineage"]["hash_fingerprint"].startswith("sangha_v1_")
