import os
from dataclasses import dataclass, field
from typing import List
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Settings:
    app_name: str = "OpsHindsight - SRE Incident Intelligence API"
    environment: str = os.getenv("ENVIRONMENT", "development")
    port: int = int(os.getenv("PORT", 8000))
    
    # LLM Settings
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    
    # Hindsight Settings
    hindsight_api_key: str = os.getenv("HINDSIGHT_API_KEY", "")
    hindsight_base_url: str = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
    hindsight_bank_id: str = os.getenv("HINDSIGHT_BANK_ID", "opshindsight-incidents")
    
    # CORS
    cors_origins: List[str] = field(default_factory=lambda: [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
        if origin.strip()
    ])

settings = Settings()
