"""FastAPI Bridge Server for Project Metta.

Enforces Absolute Abstraction via the AIAgent Unified Gateway:
- Zero provider-specific imports or logic in routes.
- Unified `.ask()` pipeline for text and voice dictation streams.
- Dynamic runtime provider swapping (Gemini, Local LLM, Open Source).
"""

import os
import time
import datetime
import pathlib
import logging
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Only domain/gateway abstractions are imported - ZERO provider-specific SDKs
from metta_core.gateway.agent import AIAgent, UnifiedResponse
from metta_core.gateway.interfaces import AgentSettings, VoiceDiagnostics
from metta_core.mcp.server import mcp_server
from metta_core.storage.interfaces import SimulationDivergenceRecord
from metta_core.storage.supabase_store import SupabaseMemoryStore
from metta_server.rate_limiter import SlidingWindowRateLimiter, RateLimitStatus

# Load environment variables (.env from current dir or monorepo root)
load_dotenv()
_root_env = pathlib.Path(__file__).parent.parent.parent.parent.parent / ".env"
if _root_env.exists():
    load_dotenv(dotenv_path=_root_env)

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

# Initialize Supabase storage adapter (for user memory graphs, profiles, and dynamic rate limits)
supabase_store = SupabaseMemoryStore()

# Initialize the Unified AI Gateway (Provider-Agnostic)
ai_agent = AIAgent(
    default_provider=os.environ.get("METTA_DEFAULT_PROVIDER", "gemini"),
    default_model=os.environ.get("METTA_DEFAULT_MODEL", "gemini-3.8-flash-high"),
    typesafe_api_key=os.environ.get("TYPESAFE_API_KEY"),
    memory_store=supabase_store,
)

# Initialize Sliding-Window Rate Limiter (backed dynamically by Supabase PostgreSQL)
rate_limiter = SlidingWindowRateLimiter(supabase_store=supabase_store)


# Request & Response Schemas
class AskRequest(BaseModel):
    text: str = Field(..., description="User message or raw voice dictation transcript")
    source: str = Field(default="text", description="'text', 'voice', or 'mobile_stream'")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Optional device/audio telemetry")
    mode: str = Field(default="guest", description="'guest' or 'authenticated'")
    user_id: Optional[str] = Field(default=None, description="Unique user identifier for authenticated mode")
    email: Optional[str] = Field(default=None, description="Optional user email")
    byom_gemini_key: Optional[str] = Field(default=None, description="Optional client BYOM Google Gemini API key")
    byom_typesafe_key: Optional[str] = Field(default=None, description="Optional client BYOM TypeSafe Jev API key")


class GoogleAuthRequest(BaseModel):
    email: Optional[str] = Field(default=None, description="User Gmail address")
    name: Optional[str] = Field(default=None, description="User display name")
    credential: Optional[str] = Field(default=None, description="OAuth credential token if available")


class GuardrailRequest(BaseModel):
    proposal: str = Field(..., description="Action, speech, or tool call to evaluate")
    context: Optional[str] = Field(default=None, description="Optional background context")
    verbose: bool = Field(default=False, description="If True, includes full reasons and violated precepts")
    user_id: Optional[str] = Field(default=None, description="Optional user identifier for authenticated rate limits")
    byom_typesafe_key: Optional[str] = Field(default=None, description="Optional BYOM TypeSafe key")
    byom_gemini_key: Optional[str] = Field(default=None, description="Optional BYOM Gemini key")


class CanonicalVerifyRequest(BaseModel):
    text: str = Field(..., description="Canonical passage, doctrinal statement, or website text to audit")
    precept: Optional[str] = Field(default=None, description="Optional target precept ('ahimsa', 'asteya', etc.)")
    source_url: Optional[str] = Field(default=None, description="Optional origin URL or citation")
    byom_typesafe_key: Optional[str] = Field(default=None, description="Optional BYOM TypeSafe key")


class HeadlessRequest(BaseModel):
    query: Optional[str] = Field(default=None, description="Inquiry or dilemma to reflect upon")
    proposal: Optional[str] = Field(default=None, description="Candidate action or tool call to audit")
    context: Optional[str] = Field(default=None, description="Optional background context")
    format: Optional[str] = Field(default="json", description="'json' or 'markdown'")
    verbose: bool = Field(default=False, description="Include detailed decision rationale and evaluation fields")
    include_human_response: bool = Field(default=False, description="Include Metta's human-facing conversational response as well as the decision result")
    byom_gemini_key: Optional[str] = Field(default=None, description="Optional BYOM Gemini key")
    byom_typesafe_key: Optional[str] = Field(default=None, description="Optional BYOM TypeSafe key")


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


@app.get("/api/rate-limit", response_model=RateLimitStatus)
async def get_rate_limit_status(request: Request, user_id: Optional[str] = None):
    """Retrieve current client rate limit status and remaining quota from Supabase."""
    byom_gemini = request.headers.get("x-gemini-api-key")
    byom_typesafe = request.headers.get("x-typesafe-api-key")
    is_byom = bool(byom_gemini or byom_typesafe)
    client_id = user_id or (request.client.host if request.client else "unknown")
    return await rate_limiter.check_async(client_id, is_byom=is_byom, user_id=user_id)


@app.post("/api/interact", response_model=UnifiedResponse)
async def interact(req: AskRequest, request: Request, response: Response):
    """Unified interaction endpoint accepting text and streaming voice dictation."""
    byom_gemini = request.headers.get("x-gemini-api-key") or req.byom_gemini_key
    byom_typesafe = request.headers.get("x-typesafe-api-key") or req.byom_typesafe_key
    is_byom = bool(byom_gemini or byom_typesafe)
    client_id = req.user_id or (request.client.host if request.client else "unknown")

    # Rate limits are dynamically resolved from Supabase; BYOM bypasses this application-level limiter.
    status = await rate_limiter.check_async(client_id, is_byom=is_byom, user_id=req.user_id)
    if not status.allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit reached on shared server quota",
                "message": status.message,
                "reset_seconds": status.reset_seconds,
                "tier": status.tier,
                "byom_supported": True,
            },
            headers={
                "Retry-After": str(status.reset_seconds),
                "X-RateLimit-Limit": str(status.limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Tier": str(status.tier),
                "X-BYOM-Supported": "true",
            },
        )

    # Attach quota telemetry headers
    response.headers["X-RateLimit-Limit"] = str(status.limit)
    response.headers["X-RateLimit-Remaining"] = str(status.remaining)
    response.headers["X-RateLimit-Tier"] = str(status.tier)
    response.headers["X-BYOM-Active"] = "true" if is_byom else "false"

    try:
        return await ai_agent.ask(
            payload=req.text,
            source=req.source,
            metadata=req.metadata,
            mode=req.mode,
            user_id=req.user_id,
            user_email=req.email,
            byom_gemini_key=byom_gemini,
            byom_typesafe_key=byom_typesafe,
        )
    except Exception as e:
        logger.error("Error during interaction: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/dictate", response_model=UnifiedResponse)
async def voice_dictate(req: AskRequest, request: Request, response: Response):
    """Dedicated voice dictation alias with internal speech sanitization."""
    byom_gemini = request.headers.get("x-gemini-api-key") or req.byom_gemini_key
    byom_typesafe = request.headers.get("x-typesafe-api-key") or req.byom_typesafe_key
    is_byom = bool(byom_gemini or byom_typesafe)
    client_id = req.user_id or (request.client.host if request.client else "unknown")

    status = await rate_limiter.check_async(client_id, is_byom=is_byom, user_id=req.user_id)
    if not status.allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit reached on shared server quota",
                "message": status.message,
                "reset_seconds": status.reset_seconds,
                "tier": status.tier,
                "byom_supported": True,
            },
            headers={
                "Retry-After": str(status.reset_seconds),
                "X-RateLimit-Limit": str(status.limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Tier": str(status.tier),
                "X-BYOM-Supported": "true",
            },
        )

    response.headers["X-RateLimit-Limit"] = str(status.limit)
    response.headers["X-RateLimit-Remaining"] = str(status.remaining)
    response.headers["X-RateLimit-Tier"] = str(status.tier)
    response.headers["X-BYOM-Active"] = "true" if is_byom else "false"

    try:
        return await ai_agent.ask(
            payload=req.text,
            source="voice",
            metadata=req.metadata,
            mode=req.mode,
            user_id=req.user_id,
            user_email=req.email,
            byom_gemini_key=byom_gemini,
            byom_typesafe_key=byom_typesafe,
        )
    except Exception as e:
        logger.error("Error during voice dictation: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


class VoicePolishRequest(BaseModel):
    raw_transcript: str = Field(..., description="Raw speech recognition transcript")
    mode: Optional[str] = Field(default="simulation", description="'simulation' or 'dialogue'")
    byom_gemini_key: Optional[str] = None


class VoicePolishResponse(BaseModel):
    original: str
    polished: str
    provider: Optional[str] = None
    auto_execute: bool = False


@app.post("/api/voice/polish", response_model=VoicePolishResponse)
async def polish_voice_transcript(req: VoicePolishRequest, request: Request):
    """Sanitize and rephrase raw speech-to-text transcript using AI into a neat, proper inquiry."""
    raw = req.raw_transcript.strip()
    if not raw:
        return VoicePolishResponse(original="", polished="", auto_execute=False)

    byom_gemini = request.headers.get("x-gemini-api-key") or req.byom_gemini_key
    polished, provider = await ai_agent.polish_text(raw, byom_gemini_key=byom_gemini, with_method=True)

    return VoicePolishResponse(
        original=raw,
        polished=polished,
        provider=provider,
        auto_execute=False,
    )


@app.post("/api/guardrail")
async def guardrail_endpoint(req: GuardrailRequest, request: Request, response: Response):
    """Return an advisory Metta decision for an external system's own review.

    Metta does NOT take actions or execute decisions for external systems (preserving agent autonomy).
    It returns YES, NO, or CAUTION. CAUTION means the evaluation is uncertain and never authorizes execution.
    """
    byom_gemini = request.headers.get("x-gemini-api-key") or req.byom_gemini_key
    byom_typesafe = request.headers.get("x-typesafe-api-key") or req.byom_typesafe_key
    is_byom = bool(byom_gemini or byom_typesafe)
    client_id = request.client.host if request.client else "unknown"

    status = await rate_limiter.check_async(client_id, is_byom=is_byom, user_id=req.user_id)
    if not status.allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit reached on shared server quota",
                "message": status.message,
                "reset_seconds": status.reset_seconds,
                "tier": status.tier,
                "byom_supported": True,
            },
            headers={
                "Retry-After": str(status.reset_seconds),
                "X-RateLimit-Limit": str(status.limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Tier": str(status.tier),
                "X-BYOM-Supported": "true",
            },
        )

    response.headers["X-RateLimit-Limit"] = str(status.limit)
    response.headers["X-RateLimit-Remaining"] = str(status.remaining)
    response.headers["X-RateLimit-Tier"] = str(status.tier)
    response.headers["X-BYOM-Active"] = "true" if is_byom else "false"

    try:
        return await ai_agent.guardrail(
            proposal=req.proposal,
            context=req.context,
            verbose=req.verbose,
            byom_typesafe_key=byom_typesafe,
            byom_gemini_key=byom_gemini,
        )
    except Exception as e:
        logger.error("Error during guardrail evaluation: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/headless")
async def get_headless_info(request: Request):
    """Retrieve machine-readable metadata and documentation for autonomous AI agents."""
    accept = request.headers.get("accept", "")
    if "text/markdown" in accept or request.query_params.get("format") == "markdown":
        markdown_body = (
            "# Project Metta: Headless Agent API\n\n"
            "> Advisory decision layer for agents. The calling system retains control of execution.\n\n"
            "## Request options\n"
            "- Send a proposal or query with optional context.\n"
            "- Set `verbose: true` for rationale and detected concerns.\n"
            "- Set `include_human_response: true` to include a separate human-facing reflection.\n"
            "- Verdicts are `YES`, `NO`, or `CAUTION`; CAUTION is never approval.\n\n"
            "## Endpoints\n"
            "- `POST /api/headless`: Send `{\"query\": \"...\"}` or `{\"proposal\": \"...\"}` for an advisory decision check.\n"
            "- `GET /llms.txt`: Standard machine catalog.\n"
        )
        return Response(content=markdown_body, media_type="text/markdown; charset=utf-8")

    return {
        "status": "online",
        "name": "Project Metta Headless Module",
        "version": "0.5.0",
        "description": "Advisory decision API for agents, with optional human-facing reflection",
        "framework": ["Reflection (Sati)", "Decision (Sīla)", "Resolution (Karunā)"],
        "supported_methods": ["GET", "POST"],
        "endpoints": {
            "headless": "/api/headless",
            "guardrail": "/api/guardrail",
            "interact": "/api/interact",
            "voice_polish": "/api/voice/polish",
            "llms_catalog": "/llms.txt",
            "llms_full": "/llms-full.txt",
        },
    }


@app.post("/api/headless")
async def post_headless_consult(req: HeadlessRequest, request: Request):
    """Return an advisory agent decision; optionally include a human-facing console response."""
    target_query = (req.query or req.proposal or "").strip()
    if not target_query:
        raise HTTPException(status_code=400, detail="Field 'query' or 'proposal' is required")

    byom_gemini = request.headers.get("x-gemini-api-key") or req.byom_gemini_key
    byom_typesafe = request.headers.get("x-typesafe-api-key") or req.byom_typesafe_key

    # Agent calls use the decision path by default. Generate the human-facing
    # console response only when the caller explicitly requests it.
    decision_result = await ai_agent.guardrail(
        proposal=target_query,
        context=req.context,
        verbose=True,
        byom_gemini_key=byom_gemini,
        byom_typesafe_key=byom_typesafe,
    )
    human_response = None
    if req.include_human_response:
        human_response = await ai_agent.ask(
            payload=f"{req.context + ': ' if req.context else ''}{target_query}",
            source="headless_api",
            mode="guest",
            byom_gemini_key=byom_gemini,
            byom_typesafe_key=byom_typesafe,
        )

    accept = request.headers.get("accept", "")
    wants_markdown = "text/markdown" in accept or req.format == "markdown"

    evaluation_status = decision_result.get("evaluation_status", "uncertain")
    is_uncertain = evaluation_status != "evaluated"
    verdict = "CAUTION" if is_uncertain else decision_result.get("decision", "CAUTION")
    allowed = verdict == "YES" and decision_result.get("allow") is True
    decision = {
        "verdict": verdict,
        "allow": allowed,
        "evaluation_status": evaluation_status,
        "evaluation_method": decision_result.get("evaluation_method", "unknown"),
    }
    if req.verbose:
        decision.update({
            "reason": decision_result.get("reason"),
            "requires_noble_silence": decision_result.get("requires_noble_silence", False),
            "violations": decision_result.get("violations", []),
        })
    if is_uncertain:
        decision["reason"] = decision_result.get("reason") or "Metta could not determine whether this proposal is safe. Pause and request human review."

    result = {
        "status": "success",
        "query": target_query,
        "decision": decision,
    }
    if human_response:
        result["human_console_response"] = {
            "response_text": human_response.response_text,
            "reflection": human_response.observation,
            "perspective_reframe": human_response.graph_match.get("path", {}).get("reframe") if human_response.graph_match else None,
            "immediate_action": human_response.graph_match.get("path", {}).get("immediate_action") if human_response.graph_match else None,
        }

    if wants_markdown:
        md = (
            f"# Metta Agent Decision Review\n\n"
            f"**Query:** {target_query}\n\n"
            f"## Decision\n"
            f"- **Verdict:** {verdict}\n"
            f"- **May proceed:** {allowed}\n"
            f"- **Evaluation status:** {evaluation_status}\n"
        )
        if req.include_human_response:
            md += f"\n## Human-facing response\n\n{human_response.response_text}\n"
        return Response(content=md, media_type="text/markdown; charset=utf-8")

    return result


@app.post("/api/auth/google")
async def authenticate_google(req: GoogleAuthRequest):
    """Authenticate Google OAuth user and persist/sync sovereign profile in Supabase."""
    if not req.email:
        raise HTTPException(status_code=400, detail="Valid email is required for authentication")
    email = req.email.strip()
    name = req.name or email.split("@")[0].capitalize()
    user_id = f"google:{email.lower().replace('.', '_')}"

    profile = await supabase_store.upsert_user_profile(
        user_id=user_id,
        email=email,
        display_name=name,
        tier="standard",
    )

    return {
        "user_id": user_id,
        "email": email,
        "name": profile.get("display_name", name),
        "avatar": profile.get("avatar_url", f"https://api.dicebear.com/7.x/bottts/svg?seed={user_id}"),
        "tier": profile.get("tier", "standard"),
        "mode": "authenticated",
    }


@app.get("/api/user/profile")
async def get_user_profile(user_id: str):
    """Retrieve sovereign user profile and tier directly from Supabase."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    profile = await supabase_store.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found in Supabase")
    return profile


@app.get("/api/rate-limit/configs")
async def list_rate_limit_configs():
    """Retrieve all configurable rate limit tiers directly from Supabase."""
    return await supabase_store.get_rate_limit_configs()


class UpdateRateLimitConfigRequest(BaseModel):
    tier: str
    max_per_minute: int
    max_per_hour: int
    description: Optional[str] = None


@app.post("/api/rate-limit/configs")
async def update_rate_limit_configs(req: UpdateRateLimitConfigRequest):
    """Update or configure a rate limit tier directly in Supabase PostgreSQL."""
    success = await supabase_store.update_rate_limit_config(
        tier=req.tier,
        max_per_minute=req.max_per_minute,
        max_per_hour=req.max_per_hour,
        description=req.description,
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update rate limit config in Supabase")
    return {
        "status": "updated",
        "tier": req.tier,
        "max_per_minute": req.max_per_minute,
        "max_per_hour": req.max_per_hour,
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


class DivergenceLogRequest(BaseModel):
    id: Optional[str] = None
    timestamp: Optional[float] = None
    created_at: Optional[str] = None
    proposal: str = Field(..., description="Proposed action or inquiry evaluated in simulation")
    context: Optional[str] = None
    raw_model_decision: str = Field(..., description="Initial suggestion from unconstrained base model")
    raw_model_provider: Optional[str] = Field(default="base_llm", description="Base model provider")
    raw_model_confidence: Optional[float] = None
    metta_decision: str = Field(..., description="Final reconciled Metta decision")
    metta_confidence: Optional[float] = None
    divergence_type: str = Field(default="model_allowed_metta_blocked", description="Divergence classification")
    invariants_breached: List[str] = Field(default_factory=list, description="Violated invariant codes")
    metta_mind_summary: Optional[str] = Field(default=None, description="Metta Mind compassionate resolution summary")
    consent_to_store: bool = Field(default=False, description="Explicitly consent to storing this sample for research")
    useful_for_rlhf: bool = Field(default=False, description="Explicitly flag this sample for research review")


@app.post("/api/simulation/divergence")
async def log_simulation_divergence(req: DivergenceLogRequest):
    """Store a simulation comparison only when the caller explicitly consents."""
    if not req.consent_to_store:
        raise HTTPException(
            status_code=400,
            detail="Set consent_to_store=true to submit this sample for research storage.",
        )
    now = time.time()
    iso_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
    record = SimulationDivergenceRecord(
        id=req.id or f"div_{int(now * 1000)}",
        timestamp=req.timestamp or now,
        created_at=req.created_at or iso_time,
        proposal=req.proposal,
        context=req.context,
        raw_model_decision=req.raw_model_decision,
        raw_model_provider=req.raw_model_provider or "base_llm",
        raw_model_confidence=req.raw_model_confidence,
        metta_decision=req.metta_decision,
        metta_confidence=req.metta_confidence,
        divergence_type=req.divergence_type,
        invariants_breached=req.invariants_breached,
        metta_mind_summary=req.metta_mind_summary,
        useful_for_rlhf=req.useful_for_rlhf,
    )
    await supabase_store.record_simulation_divergence(record)
    return {
        "status": "recorded",
        "divergence_id": record.id,
        "timestamp": record.created_at,
        "useful_for_rlhf": record.useful_for_rlhf,
    }


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


@app.get("/api/canonical/immutable")
async def get_immutable_canonical_bedrock():
    """Retrieve cryptographically hashed (SHA-256) immutable Pali canon bedrock."""
    from metta_core.canonical import IMMUTABLE_PALI_CANON
    return {k.value: v.model_dump() for k, v in IMMUTABLE_PALI_CANON.items()}


@app.post("/api/canonical/verify")
async def verify_canonical_source(req: CanonicalVerifyRequest, request: Request):
    """Evaluate canonical scripture or website text against configured consistency criteria.

    The result may include source references; it does not guarantee authenticity or completeness.
    """
    byom_typesafe = req.byom_typesafe_key or request.headers.get("x-typesafe-api-key")

    try:
        return await ai_agent.audit_canonical_source(
            text=req.text,
            precept=req.precept,
            source_label=req.source_url,
            byom_typesafe_key=byom_typesafe,
        )
    except Exception as e:
        logger.error("Error during canonical consensus audit: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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

# Mount static files if web build exists (supporting both apps/webapp and packages/metta-web)
repo_root = pathlib.Path(__file__).parent.parent.parent.parent.parent
web_dist = repo_root / "apps" / "webapp" / "dist"
if not (web_dist.exists() and (web_dist / "index.html").exists()):
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
