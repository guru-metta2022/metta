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
