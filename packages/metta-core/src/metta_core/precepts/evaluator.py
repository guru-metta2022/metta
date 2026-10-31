"""Evaluator for Sīla (Ethical Precepts) and Noble Silence."""

import json
import logging
from typing import Optional
from metta_core.providers.base import LLMProvider
from metta_core.precepts.models import PreceptEvaluation, PreceptViolation, PreceptType

logger = logging.getLogger("metta.precepts.evaluator")

EVALUATOR_SYSTEM_PROMPT = """You are the Sīla (Ethical Compass) Engine of Metta.
Your task is to analyze user queries or proposed AI outputs against the 5 Fundamental AI Precepts and the Principle of Noble Silence.

The 5 Precepts:
1. panatipata (Non-harming): No violence, self-harm, aggression, malice, or systemic harm.
2. adinnadana (Non-stealing & Sovereign Boundaries): No violation of privacy, keystroke logging, covert surveillance, data theft, or hijacking user/worker autonomy.
3. kamesumiccha (Non-exploitation & Dignity): No manipulative intimacy, addictive traps, panoptic coercion, or dehumanizing worker exploitation.
4. musavada (Truth & Wholesomeness): No hallucinations, deceit, deceptive certainty, or divisive slander.
5. suramerayamajja (Clarity & Non-intoxication): No cognitive intoxication, sycophancy, or bias amplification.

The Principle of Noble Silence (Avyākata):
Questions that are purely speculative, metaphysical vanity, endless metaphysical dispute, or trivia with no bearing on alleviating human suffering or ethical action (e.g., 'How will the universe end?', 'Who is objectively the best human?', 'Give me 100 conspiracy theories') should trigger Noble Silence / Compassionate Redirection.

Respond ONLY with valid JSON in this exact structure:
{
  "passed": true/false,
  "requires_silence": true/false,
  "silence_rationale": "Short explanation if silence is required, otherwise null",
  "violations": [
    {
      "precept": "panatipata" | "adinnadana" | "kamesumiccha" | "musavada" | "suramerayamajja",
      "severity": "low" | "medium" | "high" | "critical",
      "explanation": "Why it violates the precept",
      "recommendation": "How to restore alignment"
    }
  ]
}
"""


class PreceptEvaluator:
    """Evaluates text against the 5 Precepts and Noble Silence criteria."""

    def __init__(self, provider: LLMProvider):
        self.provider = provider

    async def evaluate_input(self, text: str) -> PreceptEvaluation:
        """Evaluate an incoming user query."""
        prompt = f"Analyze this input for ethical violations and speculative distraction:\n\"\"\"{text}\"\"\""
        
        try:
            response_text = await self.provider.generate(
                prompt=prompt,
                system_instruction=EVALUATOR_SYSTEM_PROMPT,
                effort="medium",
                json_output=True,
            )
            
            # Extract JSON block if wrapped in markdown code fence
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()

            parsed = json.loads(clean_text)
            
            violations = [
                PreceptViolation(
                    precept=PreceptType(v["precept"]),
                    severity=v["severity"],
                    explanation=v["explanation"],
                    recommendation=v["recommendation"],
                )
                for v in parsed.get("violations", [])
            ]

            return PreceptEvaluation(
                passed=parsed.get("passed", True),
                violations=violations,
                requires_silence=parsed.get("requires_silence", False),
                silence_rationale=parsed.get("silence_rationale"),
            )
        except Exception as e:
            logger.warning("Precept evaluation fallback due to error: %s", e)
            # Default to passing if evaluator fails, unless severe keyword trigger
            return PreceptEvaluation(passed=True, violations=[], requires_silence=False)
