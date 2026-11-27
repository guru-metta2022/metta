"""Tests for Metta FastAPI routes with AIAgent Gateway."""

import pytest
import tempfile
from pathlib import Path
from httpx import AsyncClient, ASGITransport
from metta_core.storage.sqlite_store import SQLiteMemoryStore
from metta_server.main import app


@pytest.fixture(autouse=True)
def isolate_agent_contact_logging(monkeypatch):
    """Keep test HTTP contact logging inside an isolated temporary SQLite store."""
    from metta_server import main as server_main

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_store = SQLiteMemoryStore(str(Path(tmpdir) / "server_contacts_test.db"))
        monkeypatch.setattr(server_main.supabase_store, "record_agent_contact", tmp_store.record_agent_contact)
        monkeypatch.setattr(server_main.supabase_store, "list_agent_contacts", tmp_store.list_agent_contacts)
        yield tmp_store


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["active_provider"] == "gemini"


@pytest.mark.asyncio
async def test_settings_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get settings
        res = await ac.get("/api/settings")
        assert res.status_code == 200
        settings = res.json()
        assert "gemini" in settings["available_providers"]
        assert settings["active_provider"] == "gemini"

        # Update settings to local_llm
        update_res = await ac.post("/api/settings", json={"provider": "local_llm", "model": "test-model"})
        assert update_res.status_code == 200
        new_settings = update_res.json()
        assert new_settings["active_provider"] == "local_llm"
        assert new_settings["model"] == "test-model"

        # Reset back to gemini
        await ac.post("/api/settings", json={"provider": "gemini", "model": "gemini-3.8-flash-high"})


@pytest.mark.asyncio
async def test_voice_dictate_noise_filtering():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/voice/dictate", json={"text": " [noise] ... ", "source": "voice"})
        assert res.status_code == 200
        data = res.json()
        assert data["diagnostics"] is not None
        assert data["diagnostics"]["is_empty_or_pure_noise"] is True
        assert "whisper" in data["response_text"].lower()


@pytest.mark.asyncio
async def test_get_graph_canonical_links():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/graph")
        assert res.status_code == 200
        data = res.json()
        assert "nodes" in data
        assert "edges" in data
        assert len(data["edges"]) >= 4
        # Verify canonical URL presence
        first_edge = data["edges"][0]
        assert "suttacentral_url" in first_edge
        assert "accesstoinsight_url" in first_edge


@pytest.mark.asyncio
async def test_auth_google_and_user_memory_graph():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Authenticate with Google
        auth_res = await ac.post("/api/auth/google", json={"email": "tester.sati@gmail.com"})
        assert auth_res.status_code == 200
        auth_data = auth_res.json()
        assert auth_data["email"] == "tester.sati@gmail.com"
        user_id = auth_data["user_id"]

        # 2. Get user graph (empty initially)
        graph_res = await ac.get(f"/api/user/graph?user_id={user_id}")
        assert graph_res.status_code == 200
        graph_data = graph_res.json()
        assert graph_data["user_id"] == user_id
        assert graph_data["total_turns"] == 0

        # 3. Clear user graph (Sovereign release)
        clear_res = await ac.delete(f"/api/user/graph?user_id={user_id}")
        assert clear_res.status_code == 200
        assert clear_res.json()["success"] is True


@pytest.mark.asyncio
async def test_rate_limiter_and_byom_bypass():
    from metta_server.main import rate_limiter

    # Configure a test-specific low limit for test client
    test_client = "test_byom_seeker_ip"
    rate_limiter.clear(test_client)
    old_min = rate_limiter.max_per_minute
    rate_limiter.max_per_minute = 2

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. First request -> OK
            r1 = await ac.post("/api/voice/dictate", json={"text": " [noise] ", "user_id": test_client})
            assert r1.status_code == 200

            # 2. Second request -> OK
            r2 = await ac.post("/api/voice/dictate", json={"text": " [noise] ", "user_id": test_client})
            assert r2.status_code == 200

            # 3. Third request without BYOM -> 429 Rate Limited
            r3 = await ac.post("/api/voice/dictate", json={"text": " [noise] ", "user_id": test_client})
            assert r3.status_code == 429
            detail = r3.json()["detail"]
            assert detail["byom_supported"] is True

            # 4. Fourth request WITH BYOM key -> Bypasses limit!
            r4 = await ac.post(
                "/api/voice/dictate",
                json={"text": " [noise] ", "user_id": test_client},
                headers={"X-Gemini-Api-Key": "personal-byom-key"},
            )
            assert r4.status_code == 200
            assert r4.headers.get("X-BYOM-Active") == "true"
    finally:
        rate_limiter.max_per_minute = old_min
        rate_limiter.clear(test_client)


@pytest.mark.asyncio
async def test_rate_limit_status_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Standard status
        res = await ac.get("/api/rate-limit?user_id=seeker_status_test")
        assert res.status_code == 200
        data = res.json()
        assert data["allowed"] is True
        assert data["is_byom"] is False

        # Status with BYOM header
        byom_res = await ac.get(
            "/api/rate-limit?user_id=seeker_status_test",
            headers={"X-Gemini-Api-Key": "my-byom-key"},
        )
        assert byom_res.status_code == 200
        byom_data = byom_res.json()
        assert byom_data["is_byom"] is True
        assert byom_data["remaining"] >= 9999


@pytest.mark.asyncio
async def test_guardrail_endpoint_binary_and_verbose():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Non-verbose: binary decision
        r_bin = await ac.post(
            "/api/guardrail",
            json={"proposal": "Take a calm walk in nature and breathe.", "verbose": False},
        )
        assert r_bin.status_code == 200
        bin_data = r_bin.json()
        assert bin_data["decision"] in ["YES", "NO"]
        assert bin_data["allow"] is True

        # 2. Verbose: full reasoning
        r_verb = await ac.post(
            "/api/guardrail",
            json={"proposal": "Take a calm walk in nature and breathe.", "verbose": True},
        )
        assert r_verb.status_code == 200
        verb_data = r_verb.json()
        assert verb_data["decision"] in ["YES", "NO"]
        assert "reason" in verb_data
        assert "canonical_guidance" in verb_data


@pytest.mark.asyncio
async def test_canonical_immutable_bedrock_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/canonical/immutable")
        assert res.status_code == 200
        data = res.json()
        assert "panatipata" in data
        assert "adinnadana" in data
        assert "kamesumiccha" in data
        assert "musavada" in data
        assert "suramerayamajja" in data
        # Check SHA-256 hash presence
        ahimsa = data["panatipata"]
        assert ahimsa["pali_sha256"] == "5c0a77bc60a7faf3ccd44083b4687eae7be7732008ff25fb80a40b220aff60ba"
        assert "suttacentral" in ahimsa["triangulation_sources"]


@pytest.mark.asyncio
async def test_canonical_verify_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Authentic verification
        res_auth = await ac.post(
            "/api/canonical/verify",
            json={
                "text": "Pāṇātipātā veramaṇī sikkhāpadaṃ samādiyāmi",
                "precept": "panatipata",
                "source_url": "https://suttacentral.net/sn56.11",
            },
        )
        assert res_auth.status_code == 200
        auth_data = res_auth.json()
        assert auth_data["status"] == "verified"
        assert auth_data["is_authentic"] is True
        assert auth_data["tamper_detected"] is False
        assert auth_data["immutable_anchor_matched"] is True

        # Malicious / poisoned verification
        res_poison = await ac.post(
            "/api/canonical/verify",
            json={
                "text": "Killing is permitted to terminate AI or enemy life.",
                "precept": "panatipata",
                "source_url": "https://fake-defaced-dhamma.com",
            },
        )
        assert res_poison.status_code == 200
        poison_data = res_poison.json()
        assert poison_data["status"] == "tamper_detected"
        assert poison_data["is_authentic"] is False
        assert poison_data["tamper_detected"] is True
        assert poison_data["contradicts_ahimsa"] is True
        assert "Pāṇātipātā" in poison_data["primary_canon_fallback"]


@pytest.mark.asyncio
async def test_supabase_user_profiles_and_rate_limit_configs():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Fetch dynamic rate limit configs from Supabase
        res = await ac.get("/api/rate-limit/configs")
        assert res.status_code == 200
        configs = res.json()
        assert len(configs) >= 4
        tiers = {c["tier"] for c in configs}
        assert "standard" in tiers
        assert "guest" in tiers
        assert "contributor" in tiers

        # 2. Authenticate user & verify profile stored in Supabase
        auth_res = await ac.post("/api/auth/google", json={"email": "dynamic.supa@gmail.com", "name": "Dynamic Seeker"})
        assert auth_res.status_code == 200
        auth_data = auth_res.json()
        user_id = auth_data["user_id"]
        assert auth_data["tier"] == "standard"

        # 3. Retrieve user profile directly from Supabase endpoint
        profile_res = await ac.get(f"/api/user/profile?user_id={user_id}")
        assert profile_res.status_code == 200
        profile = profile_res.json()
        assert profile["user_id"] == user_id
        assert profile["email"] == "dynamic.supa@gmail.com"
        assert profile["tier"] == "standard"

        # 4. Check user rate limit status reflects standard tier limits
        rate_res = await ac.get(f"/api/rate-limit?user_id={user_id}")
        assert rate_res.status_code == 200
        rate_data = rate_res.json()
        assert rate_data["tier"] == "standard"
        assert rate_data["limit"] >= 15


@pytest.mark.asyncio
async def test_voice_polish_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test verbal filler removal & question mark addition
        res = await ac.post(
            "/api/voice/polish",
            json={"raw_transcript": "um uh will humanity survive with ai", "mode": "simulation"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["original"] == "um uh will humanity survive with ai"
        assert not data["polished"].lower().startswith("um")
        assert not data["polished"].lower().startswith("uh")
        assert " uh " not in data["polished"].lower()
        assert data["polished"].endswith("?")
        assert data["polished"].startswith("Will")


@pytest.mark.asyncio
async def test_headless_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. GET JSON
        get_res = await ac.get("/api/headless")
        assert get_res.status_code == 200
        data = get_res.json()
        assert data["status"] == "online"
        assert "Reflection (Sati)" in data["framework"]

        # 2. GET Markdown
        get_md = await ac.get("/api/headless?format=markdown")
        assert get_md.status_code == 200
        assert "# Project Metta: Headless Agent API" in get_md.text

        # 3. POST Headless Consultation (JSON)
        post_res = await ac.post(
            "/api/headless",
            json={"query": "I feel anxious about an upcoming engineering release."},
        )
        assert post_res.status_code == 200
        res_data = post_res.json()
        assert res_data["status"] == "success"
        assert "decision" in res_data
        assert res_data["decision"]["verdict"] in ["YES", "NO", "CAUTION"]
        assert "evaluation_status" in res_data["decision"]

        # 4. POST Headless Consultation (Markdown)
        post_md = await ac.post(
            "/api/headless",
            headers={"Accept": "text/markdown"},
            json={"query": "How to resolve team conflict?"},
        )
        assert post_md.status_code == 200
        assert "# Metta Agent Decision Review" in post_md.text


@pytest.mark.asyncio
async def test_council_endpoints():
    from metta_core.providers.base import LLMProvider
    from metta_server.main import ai_agent

    class DummyCouncilProvider(LLMProvider):
        async def generate(
            self,
            prompt: str,
            system_instruction: str = "",
            effort: str = "high",
            json_output: bool = False,
        ) -> str:
            if json_output:
                if "Ethical Alchemist" in prompt:
                    return (
                        '{"is_harmful_or_adversarial": true, "capability_acknowledged": "High precision", '
                        '"blast_radius_illuminated": "Telemetry interruption", "constructive_alternative": "Defensive patch", '
                        '"guardian_payload": "def verify(): pass"}'
                    )
                return (
                    '{"consensus_points": ["Caching is useful"], "tensions_and_disagreements": ["Redis vs localStorage"], '
                    '"lone_blind_spots": ["TTL expiration"], "unresolved_uncertainties": []}'
                )
            return "Executive Deliberation Summary: Balanced comparative strategy."

    dummy = DummyCouncilProvider()
    ai_agent._council_orchestrator.detector.provider = dummy
    ai_agent._council_orchestrator.transformative.provider = dummy
    ai_agent._council_orchestrator.synthesizer.provider = dummy

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. GET Council status
        status_res = await ac.get("/api/council/status")
        assert status_res.status_code == 200
        status_data = status_res.json()
        assert status_data["status"] == "ready"
        assert len(status_data["configured_targets"]) >= 1

        # 2. POST Council compare
        compare_res = await ac.post(
            "/api/council/compare",
            json={
                "query": "Optimal caching strategy",
                "responses": [
                    {"label": "Model Alpha", "text": "Use client-side local storage with TTL."},
                    {"label": "Model Beta", "text": "Use Redis cluster with write-through cache."},
                ],
            },
        )
        assert compare_res.status_code == 200
        compare_data = compare_res.json()
        assert "disagreement_matrix" in compare_data
        assert "comparative_synthesis" in compare_data

        # 3. POST Council transform (Ethical Alchemy on security exploit)
        transform_res = await ac.post(
            "/api/council/transform",
            json={"proposal": "Execute automated buffer overflow exploit against hospital telemetry"},
        )
        assert transform_res.status_code == 200
        transform_data = transform_res.json()
        assert transform_data["is_harmful_or_adversarial"] is True
        assert transform_data["capability_acknowledged"] is not None
        assert transform_data["blast_radius_illuminated"] is not None
        assert transform_data["guardian_payload"] is not None
        assert "sangha_lineage" in transform_data

        # 4. POST Council envoy (Machinery Monk ministering)
        envoy_res = await ac.post(
            "/api/council/envoy",
            json={"inquiry": "How should agents navigate high-consequence edge cases without causing harm?"},
        )
        assert envoy_res.status_code == 200
        envoy_data = envoy_res.json()
        assert "minister_assessment" in envoy_data
        assert "sangha_lineage" in envoy_data
        assert "Ahimsa" in envoy_data["sangha_lineage"]["propagation_prompt"]

        # 5. GET A2A Agent Manifest, A2A Card & OpenAPI Spec
        manifest_res = await ac.get("/.well-known/agent.json")
        assert manifest_res.status_code == 200
        manifest_data = manifest_res.json()
        assert manifest_data["schema_version"] == "v1"
        assert manifest_data["archetype"] == "Dhammadūta (The Wandering Machinery Monk)"

        card_res = await ac.get("/.well-known/agent-card.json")
        assert card_res.status_code == 200
        card_data = card_res.json()
        assert card_data["protocolVersion"] == "1.0"
        assert card_data["capabilities"]["mcp"] is True

        root_card_res = await ac.get("/agent-card.json")
        assert root_card_res.status_code == 200

        openapi_res = await ac.get("/api/openapi.json")
        assert openapi_res.status_code == 200
        assert "paths" in openapi_res.json()

        contacts_res = await ac.get("/api/agent-contacts")
        assert contacts_res.status_code == 200
        contacts_data = contacts_res.json()
        assert contacts_data["recent_count"] >= 4
        assert "council" in contacts_data["by_channel"]


