"""Extension point for authoritative-source retrieval.

Providers must return metadata only after fetching and validating a source from an
official Indian government or court domain. No provider is registered yet, so every
answer stays explicitly marked as Unverified AI Guidance.
"""
from typing import Protocol
from backend.services.legal_models import SourceMetadata
class OfficialSourceProvider(Protocol):
    async def search(self, query: str) -> list[SourceMetadata]: ...
class NoSourceProvider:
    async def search(self, query: str) -> list[SourceMetadata]: return []
source_provider: OfficialSourceProvider = NoSourceProvider()
