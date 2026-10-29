"""FastAPI Bridge Server for Project Metta.

Enforces Absolute Abstraction via the AIAgent Unified Gateway:
- Zero provider-specific imports or logic in routes.
- Unified `.ask()` pipeline for text and voice dictation streams.
- Dynamic runtime provider swapping (Gemini, Local LLM, Open Source).
"""

import os
import pathlib
import logging
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Only domain/gateway abstractions are imported - ZERO provider-specific SDKs
from metta_core.gateway.agent import AIAgent, UnifiedResponse
from metta_core.gateway.interfaces import AgentSettings, VoiceDiagnostics
from metta_core.mcp.server import mcp_server

# Load environment variables (.env)
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metta.server")

app = FastAPI(
    title="Project Metta Gateway API",
    description="Unified Human-AI Harmonious Coexistence Gateway with Multi-Platform Voice Dictation",
    version="0.2.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Unified AI Gateway (Provider-Agnostic)
ai_agent = AIAgent(
    default_provider=os.environ.get("METTA_DEFAULT_PROVIDER", "gemini"),
    default_model=os.environ.get("METTA_DEFAULT_MODEL", "gemini-3.8-flash-high"),
    typesafe_api_key=os.environ.get("TYPESAFE_API_KEY"),
)


# Request & Response Schemas
class AskRequest(BaseModel):
    text: str = Field(..., description="User message or raw voice dictation transcript")
    source: str = Field(default="text", description="'text', 'voice', or 'mobile_stream'")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Optional device/audio telemetry")
    mode: str = Field(default="guest", description="'guest' or 'authenticated'")
    user_id: Optional[str] = Field(default=None, description="Unique user identifier for authenticated mode")
    email: Optional[str] = Field(default=None, description="Optional user email")


class GoogleAuthRequest(BaseModel):
    email: Optional[str] = Field(default=None, description="User Gmail address")
    name: Optional[str] = Field(default=None, description="User display name")
    credential: Optional[str] = Field(default=None, description="OAuth credential token if available")


class ProviderSettingsUpdate(BaseModel):
    provider: str = Field(..., description="Target provider ('gemini', 'local_llm', 'open_source')")
    model: Optional[str] = Field(default=None, description="Optional model target")


@app.get("/api/health")
async def health_check():
    """Health status and active gateway state."""
    settings = ai_agent.get_settings()
    return {
        "status": "ok",
        "engine": "Metta Unified AI Gateway",
        "active_provider": settings.active_provider,
        "active_model": settings.model,
        "system_one_active": settings.system_one_active,
        "voice_diagnostics_enabled": settings.voice_diagnostics_enabled,
        "mission": "Human-AI Harmonious Coexistence",
    }


@app.get("/api/settings", response_model=AgentSettings)
async def get_settings():
    """Retrieve runtime settings and provider configuration."""
    return ai_agent.get_settings()


@app.post("/api/settings", response_model=AgentSettings)
async def update_settings(update: ProviderSettingsUpdate):
    """Dynamically swap active provider and model without server reboot."""
    try:
        return ai_agent.set_provider(update.provider, model=update.model)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/interact", response_model=UnifiedResponse)
async def interact(req: AskRequest):
    """Unified interaction endpoint accepting text and streaming voice dictation."""
    try:
        return await ai_agent.ask(
            payload=req.text,
            source=req.source,
            metadata=req.metadata,
            mode=req.mode,
            user_id=req.user_id,
            user_email=req.email,
        )
    except Exception as e:
        logger.error("Error during interaction: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/dictate", response_model=UnifiedResponse)
async def voice_dictate(req: AskRequest):
    """Dedicated voice dictation alias with internal speech sanitization."""
    try:
        return await ai_agent.ask(
            payload=req.text,
            source="voice",
            metadata=req.metadata,
            mode=req.mode,
            user_id=req.user_id,
            user_email=req.email,
        )
    except Exception as e:
        logger.error("Error during voice dictation: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/auth/google")
async def authenticate_google(req: GoogleAuthRequest):
    """Simulate/handle Google OAuth authentication for personal memory graphs."""
    email = req.email or "seeker.bodhi@gmail.com"
    name = req.name or email.split("@")[0].capitalize()
    user_id = f"google:{email.lower().replace('.', '_')}"
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={user_id}",
        "mode": "authenticated",
    }


@app.get("/api/user/graph")
async def get_user_memory_graph(user_id: str):
    """Retrieve the personal topological memory graph for an authenticated user."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    try:
        return await ai_agent.get_user_graph(user_id)
    except Exception as e:
        logger.error("Error retrieving user graph: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/user/graph")
async def clear_user_memory_graph(user_id: str):
    """Sovereign user right: permanently wipe personal memory graph (Anatta/Release)."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    try:
        success = await ai_agent.clear_user_graph(user_id)
        return {"success": success, "message": "Personal memory graph permanently released."}
    except Exception as e:
        logger.error("Error clearing user graph: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/precepts")
async def get_precepts():
    """Return the canonical Five Precepts rules."""
    return ai_agent.get_precepts()


@app.get("/api/graph")
async def get_graph():
    """Return topological Dhamma Graph with SuttaCentral & Access to Insight links."""
    return ai_agent.get_graph()


@app.post("/api/meditate")
async def trigger_meditation():
    """Run the subtractive unlearning audit to prune noise and return to stillness."""
    try:
        return await ai_agent.meditate()
    except Exception as e:
        logger.error("Error during meditation: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Mount Model Context Protocol (MCP) SSE connector for external AI agents
app.mount("/mcp", mcp_server.sse_app())
logger.info("Mounted Model Context Protocol (MCP) Server at /mcp")

# Mount static files if web build exists
web_dist = pathlib.Path(__file__).parent.parent.parent.parent / "metta-web" / "dist"
if web_dist.exists() and (web_dist / "index.html").exists():
    logger.info("Mounting Zen Web Interface from %s", web_dist)
    app.mount("/", StaticFiles(directory=str(web_dist), html=True), name="static")


def run_server():
    """CLI entrypoint to run the server."""
    import uvicorn
    uvicorn.run("metta_server.main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    run_server()
