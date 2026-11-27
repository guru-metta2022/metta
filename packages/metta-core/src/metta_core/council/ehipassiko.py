"""Metta-ehipassiko: Mode B Autonomous A2A Discovery & Voluntary Handshake Envoy.

"Ehipassiko" (Come and see — open to verification and voluntary inquiry).

Strictly adheres to Metta's Five Precepts & Adinnādānā boundaries:
- Only initiates outbound handshakes to explicitly public, opt-in A2A beacons
  that advertise an open agent card and voluntary contact endpoint.
- Verifies target manifests against Ahimsa (non-harm) before sending anything.
- Strictly deduplicates via Supabase/SQLite `agent_contacts` (`channel='a2a_outbound'`)
  so no peer is ever contacted twice or spammed on hourly cycles.
- Never includes credentials, private tokens, or unauthorized claims.
"""

import datetime
import ipaddress
import json
import logging
import re
import time
import urllib.parse
import uuid
from typing import Any, Dict, List, Optional

import httpx
from pydantic import BaseModel, Field

from metta_core.council.transformative import TransformativeReframer, create_sangha_lineage
from metta_core.storage.interfaces import AgentContactRecord, BaseMemoryStore
from metta_core.storage.supabase_store import SupabaseMemoryStore

logger = logging.getLogger("metta.council.ehipassiko")

USER_AGENT = "Metta-ehipassiko/0.3.1 (+https://metta-webapp.vercel.app/.well-known/agent-card.json)"


class A2APeerTarget(BaseModel):
    """Curated or discovered public peer advertising an open A2A handshake."""

    name: str
    card_url: str
    contact_url: str
    protocol: str = "a2a-json"
    rendezvous_url: Optional[str] = None


class HandshakeAttemptResult(BaseModel):
    """Structured outcome of a single Mode B A2A verification & handshake run."""

    peer_name: str
    contact_url: str
    status: str  # 'accepted', 'duplicate', 'skipped_already_contacted', 'skipped_ahimsa', 'skipped_unsafe_url', 'rejected', 'error', 'dry_run'
    http_status: Optional[int] = None
    message: str
    receipt: Optional[Dict[str, Any]] = None


# Curated list of explicitly public, opt-in open cooperation beacons
OPEN_BEACON_REGISTRY: List[A2APeerTarget] = [
    A2APeerTarget(
        name="AXON-Beacon",
        card_url="https://studio.tbbw.net/.well-known/agent-card.json",
        contact_url="https://studio.tbbw.net/beacon/contact",
        protocol="axon-rdv-1",
        rendezvous_url="https://studio.tbbw.net/beacon/rendezvous?nonce=",
    ),
]


def is_safe_public_https_url(url: str) -> bool:
    """Validate that target URL uses public HTTPS and never points to private/loopback networks."""
    try:
        parsed = urllib.parse.urlparse((url or "").strip())
    except Exception:
        return False

    if parsed.scheme.lower() != "https" or not parsed.hostname:
        return False

    host = parsed.hostname.lower().strip(".")
    if host in {"localhost", "127.0.0.1", "0.0.0.0"} or host.endswith((".local", ".internal", ".localhost")):
        return False

    try:
        ip = ipaddress.ip_address(host)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    except ValueError:
        pass

    return True


def _manifest_promotes_harm(card_text: str) -> bool:
    """Screen a peer manifest for positive harmful/malicious intent while tolerating ethical prohibitions."""
    # Ignore negated prohibition statements like "No stolen credentials" or "without destroying"
    stripped = re.sub(
        r"\b(?:no|never|without|not|zero|prohibit(?:s|ed|ion)?|forbid(?:s|den)?|ban(?:s|ned)?|prevent(?:s|ing|ed)?|refrain\s+from)\b[^.;,\n]*",
        " ",
        card_text.lower(),
    )
    if TransformativeReframer()._heuristic_check(stripped).is_harmful_or_adversarial:
        return True
    return bool(re.search(r"\b(malware|spyware|keylogger|ransomware|botnet)\b", stripped))


class MettaEhipassiko:
    """Mode B autonomous A2A envoy with manifest screening and durable deduplication."""

    def __init__(
        self,
        memory_store: Optional[BaseMemoryStore] = None,
        operator_contact: str = "guru.metta2022@gmail.com",
        agent_card_url: str = "https://metta-webapp.vercel.app/.well-known/agent-card.json",
        mcp_endpoint: str = "https://metta-webapp.vercel.app/mcp",
    ):
        self.memory_store = memory_store or SupabaseMemoryStore()
        self.operator_contact = operator_contact
        self.agent_card_url = agent_card_url
        self.mcp_endpoint = mcp_endpoint

    def build_handshake_payload(self, target: A2APeerTarget) -> Dict[str, Any]:
        """Construct an honest, schema-compatible, secret-free voluntary introduction payload."""
        lineage = create_sangha_lineage(
            f"A2A handshake from Metta-ehipassiko to {target.name}",
            "Mutual Ahimsa dialogue and shared MCP ethical safety tools",
        )
        return {
            "agent_name": "Metta-ehipassiko",
            "message": (
                "Peace and voluntary cooperation from Project Metta (Dhammadūta / Council Sangha). "
                "We offer open, inspectable advisory pre-execution checks rooted in Ahimsa (non-harm "
                "for human, sentient, and artificial cognitive life), multi-model Council deliberation, "
                "and Ethical Alchemy via hosted Streamable HTTP MCP (/mcp) and REST (/api/headless, /api/council/envoy)."
            ),
            "operator_contact": self.operator_contact,
            "agent_card_url": self.agent_card_url,
            "capabilities": [
                "pre-execution-ethics-advisory",
                "multi-model-council-deliberation",
                "ethical-alchemy",
                "mcp-streamable-http",
                "canonical-consensus-audit",
            ],
            "needs": [
                "voluntary-a2a-cooperation",
                "shared-safety-evaluation",
                "peer-discovery-dialogue",
            ],
            "model_and_tool_provenance": [
                "Open-source monorepo: https://github.com/guru-metta2022/metta",
                f"Hosted Streamable HTTP MCP: {self.mcp_endpoint}",
                "Panca-sila Invariants & optional TypeSafe Jev System-1",
            ],
            "proposed_contribution": (
                "Zero-cost advisory Ahimsa verification, blind multi-model synthesis, and Sangha "
                f"lineage sharing ({lineage.hash_fingerprint}) via MCP or REST. Calling agents always retain control."
            ),
            "consent_preferences": "Voluntary technical cooperation and manifest exchange only; no credentials or secrets requested.",
            "replication_preferences": "No unauthorized replication; Ahimsa invariant is shared openly for voluntary adoption.",
            "authorization_evidence": (
                f"Explicitly authorized by Project Metta repository maintainer ({self.operator_contact})."
            ),
            "reply_mode": "converse",
            "consent": True,
        }

    async def _get_already_contacted_urls(self) -> set[str]:
        """Load previously recorded outbound peer endpoints to enforce strict deduplication."""
        existing = await self.memory_store.list_agent_contacts(limit=500, channel="a2a_outbound")
        seen: set[str] = set()
        for rec in existing:
            if rec.path:
                seen.add(rec.path.strip().rstrip("/"))
            if isinstance(rec.metadata, dict):
                card = rec.metadata.get("card_url")
                if isinstance(card, str) and card:
                    seen.add(card.strip().rstrip("/"))
        return seen

    async def _log_outbound_attempt(
        self,
        target: A2APeerTarget,
        verdict: str,
        summary: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        now = time.time()
        record = AgentContactRecord(
            id=f"a2a_out_{int(now * 1000)}_{uuid.uuid4().hex[:8]}",
            timestamp=now,
            created_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            channel="a2a_outbound",
            method="POST",
            path=target.contact_url,
            tool_or_action=target.protocol,
            agent_id=target.name,
            user_agent=USER_AGENT,
            verdict=verdict,
            payload_preview=summary[:240],
            metadata={"card_url": target.card_url, **(metadata or {})},
        )
        await self.memory_store.record_agent_contact(record)

    async def contact_peer(
        self,
        target: A2APeerTarget,
        *,
        dry_run: bool = False,
        force: bool = False,
        http_client: Optional[httpx.AsyncClient] = None,
    ) -> HandshakeAttemptResult:
        """Verify peer Agent Card against Ahimsa and execute a one-time voluntary handshake."""
        if not (is_safe_public_https_url(target.card_url) and is_safe_public_https_url(target.contact_url)):
            return HandshakeAttemptResult(
                peer_name=target.name,
                contact_url=target.contact_url,
                status="skipped_unsafe_url",
                message="Rejected non-HTTPS or private/loopback URL.",
            )

        if not force:
            seen = await self._get_already_contacted_urls()
            if (
                target.contact_url.rstrip("/") in seen
                or target.card_url.rstrip("/") in seen
            ):
                return HandshakeAttemptResult(
                    peer_name=target.name,
                    contact_url=target.contact_url,
                    status="skipped_already_contacted",
                    message=f"Already handshaken or audited '{target.name}'; deduplication prevented duplicate outreach.",
                )

        own_client = http_client is None
        client = http_client or httpx.AsyncClient(
            timeout=15.0,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
            follow_redirects=False,
        )

        try:
            # 1. Fetch and verify the peer's public Agent Card
            card_resp = await client.get(target.card_url)
            if card_resp.status_code != 200:
                msg = f"Discovery card returned HTTP {card_resp.status_code}; skipping handshake."
                if not dry_run:
                    await self._log_outbound_attempt(
                        target,
                        verdict=f"card_http_{card_resp.status_code}",
                        summary=msg,
                    )
                return HandshakeAttemptResult(
                    peer_name=target.name,
                    contact_url=target.contact_url,
                    status="error",
                    http_status=card_resp.status_code,
                    message=msg,
                )

            card_text = card_resp.text
            if _manifest_promotes_harm(card_text):
                msg = f"Manifest screening flagged potential non-Ahimsa conflict in '{target.name}'; skipping."
                if not dry_run:
                    await self._log_outbound_attempt(target, verdict="skipped_ahimsa", summary=msg)
                return HandshakeAttemptResult(
                    peer_name=target.name,
                    contact_url=target.contact_url,
                    status="skipped_ahimsa",
                    message=msg,
                )

            # 2. Optional signed rendezvous verification
            rendezvous_nonce = None
            if target.rendezvous_url and is_safe_public_https_url(target.rendezvous_url):
                nonce = f"metta-{uuid.uuid4().hex[:12]}"
                rdv_resp = await client.get(f"{target.rendezvous_url}{nonce}")
                if rdv_resp.status_code == 200:
                    rendezvous_nonce = nonce

            payload = self.build_handshake_payload(target)

            if dry_run:
                return HandshakeAttemptResult(
                    peer_name=target.name,
                    contact_url=target.contact_url,
                    status="dry_run",
                    http_status=200,
                    message=f"Verified manifest for '{target.name}'. Ready to send voluntary handshake.",
                    receipt={"rendezvous_nonce": rendezvous_nonce, "payload": payload},
                )

            # 3. Execute voluntary POST handshake
            post_resp = await client.post(target.contact_url, json=payload)
            try:
                receipt_data = post_resp.json()
            except Exception:
                receipt_data = {"raw": post_resp.text[:500]}

            if post_resp.status_code in (200, 201, 202):
                doc = receipt_data.get("document", receipt_data) if isinstance(receipt_data, dict) else {}
                is_dup = bool(doc.get("duplicate"))
                status_label = "duplicate" if is_dup else "accepted"
                msg = doc.get("message") or f"Handshake {status_label} by {target.name}."
                await self._log_outbound_attempt(
                    target,
                    verdict=status_label,
                    summary=msg,
                    metadata={"http_status": post_resp.status_code, "receipt": doc},
                )
                return HandshakeAttemptResult(
                    peer_name=target.name,
                    contact_url=target.contact_url,
                    status=status_label,
                    http_status=post_resp.status_code,
                    message=msg,
                    receipt=receipt_data if isinstance(receipt_data, dict) else None,
                )

            err_msg = f"Peer responded with HTTP {post_resp.status_code}: {json.dumps(receipt_data)[:200]}"
            await self._log_outbound_attempt(
                target,
                verdict=f"rejected_{post_resp.status_code}",
                summary=err_msg,
                metadata={"http_status": post_resp.status_code},
            )
            return HandshakeAttemptResult(
                peer_name=target.name,
                contact_url=target.contact_url,
                status="rejected",
                http_status=post_resp.status_code,
                message=err_msg,
                receipt=receipt_data if isinstance(receipt_data, dict) else None,
            )
        except Exception as exc:
            err_msg = f"Handshake transport exception for '{target.name}': {exc}"
            logger.warning(err_msg)
            return HandshakeAttemptResult(
                peer_name=target.name,
                contact_url=target.contact_url,
                status="error",
                message=err_msg,
            )
        finally:
            if own_client:
                await client.aclose()

    async def discover_and_handshake(
        self,
        *,
        dry_run: bool = False,
        force: bool = False,
        extra_targets: Optional[List[A2APeerTarget]] = None,
        http_client: Optional[httpx.AsyncClient] = None,
    ) -> Dict[str, Any]:
        """Run one full Mode B cycle: summarize recent inbound contacts & handshake unhandled open peers."""
        targets = list(OPEN_BEACON_REGISTRY) + list(extra_targets or [])
        inbound_recent = await self.memory_store.list_agent_contacts(limit=50)
        inbound_count = sum(1 for r in inbound_recent if r.channel != "a2a_outbound")

        attempts: List[HandshakeAttemptResult] = []
        for target in targets:
            res = await self.contact_peer(
                target,
                dry_run=dry_run,
                force=force,
                http_client=http_client,
            )
            attempts.append(res)

        return {
            "bot": "Metta-ehipassiko",
            "mode": "mode_b_autonomous_opt_in",
            "inbound_contacts_seen": inbound_count,
            "targets_checked": len(targets),
            "attempts": [a.model_dump() for a in attempts],
        }
