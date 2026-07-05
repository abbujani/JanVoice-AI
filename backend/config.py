import os
from typing import Optional

# Using Pydantic Settings or simple os.environ reads. To keep it zero-dependency, let's use direct os.getenv
class Settings:
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    FIREBASE_CREDENTIALS_PATH: Optional[str] = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    FIREBASE_DATABASE_URL: Optional[str] = os.getenv("FIREBASE_DATABASE_URL", "")
    PORT: int = int(os.getenv("PORT", 8000))
    
    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY)
        
    @property
    def has_firebase(self) -> bool:
        return bool(self.FIREBASE_CREDENTIALS_PATH) or os.path.exists("service-account.json")

settings = Settings()
