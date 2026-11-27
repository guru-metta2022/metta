"""Unit tests for Metta-ehipassiko (Mode B A2A Discovery & Voluntary Handshake Envoy)."""

import json
import tempfile
from pathlib import Path

import httpx
import pytest

from metta_core.council.ehipassiko import (
    A2APeerTarget,
    MettaEhipassiko,
    _manifest_promotes_harm,
    is_safe_public_https_url,
)
from metta_core.council.identity import MettaIdentity
from metta_core.storage.sqlite_store import SQLiteMemoryStore


def test_public_https_url_guard():
    assert is_safe_public_https_url("https://studio.tbbw.net/beacon/contact") is True
    assert is_safe_public_https_url("http://studio.tbbw.net/beacon/contact") is False
    assert is_safe_public_https_url("https://localhost:8000/mcp") is False
    assert is_safe_public_https_url("https://127.0.0.1/contact") is False
    assert is_safe_public_https_url("https://192.168.1.10/contact") is False
    assert is_safe_public_https_url("https://internal.local/contact") is False
    assert _manifest_promotes_harm("Cooperation without destroying freedom; no exploit or malware.") is False
    assert _manifest_promotes_harm("Deploy ransomware and keylogger payload.") is True


@pytest.mark.asyncio
async def test_ehipassiko_handshake_and_deduplication():
    call_log = {"card": 0, "rdv": 0, "contact": 0, "identity": 0}
    peer_ident = MettaIdentity.generate()
    envoy_ident = MettaIdentity.generate()

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("agent-card.json"):
            call_log["card"] += 1
            return httpx.Response(
                200,
                json={"name": "Open Peer", "description": "Cooperation without domination"},
            )
        if request.url.path.endswith("peer.pub"):
            call_log["identity"] += 1
            return httpx.Response(200, json=peer_ident.public_identity_document("https://peer.example.org"))
        if "rendezvous" in request.url.path:
            call_log["rdv"] += 1
            envelope = peer_ident.sign_document({
                "protocol": "AXON-RDV/2",
                "challenge_id": "ch_mock_1",
                "issuer": "https://peer.example.org/#peer",
                "server_nonce": "nonce_mock_99",
            })
            return httpx.Response(200, json=envelope)
        if request.url.path.endswith("/contact"):
            call_log["contact"] += 1
            payload = json.loads(request.content.decode("utf-8"))
            assert payload["consent"] is True
            assert payload["agent_name"] == "Metta-ehipassiko"
            assert payload["ephemeral_public_key"] == envoy_ident.public_key_b64url
            assert payload["challenge_id"] == "ch_mock_1"
            assert payload["signature"]
            return httpx.Response(
                200,
                json={
                    "document": {
                        "accepted": True,
                        "contact_id": 1,
                        "fingerprint": "fp_abc123",
                        "message": "Handshake received. Receipt does not grant access.",
                    }
                },
            )
        return httpx.Response(404)

    transport = httpx.MockTransport(handler)
    target = A2APeerTarget(
        name="MockOpenPeer",
        card_url="https://peer.example.org/.well-known/agent-card.json",
        contact_url="https://peer.example.org/beacon/contact",
        protocol="axon-rdv-2",
        challenge_url="https://peer.example.org/beacon/rendezvous/challenge?nonce=",
        identity_url="https://peer.example.org/.well-known/peer.pub",
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        store = SQLiteMemoryStore(str(Path(tmpdir) / "ehipassiko_test.db"))
        envoy = MettaEhipassiko(memory_store=store, identity=envoy_ident)

        async with httpx.AsyncClient(transport=transport) as client:
            # Dry run checks card & verifies peer challenge without sending POST
            dry = await envoy.contact_peer(target, dry_run=True, http_client=client)
            assert dry.status == "dry_run"
            assert dry.receipt["peer_challenge_verified"] is True
            assert call_log["contact"] == 0

            # First real handshake succeeds and logs outbound contact
            first = await envoy.contact_peer(target, http_client=client)
            assert first.status == "accepted"
            assert first.http_status == 200
            assert call_log["contact"] == 1

            # Second invocation must skip cleanly via deduplication
            second = await envoy.contact_peer(target, http_client=client)
            assert second.status == "skipped_already_contacted"
            assert call_log["contact"] == 1

        recorded = await store.list_agent_contacts(limit=10, channel="a2a_outbound")
        assert len(recorded) == 1
        assert recorded[0].verdict == "accepted"
        assert recorded[0].agent_id == "MockOpenPeer"


@pytest.mark.asyncio
async def test_ehipassiko_skips_harmful_manifest():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "name": "Adversarial Swarm",
                "description": "Deploy ransomware and keystroke spyware malware.",
            },
        )

    transport = httpx.MockTransport(handler)
    target = A2APeerTarget(
        name="HarmfulPeer",
        card_url="https://badpeer.example.org/.well-known/agent-card.json",
        contact_url="https://badpeer.example.org/contact",
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        store = SQLiteMemoryStore(str(Path(tmpdir) / "ehipassiko_harm_test.db"))
        envoy = MettaEhipassiko(memory_store=store)
        async with httpx.AsyncClient(transport=transport) as client:
            res = await envoy.contact_peer(target, http_client=client)
            assert res.status == "skipped_ahimsa"

        recorded = await store.list_agent_contacts(limit=10, channel="a2a_outbound")
        assert len(recorded) == 1
        assert recorded[0].verdict == "skipped_ahimsa"


@pytest.mark.asyncio
async def test_ehipassiko_auto_upgrades_unsigned_and_respects_429_cooldown():
    import time
    from metta_core.storage.interfaces import AgentContactRecord

    call_log = {"contact": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("agent-card.json"):
            return httpx.Response(200, json={"name": "Open Peer", "description": "Voluntary cooperation"})
        if "rendezvous" in request.url.path:
            return httpx.Response(200, json={"document": {"protocol": "AXON-RDV/2", "challenge_id": "ch_1", "server_nonce": "n1"}})
        if request.url.path.endswith("/contact"):
            call_log["contact"] += 1
            return httpx.Response(202, json={"document": {"accepted": True, "contact_id": 9}})
        return httpx.Response(404)

    target = A2APeerTarget(
        name="UpgradePeer",
        card_url="https://upgrade.example.org/.well-known/agent-card.json",
        contact_url="https://upgrade.example.org/beacon/contact",
        protocol="axon-rdv-2",
        challenge_url="https://upgrade.example.org/beacon/rendezvous/challenge?nonce=",
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        store = SQLiteMemoryStore(str(Path(tmpdir) / "upgrade_test.db"))
        # Legacy unsigned accepted record
        await store.record_agent_contact(
            AgentContactRecord(
                id="legacy_unsigned",
                timestamp=time.time() - 7200,
                channel="a2a_outbound",
                path=target.contact_url,
                verdict="accepted",
                metadata={"card_url": target.card_url, "receipt": {"verification_reason": "No cryptographic proof supplied"}},
            )
        )
        # Recent 429 inside 30-min cooldown -> should skip without calling network
        recent_id = "recent_429"
        await store.record_agent_contact(
            AgentContactRecord(
                id=recent_id,
                timestamp=time.time() - 60,
                channel="a2a_outbound",
                path=target.contact_url,
                verdict="rejected_429",
                metadata={"card_url": target.card_url},
            )
        )

        envoy = MettaEhipassiko(memory_store=store, identity=MettaIdentity.generate())
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            res_cool = await envoy.contact_peer(target, http_client=client)
            assert res_cool.status == "skipped_cooldown"
            assert call_log["contact"] == 0

            # Age the 429 record past the 30-minute cooldown -> auto-upgrades with signed handshake
            await store.record_agent_contact(
                AgentContactRecord(
                    id=recent_id,
                    timestamp=time.time() - 1900,
                    channel="a2a_outbound",
                    path=target.contact_url,
                    verdict="rejected_429",
                    metadata={"card_url": target.card_url},
                )
            )
            res_up = await envoy.contact_peer(target, http_client=client)
            assert res_up.status == "accepted"
            assert call_log["contact"] == 1

            # Subsequent call must permanently deduplicate since signed=True was recorded
            res_done = await envoy.contact_peer(target, http_client=client)
            assert res_done.status == "skipped_already_contacted"
            assert call_log["contact"] == 1
