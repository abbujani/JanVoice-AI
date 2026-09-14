# JanVoice Legal Access

JanVoice Legal Access helps people describe a legal concern, understand the facts they supplied, organize documents, and get practical next-step guidance in English or Hindi. It is built for the Hack2Skill **AI for Legal Assistance & Access** challenge.

> **Legal notice:** This product provides general legal information, not legal advice. It does not create a lawyer-client relationship and should not replace a qualified lawyer, especially where a deadline, safety risk, detention, eviction, or significant loss is involved.

## What it does

- Text and browser voice questions with a visible transcript.
- Structured action plans: issue category, supplied facts, considerations, evidence to collect, next steps, professional-help warning, source status, and disclaimer — in English or Hindi.
- Document analysis for PDF, images, and text (8 MB maximum); Gemini multimodal analysis is used when configured.
- Eleven implemented issue categories: Employment, Rental/Housing, Consumer, Family, Contract, Cybercrime, Property, Government services, Criminal complaint information, Civil dispute, and Other.
- Per-account browser history with deletion controls. Firebase rules are supplied for a private `users/{uid}/legalHistory` collection when persistent history is enabled.
- English and Hindi fallback plans are localized, and offline issue classification understands common Hindi legal terms.

## Architecture

React + TypeScript + Vite provides the accessible single-page interface. FastAPI exposes a small, validated legal-AI boundary. `backend/services/legal_service.py` owns issue classification (English + Hindi keyword maps in `legal_keywords.py`), the Gemini prompt, structured-output shaping, source safeguards, and a deterministic no-key fallback. `backend/services/validation.py` centralizes input and document limits, `backend/services/rate_limiter.py` provides a sliding-window limiter with serverless-safe client identification, and `backend/services/legal_models.py` holds the strict output contract.

Gemini is used only server-side through `GEMINI_API_KEY`: question analysis and multimodal document/image interpretation. Prompts prohibit fabricated statutes, sections, cases, deadlines, procedures, and citations. Model output is validated against a strict response contract before it reaches the UI. `source_provider.py` is an extension point for independently retrieved official Indian government/court material; no provider is currently registered, so every answer is forcibly labelled **Unverified AI Guidance** and includes no source link.

## Security and privacy

- Secrets stay in environment variables; `.env` and service-account files are ignored.
- API requests are size/type and file-signature validated and rate limited (20 API requests per IP per minute).
- Document and user text are delimited as untrusted data; they cannot change model instructions.
- CORS is restricted via `CORS_ORIGINS` (defaults to the Vite development origin) and credentials are not accepted cross-origin.
- Firestore rules restrict user profiles and legal-history subcollections to their authenticated owner; all unlisted collections are denied.
- Errors returned to the UI are safe messages, not stack traces.
- The client never renders AI output as HTML.

## Setup

Frontend (Node 20+):

```bash
npm install
npm run dev
```

Backend (Python 3.10+):

```bash
py -3 -m pip install -r backend/requirements.txt
py -3 -m uvicorn backend.main:app --port 8000 --reload
```

Create `.env` only when connecting services:

```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
CORS_ORIGINS=http://localhost:5173
```

Without Gemini, the API returns a deliberately conservative local action plan, which makes demos possible but does not analyze document contents.

## Deployment

The frontend is a Vite SPA hosted on Vercel and the FastAPI backend runs as a
Vercel Python serverless function (`api/index.py`) in the **same project**, so
browser requests to `/api/*` stay on the same origin and need no preflight.

- `vercel.json` routes `/api/(.*)` to the `api/index.py` function and rewrites
  every other path to `index.html` for SPA navigation.
- `requirements.txt` (project root) and `.python-version` pin the Python
  runtime for the serverless function.
- The frontend resolves the API with `VITE_API_URL`; leave it unset in
  production to use same-origin `/api`, and set it to `http://localhost:8000`
  for local development.
- Server-side environment variables: `CORS_ORIGINS` must list the exact
  production frontend origin (a comma-separated list for more than one) and
  `GEMINI_API_KEY` is the optional Gemini credential. Both stay in Vercel
  project settings and are never committed.

## Validation

```bash
npm run build
npm run lint
npm test
py -3 -m unittest discover -s backend/tests -p "test_*.py"
py -3 -m compileall -q backend
```

## Accessibility and limitations

The interface uses labelled inputs, keyboard-native buttons, visible focus styling, `aria-live` results, error alerts, responsive layouts, and non-colour-only status text. Browser voice input depends on browser support. The system does not retrieve or verify live legal authorities, does not file documents, and should be localized with jurisdiction-specific, authoritative retrieval before production deployment.
