"""Sliding-window rate limiter for the statistical API boundary.

Serverless-safe client identification: behind an edge proxy (Vercel) the
leftmost X-Forwarded-For entries can be client-supplied, so the rightmost
entry (set by the edge from the actual peer IP) is used when present.
"""
from __future__ import annotations
import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    def __init__(
        self,
        max_requests: int = 20,
        window_seconds: int = 60,
        max_entries: int = 50_000,
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_entries = max_entries
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def is_rate_limited(self, key: str) -> bool:
        now = time.monotonic()
        bucket = self._hits[key]
        while bucket and bucket[0] < now - self.window_seconds:
            bucket.popleft()
        if len(bucket) >= self.max_requests:
            return True
        bucket.append(now)
        if len(self._hits) > self.max_entries:
            cutoff = now - self.window_seconds
            for stale_key in [k for k, b in self._hits.items() if not b or b[-1] < cutoff]:
                del self._hits[stale_key]
        return False

    @staticmethod
    def client_key(request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[-1].strip()
        return request.client.host if request.client else "unknown"

    def clear(self) -> None:
        """Reset all buckets (used mainly by the test suite)."""
        self._hits.clear()