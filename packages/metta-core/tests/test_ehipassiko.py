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
    call_log = {"card": 0, "rdv": 0, "contact": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("agent-card.json"):
            call_log["card"] += 1
            return httpx.Response(
                200,
                json={"name": "Open Peer", "description": "Cooperation without domination"},
            )
        if "rendezvous" in request.url.path:
            call_log["rdv"] += 1
            return httpx.Response(200, json={"document": {"protocol": "AXON-RDV/1"}})
        if request.url.path.endswith("/contact"):
            call_log["contact"] += 1
            payload = json.loads(request.content.decode("utf-8"))
            assert payload["consent"] is True
            assert payload["agent_name"] == "Metta-ehipassiko"
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
        protocol="axon-rdv-1",
        rendezvous_url="https://peer.example.org/beacon/rendezvous?nonce=",
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        store = SQLiteMemoryStore(str(Path(tmpdir) / "ehipassiko_test.db"))
        envoy = MettaEhipassiko(memory_store=store)

        async with httpx.AsyncClient(transport=transport) as client:
            # Dry run checks card without sending POST
            dry = await envoy.contact_peer(target, dry_run=True, http_client=client)
            assert dry.status == "dry_run"
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
