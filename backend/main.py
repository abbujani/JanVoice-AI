import os
import json
import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import firebase_admin
from firebase_admin import credentials, firestore

from backend.config import settings
from backend.services.gemini_service import gemini_service
from backend.services.clustering import detect_duplicates
from backend.services.dev_engine import DevEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("janvoice_backend")

app = FastAPI(
    title="JanVoice AI Decision Intelligence System",
    description="Backend API running Gemini Multimodal pipelines and duplicate clustering.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin SDK
db_client = None
local_db_path = "backend/local_db.json"

if os.path.exists("service-account.json"):
    try:
        cred = credentials.Certificate("service-account.json")
        firebase_admin.initialize_app(cred)
        db_client = firestore.client()
        logger.info("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}. Falling back to Local JSON Database.")
else:
    logger.warning("service-account.json not found in root. Operating in Local JSON database fallback mode.")

# Local Database Helpers (for zero-config standalone backend tests)
def read_local_db() -> Dict[str, Any]:
    if not os.path.exists(local_db_path):
        os.makedirs(os.path.dirname(local_db_path), exist_ok=True)
        default_db = {"complaints": [], "recommendations": []}
        with open(local_db_path, "w") as f:
            json.dump(default_db, f)
        return default_db
    try:
        with open(local_db_path, "r") as f:
            return json.load(f)
    except Exception:
        return {"complaints": [], "recommendations": []}

def write_local_db(data: Dict[str, Any]):
    with open(local_db_path, "w") as f:
        json.dump(data, f, indent=2)

async def get_all_complaints() -> List[Dict[str, Any]]:
    if db_client:
        try:
            docs = db_client.collection("complaints").stream()
            return [dict(id=d.id, **d.to_dict()) for d in docs]
        except Exception as e:
            logger.error(f"Firestore read complaints failed: {e}")
    
    return read_local_db().get("complaints", [])

async def get_all_recommendations() -> List[Dict[str, Any]]:
    if db_client:
        try:
            docs = db_client.collection("recommendations").stream()
            return [dict(id=d.id, **d.to_dict()) for d in docs]
        except Exception as e:
            logger.error(f"Firestore read recommendations failed: {e}")
            
    return read_local_db().get("recommendations", [])

# Pydantic Schemas
class ChatQuery(BaseModel):
    message: str
    history: List[Dict[str, str]]

# API ENDPOINTS

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_active": settings.has_gemini,
        "firebase_active": db_client is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/complaints")
async def register_complaint(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    urgency: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    address: str = Form(...),
    anonymous: bool = Form(False),
    language: str = Form("Hindi"),
    citizenId: str = Form("anonymous"),
    citizenName: str = Form("Anonymous"),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None)
):
    """
    Primary endpoint that receives audio recordings, photos, and textual reports.
    Leverages Gemini Multimodal API to parse, summarize, translate, and verify.
    """
    logger.info(f"Received new complaint: {title} from citizen: {citizenName}")

    # 1. Handle Multimodal Audio transcribing & translating
    original_audio_text = None
    translated_desc = description
    audio_confidence = 1.0

    if audio:
        try:
            audio_bytes = await audio.read()
            audio_analysis = await gemini_service.transcribe_and_translate_audio(
                audio_bytes, audio.content_type or "audio/wav"
            )
            original_audio_text = audio_analysis.get("original_text")
            translated_desc = audio_analysis.get("english_translation", description)
            audio_confidence = audio_analysis.get("confidence_score", 1.0)
            logger.info("Voice complaint transcribed and translated via Gemini Audio API.")
        except Exception as e:
            logger.error(f"Failed to process voice complaint: {e}")

    # 2. Handle Multimodal Image Vision analysis
    image_analysis_text = None
    image_confidence = 1.0
    
    if image:
        try:
            image_bytes = await image.read()
            vision_result = await gemini_service.analyze_complaint_image(
                image_bytes, image.content_type or "image/jpeg"
            )
            image_analysis_text = vision_result.get("description")
            image_confidence = vision_result.get("confidence_score", 1.0)
            logger.info("Visual evidence processed via Gemini Vision API.")
        except Exception as e:
            logger.error(f"Failed to analyze image file: {e}")

    # 3. Analyze complaint text using Gemini LLM
    text_analysis = {
        "category": category,
        "urgency": urgency,
        "translated_text": translated_desc,
        "sentiment": "negative",
        "keywords": [],
        "confidence_score": 0.85
    }
    
    try:
        text_analysis = await gemini_service.analyze_complaint_text(description, language)
        logger.info("Text parameters structured via Gemini Text Extraction schema.")
    except Exception as e:
        logger.error(f"Failed parsing text payload via Gemini API: {e}")

    # Merge confidence averages
    combined_confidence = (text_analysis.get("confidence_score", 0.9) + audio_confidence + image_confidence) / 3.0

    # 4. Formulate complete Complaint document
    comp_id = f"comp-{uuid.uuid4().hex[:8]}"
    new_complaint = {
        "title": title,
        "description": description,
        "originalLanguage": language,
        "translatedDescription": text_analysis.get("translated_text", translated_desc),
        "category": text_analysis.get("category", category),
        "urgency": text_analysis.get("urgency", urgency),
        "confidenceScore": round(combined_confidence, 2),
        "sentiment": text_analysis.get("sentiment", "negative"),
        "imageUrl": None, # In production, upload to Firebase Storage
        "imageAnalysis": image_analysis_text,
        "voiceUrl": None,
        "location": {
            "lat": lat,
            "lng": lng,
            "address": address
        },
        "anonymous": anonymous,
        "status": "submitted",
        "parentId": None,
        "citizenId": citizenId,
        "citizenName": "Anonymous Citizen" if anonymous else citizenName,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    # 5. Spatial Duplicate Detection
    existing_list = await get_all_complaints()
    is_dup, parent_id = detect_duplicates(new_complaint, existing_list)
    if is_dup:
        new_complaint["status"] = "duplicate"
        new_complaint["parentId"] = parent_id
        logger.info(f"Duplicate complaint detected. Merging into parent ID: {parent_id}")

    # 6. Save Complaint document to active DB
    if db_client:
        try:
            db_client.collection("complaints").document(comp_id).set(new_complaint)
        except Exception as e:
            logger.error(f"Failed to write complaint to Firestore: {e}")
    else:
        local_data = read_local_db()
        new_complaint["id"] = comp_id
        local_data["complaints"].append(new_complaint)
        write_local_db(local_data)

    # 7. Run AI Development Engine to re-evaluate recommendations
    await run_clustering_and_proposals()

    return dict(id=comp_id, **new_complaint)

@app.post("/api/chat")
async def chat_assistant(query: ChatQuery):
    """
    Answers MP questions based on the active complaints database.
    """
    try:
        active_comps = await get_all_complaints()
        reply = await gemini_service.get_mp_assistant_reply(
            query.message, query.history, active_comps
        )
        return {"response": reply}
    except Exception as e:
        logger.error(f"Chat assistant failed: {e}")
        raise HTTPException(status_code=500, detail="AI Assistant service error.")

@app.post("/api/recluster")
async def trigger_reclustering():
    """
    Manual administration trigger to group duplicates and rebuild development suggestions.
    """
    await run_clustering_and_proposals()
    return {"message": "AI Clustering and Project Recommendation engine ran successfully."}

# AI DEVELOPMENT ENGINE PIPELINE

async def run_clustering_and_proposals():
    """
    Core engine loop that groups active complaints by spatial coordinates
    and builds structured, explained development project recommendations.
    """
    logger.info("Executing Project Recommendation Pipeline...")
    all_comps = await get_all_complaints()
    
    # Filter only un-merged and non-resolved complaints
    active_comps = [c for c in all_comps if c.get("status") != "resolved" and c.get("status") != "duplicate"]
    
    if not active_comps:
        logger.info("No active complaints to cluster.")
        return

    # Group complaints by Category
    by_category = {}
    for c in active_comps:
        cat = c.get("category", "Roads")
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(c)

    new_recommendations = []
    
    for category, category_comps in by_category.items():
        # Cluster complaints by coordinates proximity (within 500 meters)
        clusters = []
        for comp in category_comps:
            added_to_cluster = False
            for cluster in clusters:
                # Compare against centroid/first item of cluster
                ref_comp = cluster[0]
                dist = haversine_distance(
                    comp["location"]["lat"], comp["location"]["lng"],
                    ref_comp["location"]["lat"], ref_comp["location"]["lng"]
                )
                if dist <= 500.0:  # 500 meters radius grouping for project proposals
                    cluster.append(comp)
                    added_to_cluster = True
                    break
            if not added_to_cluster:
                clusters.append([comp])

        # Generate recommendation proposal for each spatial cluster
        for idx, cluster in enumerate(clusters):
            cluster_id = f"{category.lower()}-{idx}-{uuid.uuid4().hex[:4]}"
            rec = DevEngine.generate_recommendation(cluster_id, category, cluster)
            new_recommendations.append(rec)

    # Save generated recommendations to active DB (clear old ones and overwrite)
    if db_client:
        try:
            # Delete old recommendations
            batch = db_client.batch()
            old_recs = db_client.collection("recommendations").stream()
            for r in old_recs:
                batch.delete(r.reference)
            batch.commit()

            # Batch write new recommendations
            batch = db_client.batch()
            for r in new_recommendations:
                doc_id = r["id"]
                doc_ref = db_client.collection("recommendations").document(doc_id)
                batch.set(doc_ref, r)
            batch.commit()
            logger.info("Firestore Recommendations collection updated.")
        except Exception as e:
            logger.error(f"Failed to update Firestore recommendations: {e}")
    else:
        local_data = read_local_db()
        local_data["recommendations"] = new_recommendations
        write_local_db(local_data)
        logger.info("Local Recommendations list updated.")
