"""Sliding-Window Rate Limiter with Supabase Cloud Integration and BYOM Unlimited Bypass.

Protects shared community server credits from being overloaded or exhausted.
When a user or external agent supplies their own API key (BYOM), the rate limiter
is automatically bypassed, permitting unlimited throughput with zero waiting.

Dynamically fetches rate limit tiers and per-user custom quotas from Supabase PostgreSQL.
"""

import os
import time
import threading
import logging
from typing import Dict, List, Optional, Any
from pydantic import BaseModel

logger = logging.getLogger("metta.server.rate_limiter")


class RateLimitStatus(BaseModel):
    allowed: bool
    is_byom: bool
    remaining: int
    limit: int
    reset_seconds: int
    tier: Optional[str] = "standard"
    message: Optional[str] = None


class SlidingWindowRateLimiter:
    """Thread-safe sliding-window rate limiter with Supabase tier resolution and BYOM exemption."""

    def __init__(
        self,
        max_per_minute: Optional[int] = None,
        max_per_hour: Optional[int] = None,
        supabase_store: Optional[Any] = None,
    ):
        self.max_per_minute = max_per_minute or int(os.environ.get("METTA_RATE_LIMIT_PER_MINUTE", 15))
        self.max_per_hour = max_per_hour or int(os.environ.get("METTA_RATE_LIMIT_PER_HOUR", 60))
        self.supabase_store = supabase_store
        self._history: Dict[str, List[float]] = {}
        self._lock = threading.Lock()
        self._tier_cache: Dict[str, Any] = {}
        self._cache_timestamp: float = 0.0

    async def resolve_limits(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Dynamically resolve rate limits from Supabase PostgreSQL."""
        now = time.time()
        # Refresh tier configs cache every 30 seconds
        if self.supabase_store and (now - self._cache_timestamp > 30.0 or not self._tier_cache):
            try:
                configs = await self.supabase_store.get_rate_limit_configs()
                if configs:
                    self._tier_cache = {c["tier"]: c for c in configs}
                    self._cache_timestamp = now
            except Exception as e:
                logger.warning("Could not refresh rate limit configs from Supabase: %s", e)

        if self.supabase_store and user_id:
            try:
                user_res = await self.supabase_store.get_user_rate_limit(user_id)
                if self.max_per_minute != 15:
                    user_res["max_per_minute"] = self.max_per_minute
                if self.max_per_hour != 60:
                    user_res["max_per_hour"] = self.max_per_hour
                return user_res
            except Exception as e:
                logger.warning("Could not fetch user rate limit from Supabase: %s", e)

        tier = "standard" if user_id else "guest"
        tier_cfg = self._tier_cache.get(tier) or self._tier_cache.get("global_default")
        if tier_cfg:
            tier_min = tier_cfg.get("max_per_minute", 15)
            tier_hr = tier_cfg.get("max_per_hour", 60)
            min_limit = self.max_per_minute if self.max_per_minute != 15 else tier_min
            hr_limit = self.max_per_hour if self.max_per_hour != 60 else tier_hr
            return {
                "tier": tier,
                "max_per_minute": min_limit,
                "max_per_hour": hr_limit,
                "description": tier_cfg.get("description", ""),
            }

        return {
            "tier": tier,
            "max_per_minute": self.max_per_minute,
            "max_per_hour": self.max_per_hour,
            "description": "Default configuration",
        }

    async def check_async(
        self,
        client_id: str,
        is_byom: bool = False,
        user_id: Optional[str] = None,
    ) -> RateLimitStatus:
        """Asynchronously check rate limit, dynamically resolving tier from Supabase."""
        if is_byom:
            return RateLimitStatus(
                allowed=True,
                is_byom=True,
                remaining=9999,
                limit=9999,
                reset_seconds=0,
                tier="byom",
                message="Unlimited BYOM active: running on your personal API key quota.",
            )

        resolved = await self.resolve_limits(user_id)
        max_min = resolved.get("max_per_minute", self.max_per_minute)
        max_hr = resolved.get("max_per_hour", self.max_per_hour)
        tier = resolved.get("tier", "standard")

        return self.check(
            client_id,
            is_byom=False,
            max_per_minute=max_min,
            max_per_hour=max_hr,
            tier=tier,
        )

    def check(
        self,
        client_id: str,
        is_byom: bool = False,
        max_per_minute: Optional[int] = None,
        max_per_hour: Optional[int] = None,
        tier: str = "standard",
    ) -> RateLimitStatus:
        """Check whether client request is allowed or rate limited."""
        # 1. BYOM Exemption: Completely bypass rate limits!
        if is_byom:
            return RateLimitStatus(
                allowed=True,
                is_byom=True,
                remaining=9999,
                limit=9999,
                reset_seconds=0,
                tier="byom",
                message="Unlimited BYOM active: running on your personal API key quota.",
            )

        effective_max_minute = max_per_minute or self.max_per_minute
        effective_max_hour = max_per_hour or self.max_per_hour

        now = time.time()
        minute_ago = now - 60.0
        hour_ago = now - 3600.0

        with self._lock:
            # Clean timestamps older than 1 hour
            records = [ts for ts in self._history.get(client_id, []) if ts > hour_ago]

            minute_records = [ts for ts in records if ts > minute_ago]

            # Check minute limit
            if len(minute_records) >= effective_max_minute:
                oldest_in_minute = minute_records[0]
                reset_seconds = max(1, int(60.0 - (now - oldest_in_minute)))
                return RateLimitStatus(
                    allowed=False,
                    is_byom=False,
                    remaining=0,
                    limit=effective_max_minute,
                    reset_seconds=reset_seconds,
                    tier=tier,
                    message=(
                        f"Shared community quota paused ({effective_max_minute} req/min for {tier} tier). "
                        f"Please wait {reset_seconds}s for reset, or supply your own API key in Settings (BYOM) "
                        "to proceed immediately with zero rate limits."
                    ),
                )

            # Check hour limit
            if len(records) >= effective_max_hour:
                oldest_in_hour = records[0]
                reset_seconds = max(1, int(3600.0 - (now - oldest_in_hour)))
                return RateLimitStatus(
                    allowed=False,
                    is_byom=False,
                    remaining=0,
                    limit=effective_max_hour,
                    reset_seconds=reset_seconds,
                    tier=tier,
                    message=(
                        f"Hourly community quota reached ({effective_max_hour} req/hr for {tier} tier). "
                        f"Reset in {reset_seconds}s, or switch to your own BYOM key in Settings (⚙️)."
                    ),
                )

            # Record this turn
            records.append(now)
            self._history[client_id] = records

            remaining_minute = effective_max_minute - len(minute_records) - 1
            remaining_hour = effective_max_hour - len(records)
            remaining = max(0, min(remaining_minute, remaining_hour))

            return RateLimitStatus(
                allowed=True,
                is_byom=False,
                remaining=remaining,
                limit=effective_max_minute,
                reset_seconds=0,
                tier=tier,
                message=None,
            )

    def clear(self, client_id: Optional[str] = None):
        """Reset records (for testing or administrative release)."""
        with self._lock:
            if client_id:
                self._history.pop(client_id, None)
            else:
                self._history.clear()
