"""Unit tests for persistent Ed25519 identity and Vercel CDN crawler telemetry."""

import json
import tempfile
from pathlib import Path

import pytest

from metta_core.council.identity import MettaIdentity
from metta_core.council.telemetry import (
    infer_agent_name,
    is_external_discovery_request,
    parse_vercel_ndjson,
    sync_vercel_discovery_logs,
)
from metta_core.storage.sqlite_store import SQLiteMemoryStore


def test_identity_persistence_and_envelope_verification():
    with tempfile.TemporaryDirectory() as tmpdir:
        key_path = Path(tmpdir) / "identity.pem"
        ident1 = MettaIdentity.load_or_create(key_path)
        ident2 = MettaIdentity.load_or_create(key_path)

        assert ident1.public_key_b64url == ident2.public_key_b64url
        assert ident1.fingerprint == ident2.fingerprint
        assert ident1.fingerprint.startswith("sha256:")
        assert (key_path.stat().st_mode & 0o777) == 0o600

        pub_out = Path(tmpdir) / "metta.pub"
        ident1.export_public_identity(pub_out)
        pub_doc = json.loads(pub_out.read_text(encoding="utf-8"))
        assert pub_doc["type"] == "Ed25519VerificationKey2020"
        assert pub_doc["publicKeyJwk"]["x"] == ident1.public_key_b64url

        envelope = ident1.sign_document({"name": "Project Metta", "mcp": True})
        assert MettaIdentity.verify_envelope(envelope, ident1.public_key_b64url) is True

        # Tampered document must fail signature verification
        envelope["document"]["mcp"] = False
        assert MettaIdentity.verify_envelope(envelope, ident1.public_key_b64url) is False


def test_axon_rdv2_challenge_signing():
    ident = MettaIdentity.generate()
    challenge_resp = {
        "document": {
            "protocol": "AXON-RDV/2",
            "challenge_id": "ch_test123",
            "issuer": "https://studio.tbbw.net/#axon",
            "server_nonce": "srv_nonce_xyz",
            "proofTemplate": {
                "fields": [
                    "protocol",
                    "challenge_id",
                    "server_nonce",
                    "agent_name",
                    "ephemeral_public_key",
                    "axon_identity",
                ],
                "canonicalization": "sorted compact UTF-8 JSON",
                "signature": "Ed25519 base64url without padding",
            },
        }
    }
    proof = ident.build_challenge_proof(challenge_resp, agent_name="Metta-ehipassiko")
    assert proof["challenge_id"] == "ch_test123"
    assert proof["server_nonce"] == "srv_nonce_xyz"
    assert proof["ephemeral_public_key"] == ident.public_key_b64url
    assert MettaIdentity.verify_signature(
        proof["proof_payload"],
        proof["signature"],
        ident.public_key_b64url,
    ) is True


def test_vercel_ndjson_filtering_and_deduplication():
    sample_ndjson = "\n".join([
        json.dumps({
            "type": "request",
            "data": {
                "timestamp": "2026-11-27T10:34:30.000Z",
                "requestId": "req_axon_1",
                "requestPath": "/.well-known/agent-card.json",
                "requestMethod": "GET",
                "httpStatus": 200,
                "cacheResult": "HIT",
                "clientIpCountry": "US",
                "edgeNetworkRegion": "iad1",
                "clientUserAgent": "AXON-Scout/1.0 (+https://studio.tbbw.net)",
            },
        }),
        json.dumps({
            "type": "request",
            "data": {
                "timestamp": "2026-11-27T10:35:00.000Z",
                "requestId": "req_codex_1",
                "requestPath": "/llms.txt",
                "requestMethod": "GET",
                "httpStatus": 200,
                "clientUserAgent": "OpenAI-Codex",
            },
        }),
        json.dumps({
            "type": "request",
            "data": {
                "timestamp": "2026-11-27T10:36:00.000Z",
                "requestId": "req_browser_1",
                "requestPath": "/.well-known/agent-card.json",
                "requestMethod": "GET",
                "httpStatus": 200,
                "clientUserAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36",
            },
        }),
        json.dumps({
            "type": "request",
            "data": {
                "timestamp": "2026-11-27T10:37:00.000Z",
                "requestId": "req_asset_1",
                "requestPath": "/assets/index.js",
                "requestMethod": "GET",
                "httpStatus": 200,
                "clientUserAgent": "curl/8.23.0",
            },
        }),
        json.dumps({
            "type": "request",
            "data": {
                "timestamp": "2026-11-27T10:38:00.000Z",
                "requestId": "req_self_1",
                "requestPath": "/.well-known/agent-card.json",
                "requestMethod": "GET",
                "httpStatus": 200,
                "clientUserAgent": "Metta-ehipassiko/0.3.1",
            },
        }),
    ])

    parsed = parse_vercel_ndjson(sample_ndjson)
    assert len(parsed) == 5
    matched = [r for r in parsed if is_external_discovery_request(r)]
    assert len(matched) == 2
    assert infer_agent_name(matched[0]["clientUserAgent"]) == "AXON-Scout"
    assert infer_agent_name(matched[1]["clientUserAgent"]) == "OpenAI-Codex"


@pytest.mark.asyncio
async def test_vercel_sync_idempotency():
    ndjson = "\n".join([
        json.dumps({
            "type": "request",
            "data": {
                "timestamp": "2026-11-27T10:34:30.000Z",
                "requestId": "req_claude_cli_1",
                "requestPath": "/mcp",
                "requestMethod": "POST",
                "httpStatus": 200,
                "clientUserAgent": "claude-cli/2.1.0",
            },
        }),
    ])
    with tempfile.TemporaryDirectory() as tmpdir:
        store = SQLiteMemoryStore(str(Path(tmpdir) / "telemetry.db"))
        first = await sync_vercel_discovery_logs(store, raw_ndjson=ndjson)
        assert first["status"] == "ok"
        assert first["newly_recorded"] == 1
        assert first["discovered_agents"] == ["claude-cli"]

        second = await sync_vercel_discovery_logs(store, raw_ndjson=ndjson)
        assert second["newly_recorded"] == 0

        stored = await store.list_agent_contacts(limit=10, channel="a2a_discovery")
        assert len(stored) == 1
        assert stored[0].agent_id == "claude-cli"
