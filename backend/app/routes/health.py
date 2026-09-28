from fastapi import APIRouter
from backend.app.config import settings
from backend.app.schemas import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version="1.0.0",
        llm_model=settings.groq_model,
        hindsight_bank=settings.hindsight_bank_id,
        environment=settings.environment
    )
