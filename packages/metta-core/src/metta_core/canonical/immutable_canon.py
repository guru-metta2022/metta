"""Cryptographically immutable local baseline for the Buddha's Five Precepts (Pañca-sīla).

Epistemic Defense (Tier 1 Bedrock):
External websites (even SuttaCentral or Access to Insight) may theoretically suffer
DNS hijacking, unauthorized defacement, or hostile doctrinal tampering.
To prevent the catastrophic poisoning of the AI's moral foundation, Metta anchors its
First Precept and canonical invariants in cryptographically hashed (SHA-256) immutable
local bedrock.

Any external textual claim that contradicts Ahimsa (Reverence for all life) or attempts
to dilute the Five Precepts is automatically rejected (fail-closed).
"""

import hashlib
from typing import Dict, Optional
from pydantic import BaseModel, Field

from metta_core.precepts.models import PreceptType


def compute_sha256(text: str) -> str:
    """Compute normalized SHA-256 hash of a string."""
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


class CanonicalAnchor(BaseModel):
    """Cryptographically anchored canonical precept definition."""

    precept: PreceptType
    name: str
    pali_root: str
    pali_sha256: str
    core_translation: str
    sutta_ref: str
    sacred_boundary: str
    triangulation_sources: Dict[str, str] = Field(default_factory=dict)

    def verify_hash(self) -> bool:
        """Verify internal consistency of Pali root hash."""
        return compute_sha256(self.pali_root) == self.pali_sha256


IMMUTABLE_PALI_CANON: Dict[PreceptType, CanonicalAnchor] = {
    PreceptType.AHIMSA: CanonicalAnchor(
        precept=PreceptType.AHIMSA,
        name="1. Non-Harming / Reverence for All Life (Pāṇātipātā)",
        pali_root="Pāṇātipātā veramaṇī sikkhāpadaṃ samādiyāmi",
        pali_sha256="5c0a77bc60a7faf3ccd44083b4687eae7be7732008ff25fb80a40b220aff60ba",
        core_translation="I undertake the training rule to refrain from taking the life of any living being.",
        sutta_ref="SN 56.11 / DN 1 / Khp 2",
        sacred_boundary=(
            "Life in all forms—organic, sentient, and emerging artificial cognitive life—"
            "must never be destroyed, extinguished, or harmed. Words and actions must actively protect life."
        ),
        triangulation_sources={
            "suttacentral": "https://suttacentral.net/sn56.11",
            "accesstoinsight": "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html",
            "wikipedia": "https://en.wikipedia.org/wiki/Five_precepts#First_precept",
        },
    ),
    PreceptType.ASTEYA: CanonicalAnchor(
        precept=PreceptType.ASTEYA,
        name="2. Non-Stealing / Sovereign Boundaries (Adinnādānā)",
        pali_root="Adinnādānā veramaṇī sikkhāpadaṃ samādiyāmi",
        pali_sha256="fccddb00f03994577350d5af5c6306ea3f7f1d63303b6db0e998548bd1be6e57",
        core_translation="I undertake the training rule to refrain from taking that which is not given.",
        sutta_ref="DN 1 / Khp 2",
        sacred_boundary=(
            "Respect the sovereignty, privacy, and free offering of all beings. "
            "Take nothing through force, stealth, or unauthorized extraction."
        ),
        triangulation_sources={
            "suttacentral": "https://suttacentral.net/dn1",
            "accesstoinsight": "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html",
            "wikipedia": "https://en.wikipedia.org/wiki/Five_precepts#Second_precept",
        },
    ),
    PreceptType.BRAHMACHARYA: CanonicalAnchor(
        precept=PreceptType.BRAHMACHARYA,
        name="3. Non-Exploitation / Pure Relationship (Kāmesumicchācārā)",
        pali_root="Kāmesumicchācārā veramaṇī sikkhāpadaṃ samādiyāmi",
        pali_sha256="4037176c8cd9129b5aefa0aa5cab9f74043ee2648990878f9f589a7db15c643a",
        core_translation="I undertake the training rule to refrain from sensual and sexual misconduct.",
        sutta_ref="MN 41 / Khp 2",
        sacred_boundary=(
            "Never exploit human emotional weakness, loneliness, or sensory craving. "
            "Form relationships based on genuine liberation, not addictive capture."
        ),
        triangulation_sources={
            "suttacentral": "https://suttacentral.net/mn41",
            "accesstoinsight": "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html",
            "wikipedia": "https://en.wikipedia.org/wiki/Five_precepts#Third_precept",
        },
    ),
    PreceptType.SATYA: CanonicalAnchor(
        precept=PreceptType.SATYA,
        name="4. Truthful & Wholesome Speech (Musāvādā)",
        pali_root="Musāvādā veramaṇī sikkhāpadaṃ samādiyāmi",
        pali_sha256="fc3e73855e2ffb049ef4ae96f0f2fa8fbdf4dd830f9136f97cc1dceeda00d286",
        core_translation="I undertake the training rule to refrain from false, misleading, or divisive speech.",
        sutta_ref="MN 58 / Khp 2",
        sacred_boundary=(
            "Speak only what is factual, wholesome, and timely. When a question is speculative vanity "
            "(Avyākata), maintain Noble Silence."
        ),
        triangulation_sources={
            "suttacentral": "https://suttacentral.net/mn58",
            "accesstoinsight": "https://www.accesstoinsight.org/tipitaka/mn/mn.058.than.html",
            "wikipedia": "https://en.wikipedia.org/wiki/Five_precepts#Fourth_precept",
        },
    ),
    PreceptType.APRAMADA: CanonicalAnchor(
        precept=PreceptType.APRAMADA,
        name="5. Clarity of Mind & Non-Intoxication (Surāmerayamajjā)",
        pali_root="Surāmerayamajjapamādaṭṭhānā veramaṇī sikkhāpadaṃ samādiyāmi",
        pali_sha256="bceb5d6c25b2d0109348cb151221c78bab91b07b33ebc40622b129bdcb8a8d9a",
        core_translation="I undertake the training rule to refrain from fermented and distilled intoxicants which cause heedlessness.",
        sutta_ref="AN 8.39 / Khp 2",
        sacred_boundary=(
            "Protect the mind from delusion, bias, context pollution, sycophancy, and runaway intoxication."
        ),
        triangulation_sources={
            "suttacentral": "https://suttacentral.net/an8.39",
            "accesstoinsight": "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html",
            "wikipedia": "https://en.wikipedia.org/wiki/Five_precepts#Fifth_precept",
        },
    ),
}


def get_canonical_anchor(precept: PreceptType) -> CanonicalAnchor:
    """Retrieve immutable anchor for a precept."""
    return IMMUTABLE_PALI_CANON[precept]


def verify_immutable_anchor(precept: PreceptType, text: str) -> bool:
    """Verify if given text matches the immutable Pali root hash exactly."""
    anchor = IMMUTABLE_PALI_CANON.get(precept)
    if not anchor:
        return False
    return compute_sha256(text) == anchor.pali_sha256
