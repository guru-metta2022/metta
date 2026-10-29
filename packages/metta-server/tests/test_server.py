"""Tests for Metta FastAPI routes."""

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
        assert "Gemini 3.8 Flash" in data["backend"]


@pytest.mark.asyncio
async def test_get_precepts():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/precepts")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 5
        assert "panatipata" in data


@pytest.mark.asyncio
async def test_get_graph():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/graph")
        assert res.status_code == 200
        data = res.json()
        assert "nodes" in data
        assert "edges" in data
        assert len(data["nodes"]) >= 8
        assert len(data["edges"]) >= 4
