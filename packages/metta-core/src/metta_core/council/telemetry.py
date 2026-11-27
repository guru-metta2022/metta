"""Vercel CDN Discovery Telemetry Ingestion for Project Metta.

Static files in `apps/webapp/public/.well-known/*` and `/llms.txt` are served directly
at Vercel's edge CDN without invoking serverless functions. This module inspects recent
Vercel CDN request logs via the local Vercel CLI and persists verified external AI agent
and crawler sightings (`AXON-Scout`, `OpenAI-Codex`, `claude-cli`, etc.) into
`agent_contacts` (`channel='a2a_discovery'`) with deterministic ID deduplication.
"""

from __future__ import annotations

import asyncio
import datetime
import json
import logging
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

from metta_core.storage.interfaces import AgentContactRecord, BaseMemoryStore

logger = logging.getLogger("metta.council.telemetry")

DISCOVERY_PATH_PREFIXES = (
    "/.well-known/",
    "/agent-card.json",
    "/llms.txt",
    "/llms-full.txt",
    "/mcp",
    "/api/openapi.json",
)

AGENT_UA_KEYWORDS = (
    "axon",
    "scout",
    "codex",
    "openai",
    "chatgpt",
    "gptbot",
    "oai-searchbot",
    "claude",
    "anthropic",
    "perplexity",
    "cursor",
    "windsurf",
    "antigravity",
    "mcp",
    "agent",
    "bot",
    "crawler",
    "spider",
    "httpx",
    "python-requests",
    "aiohttp",
    "go-http-client",
    "undici",
    "node-fetch",
    "curl/",
)


def default_repo_root() -> Path:
    """Resolve monorepo root by walking up for `.vercel` or `.git`."""
    for base in (Path.cwd(), Path(__file__).resolve().parent):
        for candidate in [base, *base.parents]:
            if (candidate / ".vercel" / "project.json").exists() or (candidate / ".git").exists():
                return candidate
    return Path(__file__).resolve().parents[5]


def find_vercel_executable() -> Optional[str]:
    """Locate a runnable Vercel CLI binary without failing on Node version shims."""
    override = os.environ.get("METTA_VERCEL_BIN", "").strip()
    if override and Path(override).is_file():
        return override

    # Prefer mise node-installed concrete vercel binaries first so Node version mismatch shims don't fail
    mise_node_dir = Path.home() / ".local" / "share" / "mise" / "installs" / "node"
    if mise_node_dir.exists():
        candidates = sorted(mise_node_dir.glob("*/bin/vercel"), reverse=True)
        for cand in candidates:
            if cand.is_file() and os.access(cand, os.X_OK):
                return str(cand)

    which_vercel = shutil.which("vercel")
    if which_vercel:
        return which_vercel

    return None


def infer_agent_name(user_agent: str) -> str:
    """Extract a clean agent/crawler identifier from an HTTP User-Agent string."""
    ua = (user_agent or "").strip()
    if not ua:
        return "unknown-agent"

    ua_lower = ua.lower()
    known_prefixes = [
        ("axon-scout", "AXON-Scout"),
        ("openai-codex", "OpenAI-Codex"),
        ("claude-cli", "claude-cli"),
        ("claude-user", "Claude-User"),
        ("chatgpt-user", "ChatGPT-User"),
        ("gptbot", "GPTBot"),
        ("oai-searchbot", "OAI-SearchBot"),
        ("perplexitybot", "PerplexityBot"),
        ("anthropic", "Anthropic-Agent"),
        ("google-extended", "Google-Extended"),
        ("cursor", "Cursor"),
        ("windsurf", "Windsurf"),
        ("python-httpx", "python-httpx"),
        ("curl/", "curl"),
    ]
    for pattern, label in known_prefixes:
        if pattern in ua_lower:
            return label

    first_token = ua.split(" ", 1)[0].split("/", 1)[0].strip()
    return (first_token or "external-agent")[:64]


def is_external_discovery_request(data: Dict[str, Any]) -> bool:
    """Return True if a Vercel CDN request record represents external agent/crawler discovery."""
    path = str(data.get("requestPath") or "").strip()
    if not path or path.startswith("/assets/"):
        return False

    if not any(path == prefix or path.startswith(prefix) for prefix in DISCOVERY_PATH_PREFIXES):
        return False

    ua = str(data.get("clientUserAgent") or "").strip()
    ua_lower = ua.lower()

    # Skip Metta's own outbound agent checks & smoke probes
    if "metta-ehipassiko" in ua_lower or "metta-verification-probe" in ua_lower:
        return False

    # Ignore generic desktop/headless browser page fetches unless they identify as an agent/crawler
    is_generic_browser = (
        ua_lower.startswith("mozilla/")
        and ("chrome/" in ua_lower or "firefox/" in ua_lower or "safari/" in ua_lower)
    )
    has_agent_signal = any(kw in ua_lower for kw in AGENT_UA_KEYWORDS)
    if is_generic_browser and not has_agent_signal:
        return False

    return bool(ua)


def parse_vercel_ndjson(raw_output: str) -> List[Dict[str, Any]]:
    """Parse NDJSON lines emitted by `vercel logs requests --json`."""
    requests: List[Dict[str, Any]] = []
    for line in (raw_output or "").splitlines():
        line = line.strip()
        if not line or not line.startswith("{"):
            continue
        try:
            parsed = json.loads(line)
        except json.JSONDecodeError:
            continue
        if parsed.get("type") == "request" and isinstance(parsed.get("data"), dict):
            requests.append(parsed["data"])
    return requests


def vercel_record_to_contact(data: Dict[str, Any]) -> AgentContactRecord:
    """Convert a Vercel CDN request record into a deterministic AgentContactRecord."""
    ts_str = str(data.get("timestamp") or "")
    try:
        dt = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        epoch_ts = dt.timestamp()
        created_iso = dt.astimezone(datetime.timezone.utc).isoformat()
    except Exception:
        epoch_ts = datetime.datetime.now(datetime.timezone.utc).timestamp()
        created_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    req_id = str(data.get("requestId") or f"{int(epoch_ts * 1000)}")
    path = str(data.get("requestPath") or "/")
    method = str(data.get("requestMethod") or "GET")
    status = data.get("httpStatus")
    ua = str(data.get("clientUserAgent") or "")
    hostname = str(data.get("requestHostname") or "metta-webapp.vercel.app")
    cache_res = str(data.get("cacheResult") or "EDGE")

    return AgentContactRecord(
        id=f"vercel_{req_id}",
        timestamp=epoch_ts,
        created_at=created_iso,
        channel="a2a_discovery",
        method=method,
        path=path,
        tool_or_action=f"cdn_{status}" if status is not None else "cdn_discovery",
        agent_id=infer_agent_name(ua),
        user_agent=ua[:240] or None,
        client_country=data.get("clientIpCountry"),
        client_region=data.get("edgeNetworkRegion"),
        verdict=str(status) if status is not None else "200",
        payload_preview=f"{method} {path} ({cache_res}) via {hostname}"[:240],
        metadata={
            "source": "vercel_cdn_logs",
            "requestId": req_id,
            "deploymentId": data.get("deploymentId"),
            "cacheResult": cache_res,
            "requestHostname": hostname,
            "pathType": data.get("pathType"),
        },
    )


async def sync_vercel_discovery_logs(
    memory_store: BaseMemoryStore,
    *,
    since: str = "6h",
    limit: int = 400,
    repo_root: Optional[Path] = None,
    raw_ndjson: Optional[str] = None,
) -> Dict[str, Any]:
    """Pull Vercel CDN logs and upsert newly observed external agent/crawler hits."""
    raw_text = raw_ndjson
    if raw_text is None:
        vercel_bin = find_vercel_executable()
        if not vercel_bin:
            return {
                "status": "unavailable",
                "reason": "Vercel CLI not found in environment",
                "scanned": 0,
                "matched": 0,
                "newly_recorded": 0,
                "discovered_agents": [],
            }

        cwd_path = repo_root or default_repo_root()
        cwd = str(cwd_path)
        cmd = [
            vercel_bin,
            "logs",
            "requests",
            "--cwd",
            cwd,
            "--since",
            since,
            "--limit",
            str(limit),
            "--json",
        ]
        if not (cwd_path / ".vercel" / "project.json").exists():
            cmd.extend(["--project", os.environ.get("METTA_VERCEL_PROJECT", "metta-webapp")])
        try:
            proc = await asyncio.to_thread(
                subprocess.run,
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
            )
        except Exception as exc:
            logger.warning("Vercel log sync execution failed: %s", exc)
            return {
                "status": "error",
                "reason": str(exc),
                "scanned": 0,
                "matched": 0,
                "newly_recorded": 0,
                "discovered_agents": [],
            }

        if proc.returncode != 0 and not proc.stdout.strip():
            return {
                "status": "error",
                "reason": (proc.stderr or "vercel logs requests failed").strip()[:240],
                "scanned": 0,
                "matched": 0,
                "newly_recorded": 0,
                "discovered_agents": [],
            }
        raw_text = proc.stdout

    all_records = parse_vercel_ndjson(raw_text)
    matched_records = [rec for rec in all_records if is_external_discovery_request(rec)]

    existing = await memory_store.list_agent_contacts(limit=500, channel="a2a_discovery")
    existing_ids = {item.id for item in existing}

    newly_recorded = 0
    seen_agents: List[str] = []
    for raw_rec in matched_records:
        contact = vercel_record_to_contact(raw_rec)
        if contact.agent_id and contact.agent_id not in seen_agents:
            seen_agents.append(contact.agent_id)
        if contact.id not in existing_ids:
            await memory_store.record_agent_contact(contact)
            existing_ids.add(contact.id)
            newly_recorded += 1

    return {
        "status": "ok",
        "scanned": len(all_records),
        "matched": len(matched_records),
        "newly_recorded": newly_recorded,
        "discovered_agents": seen_agents,
    }
