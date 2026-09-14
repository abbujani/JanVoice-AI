"""Strict, display-safe contracts for legal-assistance results."""
from typing import Literal
from pydantic import BaseModel, Field, ValidationError
from backend.services.legal_categories import LEGAL_CATEGORIES

class SourceMetadata(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    url: str = Field(pattern=r"^https://")
    publisher: str = Field(min_length=1, max_length=120)
    verified_at: str = Field(min_length=1, max_length=64)

class LegalPlan(BaseModel):
    issue: str
    what_i_understood: str = Field(min_length=1, max_length=3000)
    key_facts: list[str] = Field(max_length=8)
    possible_legal_considerations: list[str] = Field(max_length=8)
    documents_to_collect: list[str] = Field(max_length=8)
    suggested_next_steps: list[str] = Field(max_length=8)
    professional_help_advisable: str = Field(min_length=1, max_length=1500)
    verified_sources: list[SourceMetadata] = Field(default_factory=list, max_length=5)
    source_status: Literal["Unverified AI Guidance", "Verified Official Sources"]
    disclaimer: str = Field(min_length=1, max_length=500)
    language: Literal["English", "Hindi"]

def validate_plan(payload: object, fallback: dict) -> dict:
    """Reject malformed model output and prevent an unverified model from asserting sources."""
    try:
        plan = LegalPlan.model_validate(payload)
    except ValidationError:
        return fallback
    data = plan.model_dump()
    if data["issue"] not in LEGAL_CATEGORIES:
        data["issue"] = fallback["issue"]
    # Source retrieval is intentionally not connected yet. Never let the model self-certify.
    data["verified_sources"] = []
    data["source_status"] = "Unverified AI Guidance"
    data["disclaimer"] = fallback["disclaimer"]
    return data
