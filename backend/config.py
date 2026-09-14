import os
from typing import Optional

# Using Pydantic Settings or simple os.environ reads. To keep it zero-dependency, let's use direct os.getenv
class Settings:
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    PORT: int = int(os.getenv("PORT", 8000))
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY)

settings = Settings()
