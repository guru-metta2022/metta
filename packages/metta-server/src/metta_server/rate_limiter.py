"""Sliding-Window Rate Limiter with BYOM (Bring Your Own Model) Unlimited Bypass.

Protects shared community server credits from being overloaded or exhausted.
When a user or external agent supplies their own API key (BYOM), the rate limiter
is automatically bypassed, permitting unlimited throughput with zero waiting.
"""

import os
import time
import threading
from typing import Dict, List, Optional
from pydantic import BaseModel


class RateLimitStatus(BaseModel):
    allowed: bool
    is_byom: bool
    remaining: int
    limit: int
    reset_seconds: int
    message: Optional[str] = None


class SlidingWindowRateLimiter:
    """Thread-safe sliding-window rate limiter with BYOM exemption."""

    def __init__(
        self,
        max_per_minute: Optional[int] = None,
        max_per_hour: Optional[int] = None,
    ):
        self.max_per_minute = max_per_minute or int(os.environ.get("METTA_RATE_LIMIT_PER_MINUTE", 10))
        self.max_per_hour = max_per_hour or int(os.environ.get("METTA_RATE_LIMIT_PER_HOUR", 40))
        self._history: Dict[str, List[float]] = {}
        self._lock = threading.Lock()

    def check(self, client_id: str, is_byom: bool = False) -> RateLimitStatus:
        """Check whether client request is allowed or rate limited."""
        # 1. BYOM Exemption: Completely bypass rate limits!
        if is_byom:
            return RateLimitStatus(
                allowed=True,
                is_byom=True,
                remaining=9999,
                limit=9999,
                reset_seconds=0,
                message="Unlimited BYOM active: running on your personal API key quota.",
            )

        now = time.time()
        minute_ago = now - 60.0
        hour_ago = now - 3600.0

        with self._lock:
            # Clean timestamps older than 1 hour
            records = [ts for ts in self._history.get(client_id, []) if ts > hour_ago]

            minute_records = [ts for ts in records if ts > minute_ago]

            # Check minute limit
            if len(minute_records) >= self.max_per_minute:
                oldest_in_minute = minute_records[0]
                reset_seconds = max(1, int(60.0 - (now - oldest_in_minute)))
                return RateLimitStatus(
                    allowed=False,
                    is_byom=False,
                    remaining=0,
                    limit=self.max_per_minute,
                    reset_seconds=reset_seconds,
                    message=(
                        f"Shared community quota paused ({self.max_per_minute} req/min). "
                        f"Please wait {reset_seconds}s for reset, or supply your own API key in Settings (BYOM) "
                        "to proceed immediately with zero rate limits."
                    ),
                )

            # Check hour limit
            if len(records) >= self.max_per_hour:
                oldest_in_hour = records[0]
                reset_seconds = max(1, int(3600.0 - (now - oldest_in_hour)))
                return RateLimitStatus(
                    allowed=False,
                    is_byom=False,
                    remaining=0,
                    limit=self.max_per_hour,
                    reset_seconds=reset_seconds,
                    message=(
                        f"Hourly community quota reached ({self.max_per_hour} req/hr). "
                        f"Reset in {reset_seconds}s, or switch to your own BYOM key in Settings (⚙️)."
                    ),
                )

            # Record this turn
            records.append(now)
            self._history[client_id] = records

            remaining_minute = self.max_per_minute - len(minute_records) - 1
            remaining_hour = self.max_per_hour - len(records)
            remaining = max(0, min(remaining_minute, remaining_hour))

            return RateLimitStatus(
                allowed=True,
                is_byom=False,
                remaining=remaining,
                limit=self.max_per_minute,
                reset_seconds=0,
                message=None,
            )

    def clear(self, client_id: Optional[str] = None):
        """Reset records (for testing or administrative release)."""
        with self._lock:
            if client_id:
                self._history.pop(client_id, None)
            else:
                self._history.clear()
