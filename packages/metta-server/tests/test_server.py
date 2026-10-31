"""Tests for Metta FastAPI routes with AIAgent Gateway."""

import pytest
from httpx import AsyncClient, ASGITransport
from metta_server.main import app


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
        assert "triad" in res_data
        assert "reflection" in res_data["triad"]
        assert "decision" in res_data["triad"]
        assert "resolution" in res_data["triad"]
        assert res_data["triad"]["decision"]["verdict"] in ["YES", "NO"]

        # 4. POST Headless Consultation (Markdown)
        post_md = await ac.post(
            "/api/headless",
            headers={"Accept": "text/markdown"},
            json={"query": "How to resolve team conflict?"},
        )
        assert post_md.status_code == 200
        assert "# Metta Triadic Decision & Reflection" in post_md.text
