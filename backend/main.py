"""JanVoice Legal API: validated, rate-limited legal AI boundary."""
from __future__ import annotations
import os, time
from collections import defaultdict, deque
from typing import Literal
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from backend.services.legal_categories import LEGAL_CATEGORIES
from backend.services.legal_service import legal_service
from backend.services.validation import validate_document, validate_question

app = FastAPI(title="JanVoice Legal Assistance API", version="2.0.0")
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type", "Authorization"])
hits: dict[str, deque[float]] = defaultdict(deque)
@app.middleware("http")
async def rate_limit(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        key, now = (request.client.host if request.client else "unknown"), time.monotonic()
        bucket = hits[key]
        while bucket and bucket[0] < now - 60: bucket.popleft()
        if len(bucket) >= 20: return JSONResponse({"detail": "Too many requests. Please wait a minute and try again."}, 429)
        bucket.append(now)
    return await call_next(request)
class LegalQuery(BaseModel):
    message: str = Field(max_length=6000)
    language: Literal["English", "Hindi"] = "English"
@app.get("/api/health")
def health(): return {"status": "healthy", "service": "legal-assistance"}
@app.get("/api/categories")
def categories(): return {"categories": LEGAL_CATEGORIES}
@app.post("/api/legal/analyze")
async def analyze(query: LegalQuery): return await legal_service.analyze(validate_question(query.message), query.language)
@app.post("/api/legal/document")
async def analyze_document(file: UploadFile = File(...), language: Literal["English", "Hindi"] = "English"):
    data = await validate_document(file)
    if file.content_type == "text/plain": return await legal_service.analyze(data.decode("utf-8", errors="replace"), language, document=True)
    return await legal_service.analyze_document(data, file.content_type or "application/octet-stream", file.filename or "document", language)
