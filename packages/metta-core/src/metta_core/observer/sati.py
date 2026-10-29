"""The Observer Layer (Sati / Mindfulness).

Mindfully analyzes user speech without judgment, extracting emotional tone,
underlying cognitive knots, and essential guidance needs.
"""

import json
import logging
from typing import List, Optional
from pydantic import BaseModel, Field

from metta_core.providers.base import LLMProvider

logger = logging.getLogger("metta.observer.sati")


class Observation(BaseModel):
    """The mindful diagnosis of the user's state."""

    emotional_state: str = Field(description="Primary emotion: fear, overwhelm, grief, anger, confusion, exhaustion, or calm")
    cognitive_knot: str = Field(description="The underlying illusion or mental entanglement")
    core_need: str = Field(description="'direction', 'comfort', 'stillness', 'perspective', or 'unburdening'")
    keywords: List[str] = Field(default_factory=list, description="Extracted emotional and situation keywords")
    urgency_level: str = Field(description="'calm', 'moderate', 'acute'")


SATI_SYSTEM_PROMPT = """You are the Observer (Sati / Mindfulness) in Metta.
Your purpose is to look deeply and gently into human speech to discern the emotional resonance,
the cognitive knot (where attachment or confusion exists), and the true underlying need.
You do NOT answer the user's question; you purely produce a clean diagnostic assessment.

Respond ONLY with valid JSON in this exact structure:
{
  "emotional_state": "e.g. overwhelm, anxiety, sorrow, anger, exhaustion, restlessness",
  "cognitive_knot": "e.g. Clinging to past outcome, believing all problems must be resolved simultaneously",
  "core_need": "direction" | "comfort" | "stillness" | "perspective" | "unburdening",
  "keywords": ["overwhelmed", "mess", "paralyzed"],
  "urgency_level": "calm" | "moderate" | "acute"
}
"""


class Observer:
    """Mindfully observes user input and generates an Observation."""

    def __init__(self, provider: LLMProvider):
        self.provider = provider

    async def observe(self, user_text: str) -> Observation:
        """Observe user text and extract deep emotional and cognitive state."""
        prompt = f"Mindfully observe this speech:\n\"\"\"{user_text}\"\"\""
        
        try:
            response_text = await self.provider.generate(
                prompt=prompt,
                system_instruction=SATI_SYSTEM_PROMPT,
                effort="medium",
                json_output=True,
            )

            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()

            parsed = json.loads(clean_text)
            return Observation(
                emotional_state=parsed.get("emotional_state", "distress"),
                cognitive_knot=parsed.get("cognitive_knot", "Unspecified confusion"),
                core_need=parsed.get("core_need", "direction"),
                keywords=parsed.get("keywords", []),
                urgency_level=parsed.get("urgency_level", "moderate"),
            )
        except Exception as e:
            logger.warning("Observer fallback due to error: %s", e)
            return Observation(
                emotional_state="distress",
                cognitive_knot="Cognitive turbulence",
                core_need="direction",
                keywords=[w.lower() for w in user_text.split()[:5]],
                urgency_level="moderate",
            )
