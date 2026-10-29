"""Voice Dictation Sanitization and Diagnostic Engine."""

import re
import logging
from typing import List, Tuple
from metta_core.gateway.interfaces import VoiceDiagnostics

logger = logging.getLogger("metta.gateway.diagnostics")

# Common microphone noise artifacts and filler words
FILLER_PATTERNS = [
    r"\b(um|uh|umm|ahh|erm|er|mm|hmm)\b",
    r"\[(noise|silence|audio|laughter|cough|sigh|throat-clearing)\]",
    r"\((noise|silence|audio|laughter|cough|sigh)\)",
    r"\.{3,}",  # excessive ellipses
]


class VoiceSanitizer:
    """Sanitizes voice dictation streams across Web, Android, and iOS clients."""

    @staticmethod
    def run_diagnostics(raw_text: str) -> VoiceDiagnostics:
        """Sanitize raw speech transcript and extract diagnostic metrics."""
        if not raw_text or not raw_text.strip():
            return VoiceDiagnostics(
                raw_input=raw_text or "",
                sanitized_input="",
                noise_artifacts_removed=["empty_payload"],
                quality_score=0.0,
                word_count=0,
                is_empty_or_pure_noise=True,
            )

        text = raw_text.strip()
        removed_artifacts: List[str] = []

        # 1. Remove bracketed noise markers
        for pattern in FILLER_PATTERNS:
            matches = re.findall(pattern, text, flags=re.IGNORECASE)
            if matches:
                removed_artifacts.extend(matches)
                text = re.sub(pattern, " ", text, flags=re.IGNORECASE)

        # 2. De-duplicate consecutive repeated stutter words (e.g., "I I I am" -> "I am")
        stutter_pattern = r"\b(\w+)(?:\s+\1\b)+"
        stutters = re.findall(stutter_pattern, text, flags=re.IGNORECASE)
        if stutters:
            removed_artifacts.extend([f"stutter:{s}" for s in stutters])
            text = re.sub(stutter_pattern, r"\1", text, flags=re.IGNORECASE)

        # 3. Clean stray punctuation and whitespace
        text = re.sub(r"^[,\s;.]+", "", text)  # leading punctuation
        text = re.sub(r"\s*,\s*,\s*", ", ", text)  # double commas
        sanitized = re.sub(r"\s+", " ", text).strip()

        # 4. Check if remaining text has substantive speech
        words = sanitized.split()
        word_count = len(words)
        char_count = len(re.sub(r"[^\w]", "", sanitized))

        is_pure_noise = char_count < 2 or word_count == 0

        # Calculate calibrated quality score
        quality_score = 1.0
        if removed_artifacts:
            quality_score = max(0.2, 1.0 - (len(removed_artifacts) * 0.15))
        if is_pure_noise:
            quality_score = 0.0

        logger.debug(
            "Voice diagnostics: raw='%s', sanitized='%s', quality=%.2f, artifacts=%s",
            raw_text, sanitized, quality_score, removed_artifacts
        )

        return VoiceDiagnostics(
            raw_input=raw_text,
            sanitized_input=sanitized,
            noise_artifacts_removed=removed_artifacts,
            quality_score=quality_score,
            word_count=word_count,
            is_empty_or_pure_noise=is_pure_noise,
        )
