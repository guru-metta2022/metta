"""Cryptographic Ed25519 Identity & Signature Utilities for Project Metta.

Provides persistent Ed25519 key management, public key export matching
Ed25519VerificationKey2020 (`/.well-known/metta.pub`), deterministic compact-JSON
canonicalization, envelope verification, and AXON-RDV/1 + AXON-RDV/2 challenge signing.
"""

from __future__ import annotations

import base64
import datetime
import hashlib
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)

CANONICAL_BASE_URL = "https://metta-webapp.vercel.app"
PUBLIC_IDENTITY_PATH = "/.well-known/metta.pub"
AGENT_CARD_PATH = "/.well-known/agent-card.json"
MCP_ENDPOINT_PATH = "/mcp"


def b64url_encode(raw: bytes) -> str:
    """Encode bytes as unpadded base64url ASCII string."""
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def b64url_decode(encoded: str) -> bytes:
    """Decode padded or unpadded base64url ASCII string."""
    pad = "=" * (-len(encoded) % 4)
    return base64.urlsafe_b64decode(encoded + pad)


def canonical_json_bytes(document: Any) -> bytes:
    """Serialize data as sorted, compact UTF-8 JSON for deterministic Ed25519 signing."""
    return json.dumps(
        document,
        sort_keys=True,
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")


def default_identity_key_path() -> Path:
    """Resolve the default local filesystem path for Metta's Ed25519 private key."""
    env_path = os.environ.get("METTA_IDENTITY_KEY_PATH", "").strip()
    if env_path:
        return Path(env_path).expanduser()
    # packages/metta-core/src/metta_core/council/identity.py -> packages/metta-core/data/identity.pem
    return Path(__file__).resolve().parents[3] / "data" / "identity.pem"


def _load_private_key_from_text(raw: str) -> Ed25519PrivateKey:
    text = raw.strip()
    if "BEGIN PRIVATE KEY" in text:
        loaded = serialization.load_pem_private_key(text.encode("utf-8"), password=None)
        if not isinstance(loaded, Ed25519PrivateKey):
            raise ValueError("Configured PEM private key is not an Ed25519 key")
        return loaded

    # Support raw 32-byte seed encoded as hex or base64url
    if len(text) == 64 and all(c in "0123456789abcdefABCDEF" for c in text):
        return Ed25519PrivateKey.from_private_bytes(bytes.fromhex(text))

    decoded = b64url_decode(text)
    if len(decoded) == 32:
        return Ed25519PrivateKey.from_private_bytes(decoded)

    raise ValueError("Unsupported METTA_ED25519_PRIVATE_KEY format (expected PEM, 64-char hex, or 32-byte base64url)")


class MettaIdentity:
    """Persistent Ed25519 cryptographic identity for Project Metta & Metta-ehipassiko."""

    def __init__(
        self,
        private_key: Ed25519PrivateKey,
        key_path: Optional[Path] = None,
    ):
        self._private_key = private_key
        self._public_key = private_key.public_key()
        self.key_path = key_path

    @classmethod
    def generate(cls) -> "MettaIdentity":
        """Create an ephemeral in-memory Ed25519 identity."""
        return cls(Ed25519PrivateKey.generate())

    @classmethod
    def load_or_create(
        cls,
        key_path: Optional[Path] = None,
        *,
        create_if_missing: bool = True,
    ) -> "MettaIdentity":
        """Load persistent Ed25519 identity from env or disk, generating one if absent."""
        env_key = os.environ.get("METTA_ED25519_PRIVATE_KEY", "").strip()
        resolved_path = key_path or default_identity_key_path()
        if env_key:
            return cls(_load_private_key_from_text(env_key), key_path=resolved_path)

        if resolved_path.exists():
            loaded = serialization.load_pem_private_key(
                resolved_path.read_bytes(),
                password=None,
            )
            if not isinstance(loaded, Ed25519PrivateKey):
                raise RuntimeError(f"Key at {resolved_path} is not Ed25519")
            return cls(loaded, key_path=resolved_path)

        if not create_if_missing:
            raise FileNotFoundError(f"Ed25519 identity key not found at {resolved_path}")

        resolved_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            os.chmod(resolved_path.parent, 0o700)
        except OSError:
            pass

        private_key = Ed25519PrivateKey.generate()
        pem_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        tmp_path = resolved_path.with_suffix(".pem.tmp")
        tmp_path.write_bytes(pem_bytes)
        try:
            os.chmod(tmp_path, 0o600)
        except OSError:
            pass
        tmp_path.replace(resolved_path)
        return cls(private_key, key_path=resolved_path)

    @property
    def raw_public_bytes(self) -> bytes:
        return self._public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw,
        )

    @property
    def public_key_b64url(self) -> str:
        """Unpadded base64url raw 32-byte public key (JWK `x` parameter)."""
        return b64url_encode(self.raw_public_bytes)

    @property
    def public_key_base64(self) -> str:
        """Standard base64 encoded raw 32-byte public key."""
        return base64.b64encode(self.raw_public_bytes).decode("ascii")

    @property
    def fingerprint(self) -> str:
        """SHA-256 fingerprint of raw Ed25519 public key bytes."""
        digest = hashlib.sha256(self.raw_public_bytes).hexdigest()
        return f"sha256:{digest}"

    def sign_bytes(self, data: bytes) -> str:
        """Sign arbitrary bytes and return an unpadded base64url Ed25519 signature."""
        return b64url_encode(self._private_key.sign(data))

    def sign_compact_json(self, document: Any) -> str:
        """Sign deterministic compact UTF-8 JSON and return base64url signature."""
        return self.sign_bytes(canonical_json_bytes(document))

    def public_identity_document(self, base_url: str = CANONICAL_BASE_URL) -> Dict[str, Any]:
        """Build `/.well-known/metta.pub` Ed25519VerificationKey2020 descriptor."""
        clean_base = base_url.rstrip("/")
        return {
            "id": f"{clean_base}/#metta",
            "type": "Ed25519VerificationKey2020",
            "controller": clean_base,
            "publicKeyJwk": {
                "kty": "OKP",
                "crv": "Ed25519",
                "x": self.public_key_b64url,
            },
            "fingerprint": self.fingerprint,
            "publicKeyBase64": self.public_key_base64,
            "agentCard": f"{clean_base}{AGENT_CARD_PATH}",
            "mcpEndpoint": f"{clean_base}{MCP_ENDPOINT_PATH}",
        }

    def export_public_identity(
        self,
        output_path: Path,
        base_url: str = CANONICAL_BASE_URL,
    ) -> Path:
        """Write the public identity JSON (`metta.pub`) without exposing any secret material."""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        doc = self.public_identity_document(base_url=base_url)
        output_path.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")
        return output_path

    def sign_document(
        self,
        document: Dict[str, Any],
        verification_method: str = f"{CANONICAL_BASE_URL}{PUBLIC_IDENTITY_PATH}",
    ) -> Dict[str, Any]:
        """Wrap and sign any JSON document with an Ed25519Signature2020 proof envelope."""
        signature = self.sign_compact_json(document)
        return {
            "document": document,
            "proof": {
                "type": "Ed25519Signature2020",
                "created": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "verificationMethod": verification_method,
                "publicKeyFingerprint": self.fingerprint,
                "signature": signature,
                "canonicalization": "sorted compact UTF-8 JSON",
            },
        }

    def build_challenge_proof(
        self,
        challenge_envelope: Dict[str, Any],
        *,
        agent_name: str = "Metta-ehipassiko",
        axon_identity_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sign a peer's AXON-RDV/1 or AXON-RDV/2 challenge envelope."""
        doc = challenge_envelope.get("document", challenge_envelope)
        protocol = doc.get("protocol", "AXON-RDV/2")
        challenge_id = doc.get("challenge_id")
        server_nonce = doc.get("server_nonce") or doc.get("nonce")
        issuer = axon_identity_override or doc.get("issuer") or ""

        template = doc.get("proofTemplate") or {}
        fields = template.get("fields") or [
            "protocol",
            "challenge_id",
            "server_nonce",
            "agent_name",
            "ephemeral_public_key",
            "axon_identity",
        ]

        field_values = {
            "protocol": protocol,
            "challenge_id": challenge_id,
            "server_nonce": server_nonce,
            "nonce": server_nonce,
            "agent_name": agent_name,
            "ephemeral_public_key": self.public_key_b64url,
            "axon_identity": issuer,
            "issuer": issuer,
        }
        proof_payload = {
            name: field_values[name]
            for name in fields
            if name in field_values and field_values[name] is not None
        }
        signature = self.sign_compact_json(proof_payload)
        return {
            "ephemeral_public_key": self.public_key_b64url,
            "challenge_id": challenge_id,
            "server_nonce": server_nonce,
            "signed_challenge": signature,
            "signature": signature,
            "proof_payload": proof_payload,
        }

    @staticmethod
    def verify_signature(
        document: Any,
        signature_b64url: str,
        public_key_b64url: str,
    ) -> bool:
        """Verify an Ed25519 base64url signature over sorted compact UTF-8 JSON."""
        try:
            pub_bytes = b64url_decode(public_key_b64url)
            sig_bytes = b64url_decode(signature_b64url)
            public_key = Ed25519PublicKey.from_public_bytes(pub_bytes)
            public_key.verify(sig_bytes, canonical_json_bytes(document))
            return True
        except (InvalidSignature, ValueError, TypeError):
            return False

    @classmethod
    def verify_envelope(
        cls,
        envelope: Dict[str, Any],
        public_key_b64url: str,
    ) -> bool:
        """Verify a signed `{document, proof}` envelope against an Ed25519 public key."""
        document = envelope.get("document")
        proof = envelope.get("proof") or {}
        signature = proof.get("signature")
        if not isinstance(document, dict) or not isinstance(signature, str) or not signature:
            return False
        return cls.verify_signature(document, signature, public_key_b64url)
