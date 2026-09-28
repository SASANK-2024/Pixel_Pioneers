from fastapi import APIRouter, HTTPException
from backend.app.schemas import ChatRequest, ChatResponseModel
from backend.app.agents.incident_orchestrator import orchestrator

router = APIRouter(tags=["Chat & Incident Triage"])

@router.post("/chat", response_model=ChatResponseModel)
def chat_incident(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Incident message cannot be empty.")
    
    try:
        response = orchestrator.process_incident(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Incident triage failed: {str(e)}")
