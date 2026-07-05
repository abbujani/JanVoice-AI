# JanVoice AI 🗳️
> **Every Citizen's Voice. Every Development Decision Powered by AI.**

Winner-tier AI Decision Intelligence System built for the **Google Build with AI: Code for Communities Hackathon**. JanVoice AI bridges the gap between regional communities and their Members of Parliament (MPs) by translating citizen submissions (voice, text, images, location) into structured development project recommendations.

---

## Key Features

1. **Multilingual Voice AI**: Citizens record audio inside the browser. Gemini's multimodal audio engine transcribes, auto-detects language, and translates speech to English in a single call.
2. **Vision AI Analysis**: Gemini Vision analyzes uploaded images of civic infrastructure damage (potholes, garbage, leaks) and generates structural summaries.
3. **NLP Processing Pipeline**: Classifies reports, estimates urgency ranks, detects sentiments, and extracts keywords.
4. **Spatial Duplicate Engine**: Clusters complaints within 300 meters, aggregates citizen impact, and flags duplicates.
5. **AI Development Engine**: Automatically recommends projects (e.g., "Pave Bazar Road") with a calculated **Priority Score (out of 100)**, detailed explanations, budget tiers, and beneficiary forecasts.
6. **MP Dashboard**: Rich visual charts (using Recharts), live incident maps (Google Maps Heatmaps), and a conversational AI chat assistant.
7. **Role-Based Sandbox Panel**: A toggle system allowing reviewers to instantly inspect the Citizen, MP, and Administrator views.

---

## Tech Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Recharts.
* **Backend**: FastAPI (Python), Uvicorn, Google GenAI SDK.
* **Database & Authentication**: Firebase Authentication, Firestore, Real-time Snapshot listeners.

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
# Frontend Keys
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=http://localhost:8000

# Backend Keys
GEMINI_API_KEY=your_gemini_api_key
PORT=8000
```

*Note: If no Firebase configurations or Gemini API keys are supplied, the application automatically triggers its **standalone offline fallback mode** using local state engines so you can present the full portal instantly.*

---

## Setup Instructions

### 1. Frontend Setup
Make sure you have Node.js v20+ installed.
```bash
# Install dependencies
npm install --legacy-peer-deps

# Build the assets for production
npm run build

# Start the local development server
npm run dev
```

### 2. Backend Setup
Make sure you have Python 3.10+ installed.
```bash
# Navigate to the workspace and install requirements
py -3 -m pip install -r backend/requirements.txt

# Start the FastAPI server
py -3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Directory Layout
* `src/components/`: Reusable components (e.g. `AudioRecorder` canvas visualizer, `LocationPicker` map layer, `GlassCard`).
* `src/context/`: Core states (`AuthContext`, `DataContext` Firestore listeners).
* `src/pages/`: Main application pages (`LandingPage`, dashboards for Citizens, MPs, Admins).
* `backend/services/`: AI pipelines (`gemini_service.py`, `clustering.py`, `dev_engine.py`).
