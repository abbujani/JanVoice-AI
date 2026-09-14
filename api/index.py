"""Vercel Python serverless entry point for the JanVoice Legal API.

Vercel loads the ASGI application exported as `app`. The FastAPI app in
`backend.main` defines all `/api/*` routes (health, categories, legal
analysis, and document analysis).
"""
from backend.main import app