"""Blind Anonymizer for unbiased multi-model evaluation."""

import re
from typing import List
from metta_core.council.models import CouncilPerspective

# Brand patterns to sanitize
VENDOR_PATTERNS = [
    r"\b(?:I am|As)\s+(?:an?\s+)?(?:AI\s+language\s+model|AI\s+assistant|LLM)\s+(?:developed|trained|created)\s+by\s+[A-Za-z0-9\s,\.]+",
    r"\b(?:I am|I'm)\s+(?:Claude|Gemini|GPT-4|ChatGPT|Llama|Gemma|Mistral|DeepSeek|Qwen)\b[^\n\.]*[\.\n]",
    r"\b(?:created|trained|developed)\s+by\s+(?:Google|OpenAI|Anthropic|Meta|Mistral\s+AI|DeepSeek)\b",
    r"\b(?:as\s+a\s+Google\s+AI|as\s+an\s+Anthropic\s+AI|as\s+an\s+OpenAI\s+model)\b",
]


class BlindAnonymizer:
    """Sanitizes model brand signatures to ensure purely merit-based, unbiased deliberation."""

    @staticmethod
    def sanitize_text(text: str) -> str:
        """Strip vendor self-identification statements."""
        cleaned = text
        for pat in VENDOR_PATTERNS:
            cleaned = re.sub(pat, "From this perspective,", cleaned, flags=re.IGNORECASE)
        # Collapse excessive whitespace
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()

    @classmethod
    def prepare_blind_transcript(cls, perspectives: List[CouncilPerspective]) -> str:
        """Format successful perspectives into an anonymous, comparative transcript."""
        sections = []
        for p in perspectives:
            if not p.is_successful or not p.content.strip():
                continue
            clean_content = cls.sanitize_text(p.content)
            sections.append(f"### {p.anonymized_label}\n{clean_content}")

        if not sections:
            return "(No successful perspectives retrieved from council models)"

        return "\n\n---\n\n".join(sections)
