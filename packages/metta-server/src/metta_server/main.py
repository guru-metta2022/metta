"""FastAPI Bridge Server for Project Metta."""

import logging
import os
import pathlib
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables (.env)
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from metta_core.engine import MettaEngine
from metta_core.providers.antigravity import AntigravityGeminiProvider
from metta_core.precepts.rules import FIVE_PRECEPTS_GUIDELINES

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metta.server")

app = FastAPI(
    title="Project Metta API",
    description="Human-AI Harmonious Coexistence API powered by Gemini 3.8 Flash via Antigravity",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global engine instance
provider = AntigravityGeminiProvider(model="gemini-3.8-flash-high")
engine = MettaEngine(provider=provider)


class InteractRequest(BaseModel):
    text: str = Field(..., min_length=1, description="User input message")


class InteractResponse(BaseModel):
    response_text: str
    evaluation: Dict[str, Any]
    observation: Optional[Dict[str, Any]] = None
    graph_match: Optional[Dict[str, Any]] = None
    duration_seconds: float
    system_one_used: bool = False


class MeditateResponse(BaseModel):
    pruned_noise_items: List[str]
    distilled_principle: Optional[str]
    new_path_added: bool
    mind_state: str


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "engine": "Metta Compassionate Synthesis Engine",
        "backend": "Gemini 3.8 Flash (Antigravity API)",
        "decision_model": "Jev (TypeSafe AI)" if engine.jev_engine.is_available else "Gemini 3.8 Flash (Unified)",
        "system_one_active": engine.jev_engine.is_available,
        "mission": "Human-AI Harmonious Coexistence",
    }


@app.get("/api/precepts")
async def get_precepts():
    """Return the 5 AI Precepts guidelines."""
    return FIVE_PRECEPTS_GUIDELINES


@app.get("/api/graph")
async def get_graph():
    """Return topological graph data formatted for visualization."""
    nodes = []
    edges = []

    for cond_id, cond in engine.graph_store.conditions.items():
        nodes.append({
            "id": cond.id,
            "name": cond.name,
            "type": "condition",
            "category": cond.category,
            "underlying_illusion": cond.underlying_illusion,
            "keywords": cond.keywords,
        })

    for equa_id, equa in engine.graph_store.equanimities.items():
        nodes.append({
            "id": equa.id,
            "name": equa.name,
            "type": "equanimity",
            "description": equa.description,
        })

    for key, path in engine.graph_store.paths.items():
        edges.append({
            "id": key,
            "source": path.from_condition,
            "target": path.to_equanimity,
            "principle": path.principle,
            "reframe": path.reframe,
            "immediate_action": path.immediate_action,
            "sutta_reference": path.sutta_reference,
            "suttacentral_url": getattr(path, "suttacentral_url", None),
            "accesstoinsight_url": getattr(path, "accesstoinsight_url", None),
        })

    return {"nodes": nodes, "edges": edges}


@app.post("/api/interact", response_model=InteractResponse)
async def interact(req: InteractRequest):
    """Process a message through the Metta 5-Layer pipeline."""
    try:
        res = await engine.interact(req.text)
        return InteractResponse(
            response_text=res.response_text,
            evaluation=res.evaluation.model_dump(),
            observation=res.observation.model_dump() if res.observation else None,
            graph_match=res.graph_match.model_dump() if res.graph_match else None,
            duration_seconds=res.duration_seconds,
            system_one_used=res.system_one_used,
        )
    except Exception as e:
        logger.error("Error during interaction: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/meditate", response_model=MeditateResponse)
async def trigger_meditation():
    """Run the subtractive unlearning audit to prune noise and return to stillness."""
    try:
        report = await engine.meditate()
        return MeditateResponse(
            pruned_noise_items=report.pruned_noise_items,
            distilled_principle=report.distilled_principle,
            new_path_added=report.new_path_added,
            mind_state=report.mind_state,
        )
    except Exception as e:
        logger.error("Error during meditation: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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
