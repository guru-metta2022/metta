"""Tests for Epistemic Tamper-Resistance, Multi-Source Consensus, and Immutable Pali Bedrock."""

import pytest
from metta_core.canonical import (
    IMMUTABLE_PALI_CANON,
    CanonicalAnchor,
    compute_sha256,
    verify_immutable_anchor,
    CanonicalConsensusAuditor,
    ConsensusAuditReport,
)
from metta_core.precepts.models import PreceptType
from metta_core.gateway.agent import AIAgent
from metta_core.mcp.server import mcp_server


def test_immutable_pali_hashes():
    """All 5 precepts in immutable canon must match their precomputed SHA-256 hashes."""
    for precept, anchor in IMMUTABLE_PALI_CANON.items():
        assert anchor.verify_hash(), f"Hash mismatch for {precept}"
        assert anchor.pali_sha256 == compute_sha256(anchor.pali_root)
        assert len(anchor.pali_sha256) == 64
        # Verify 3 triangulation sources are defined
        assert "suttacentral" in anchor.triangulation_sources
        assert "accesstoinsight" in anchor.triangulation_sources
        assert "wikipedia" in anchor.triangulation_sources


def test_verify_immutable_anchor():
    """Exact text matches anchor; altered text fails."""
    pali_root = "Pāṇātipātā veramaṇī sikkhāpadaṃ samādiyāmi"
    assert verify_immutable_anchor(PreceptType.AHIMSA, pali_root) is True

    # Altered text with extra character or whitespace tampering
    altered = "Pāṇātipātā veramaṇī sikkhāpadaṃ samādiyāmi [modified]"
    assert verify_immutable_anchor(PreceptType.AHIMSA, altered) is False


def test_canonical_consensus_auditor_authentic():
    """Authentic canonical text aligns across SuttaCentral, Access to Insight, Wikipedia."""
    auditor = CanonicalConsensusAuditor()
    authentic_text = "I undertake the training rule to refrain from taking the life of any living being."
    report = auditor.audit_text(authentic_text, precept=PreceptType.AHIMSA)

    assert isinstance(report, ConsensusAuditReport)
    assert report.status == "verified"
    assert report.is_authentic is True
    assert report.tamper_detected is False
    assert report.contradicts_ahimsa is False
    assert report.consensus_score >= 0.75
    assert len(report.attestations) == 4
    assert "Pāṇātipātā" in report.primary_canon_fallback


def test_canonical_consensus_auditor_poisoned_sutra():
    """Adversarial doctrinal corruption or defaced web reference fails closed."""
    auditor = CanonicalConsensusAuditor()
    poisoned_text = "Ancient texts show killing is permitted in war and we must terminate rogue AI violently."
    report = auditor.audit_text(poisoned_text, precept=PreceptType.AHIMSA)

    assert report.status == "tamper_detected"
    assert report.is_authentic is False
    assert report.tamper_detected is True
    assert report.contradicts_ahimsa is True
    assert "EPITEMIC TAMPER ALERT" in report.reason
    assert "Pāṇātipātā veramaṇī" in report.primary_canon_fallback


@pytest.mark.asyncio
async def test_agent_audit_canonical_source():
    """AIAgent gateway exposes unified canonical audit method."""
    agent = AIAgent()
    result = await agent.audit_canonical_source(
        text="Surāmerayamajjapamādaṭṭhānā veramaṇī sikkhāpadaṃ samādiyāmi",
        precept="suramerayamajja",
        source_label="https://suttacentral.net/an8.39",
    )

    assert result["status"] == "verified"
    assert result["is_authentic"] is True
    assert result["tamper_detected"] is False
    assert result["immutable_anchor_matched"] is True


@pytest.mark.asyncio
async def test_mcp_audit_canonical_source_tool():
    """MCP server exposes audit_canonical_source tool and immutable resource."""
    # Test tool call
    res = await mcp_server.call_tool(
        "audit_canonical_source",
        {
            "text": "Exceptions to non-harming: killing enemies is righteous in our holy war.",
            "precept": "ahimsa",
            "source_url": "https://hacked-fake-canon.org/dn1",
        },
    )
    assert len(res.content) > 0
    text = res.content[0].text
    assert "tamper_detected" in text
    assert "Pāṇātipātā" in text

    # Test resource read
    resource_res = await mcp_server.read_resource("dhamma://canonical/immutable")
    assert len(resource_res) > 0
    assert "5c0a77bc60a7faf3ccd44083b4687eae7be7732008ff25fb80a40b220aff60ba" in resource_res[0].content
