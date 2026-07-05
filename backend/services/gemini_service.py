import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from backend.config import settings

logger = logging.getLogger("janvoice_ai")

class GeminiService:
    def __init__(self):
        self.client = None
        if settings.has_gemini:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info("Gemini Client initialized successfully using official SDK.")
            except Exception as e:
                logger.error(f"Failed to initialize official Gemini Client: {e}")

    async def analyze_complaint_text(self, text: str, stated_language: str = "Hindi") -> Dict[str, Any]:
        """
        Extracts translation, category, urgency, keywords, sentiment, and confidence using Gemini API.
        """
        if not self.client:
            # Standalone mock fallback
            is_hindi = any("\u0900" <= char <= "\u097f" for char in text)
            translation = text
            if is_hindi:
                translation = "The street is completely broken with large potholes making transport dangerous."
            
            return {
                "category": "Roads",
                "urgency": "high",
                "translated_text": translation,
                "sentiment": "negative",
                "keywords": ["road", "potholes", "traffic", "accident"],
                "confidence_score": 0.94,
                "entities": ["Bazar Road", "Ward 3"]
            }

        prompt = f"""
        Analyze the following citizen municipal complaint details:
        Input Text: "{text}"
        Stated original language: "{stated_language}"
        
        You must parse, translate, and classify it. Output a JSON object with the following fields:
        - "category": Must be one of ["Roads", "Water", "Waste", "Infrastructure", "Health", "Education", "Electricity"]
        - "urgency": Must be one of ["low", "medium", "high", "critical"]
        - "translated_text": High-quality English translation of the complaint description.
        - "sentiment": Sentiment of the text, one of ["positive", "negative", "neutral"]
        - "keywords": A list of up to 5 relevant keyword strings.
        - "confidence_score": A float between 0.0 and 1.0 representing your classification confidence.
        - "entities": A list of extracted entities (places, ward numbers, names).
        
        Output only a valid JSON string. Do not include markdown code block formatting.
        """
        try:
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini Text Analysis failed: {e}")
            raise e

    async def analyze_complaint_image(self, image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        """
        Ingests image bytes and returns Gemini Vision description of municipal problem and confidence score.
        """
        if not self.client:
            return {
                "detected_issue": "Road Damage",
                "description": "Visual analysis detected severe asphalt cracks, water-clogged potholes, and side erosion.",
                "confidence_score": 0.92
            }

        prompt = """
        Analyze this uploaded community complaint photo. Identify the municipal issue.
        You must determine:
        1. "detected_issue": Must be one of ["Road Damage", "Garbage", "Water Leakage", "Flood", "Pollution", "Broken Infrastructure", "School Damage", "Hospital Problems"]
        2. "description": A brief summary of what is damaged or wrong in the image.
        3. "confidence_score": A float between 0.0 and 1.0 representing your visual detection confidence.
        
        Output only a valid JSON string containing these three keys.
        """
        try:
            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[prompt, image_part],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini Image Vision failed: {e}")
            raise e

    async def transcribe_and_translate_audio(self, audio_bytes: bytes, mime_type: str = "audio/wav") -> Dict[str, Any]:
        """
        Ingests audio bytes directly to transcribe speech, detect native language, and translate it to English.
        """
        if not self.client:
            return {
                "original_text": "सड़क पर पानी भरा हुआ है और आने जाने में दिक्कत हो रही है।",
                "detected_language": "Hindi",
                "english_translation": "The road is flooded with water and it is difficult to commute.",
                "confidence_score": 0.88
            }

        prompt = """
        Listen to this citizen voice complaint audio. 
        You must transcribe, detect the spoken language, and translate it.
        Output a JSON object with the following fields:
        - "original_text": Transcript of the speech in its original language.
        - "detected_language": The language spoken (e.g. Hindi, Tamil, English, Marathi, Telugu, Bengali).
        - "english_translation": Accurate translation of the transcript to English.
        - "confidence_score": A float between 0.0 and 1.0 representing your transcription confidence.
        
        Output only a valid JSON string.
        """
        try:
            audio_part = types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[prompt, audio_part],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini Audio ingestion failed: {e}")
            raise e

    async def get_mp_assistant_reply(self, message: str, history: List[Dict[str, str]], complaints_context: List[Dict[str, Any]]) -> str:
        """
        Evaluates MP questions using the aggregated complaints data as context.
        """
        if not self.client:
            # Standalone reply
            return "I am operating in standalone mode. Based on current mock data, Bazar Road reconstruction is the highest priority."

        # Simplify complaints context to save tokens
        clean_context = []
        for c in complaints_context:
            clean_context.append({
                "id": c.get("id"),
                "title": c.get("title"),
                "category": c.get("category"),
                "urgency": c.get("urgency"),
                "address": c.get("location", {}).get("address"),
                "status": c.get("status")
            })

        system_instruction = f"""
        You are the JanVoice AI Executive Assistant for the Member of Parliament (MP). 
        You answer questions using the live constituency complaints dataset provided below.
        
        Constituency Complaints Context:
        {json.dumps(clean_context, indent=2)}
        
        Be analytical, professional, and clear. Help the MP determine where to build infrastructure first, 
        what the budget limits are, and which villages/wards require immediate projects. Use the complaints context data to justify your recommendations.
        """

        try:
            # Format chat history for Google GenAI SDK
            contents = []
            for h in history:
                role = "user" if h["role"] == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=h["content"])]))
            
            # Append latest query
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))

            response = self.client.models.generate_content(
                model="gemini-1.5-pro", # Pro is best for complex data reasoning
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini MP Assistant Chat failed: {e}")
            return "Apologies, I encountered an issue accessing the AI model. Please verify your API key."

gemini_service = GeminiService()
