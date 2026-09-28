import logging
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException

from backend.app.schemas_meeting import (
    Contact, ContactCreate, Meeting, MeetingCreate, 
    Commitment, CommitmentCompleteRequest, MeetingBrief,
    MeetingProcessRequest, MeetingProcessResponse,
    MeetingMemoryItem, LearningProgressionResponse
)
from backend.app.store.meeting_store import meeting_store
from backend.app.agents.meeting_orchestrator import meeting_orchestrator
from backend.app.services.hindsight_service import hindsight_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Meeting Memory AI"])

# --- Contacts API ---

@router.get("/contacts", response_model=List[Contact])
def list_contacts():
    """List all tracked business contacts."""
    return meeting_store.get_contacts()

@router.post("/contacts", response_model=Contact)
def create_contact(req: ContactCreate):
    """Create a new business contact with initial Discovery meeting."""
    contact_id = f"contact-{uuid.uuid4().hex[:8]}"
    avatar = req.avatar or f"https://api.dicebear.com/7.x/initials/svg?seed={req.name}"
    data = req.model_dump()
    data["avatar"] = avatar
    new_contact = Contact(
        id=contact_id,
        created_at=datetime.utcnow().isoformat(),
        **data
    )
    created = meeting_store.create_contact(new_contact)
    
    # Auto-schedule an Initial Discovery meeting
    m1 = Meeting(
        id=f"meeting-{uuid.uuid4().hex[:8]}",
        contact_id=contact_id,
        title="Initial Discovery & Alignment",
        meeting_number=1,
        date_time=f"{datetime.utcnow().strftime('%Y-%m-%d')} 02:00 PM EST",
        objective=f"Understand {new_contact.company} requirements, evaluate strategic priorities, and establish relationship goals.",
        agenda=[
            f"Review {new_contact.company} core priorities",
            "Identify key technical & business constraints",
            "Establish collaborative milestones"
        ],
        attendees=[f"{new_contact.name} ({new_contact.role})", "Account Team"],
        status="upcoming",
        created_at=datetime.utcnow().isoformat()
    )
    meeting_store.create_meeting(m1)
    return created

@router.get("/contacts/{contact_id}", response_model=Contact)
def get_contact(contact_id: str):
    """Retrieve contact profile."""
    contact = meeting_store.get_contact(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.get("/contacts/{contact_id}/meetings", response_model=List[Meeting])
def get_contact_meetings(contact_id: str):
    """Retrieve full meeting history for a contact."""
    return meeting_store.get_meetings(contact_id)

@router.get("/contacts/{contact_id}/commitments", response_model=List[Commitment])
def get_contact_commitments(contact_id: str, status: Optional[str] = None):
    """Retrieve commitments for a contact, optionally filtered by status ('open' | 'completed')."""
    return meeting_store.get_commitments(contact_id, status=status)

@router.get("/contacts/{contact_id}/learning", response_model=LearningProgressionResponse)
async def get_learning_progression(contact_id: str):
    """Retrieve learning progression across meetings with Hindsight memory growth."""
    contact = meeting_store.get_contact(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Check memories count from Hindsight
    memories = await hindsight_service.arecall_meeting(contact_id=contact_id, query="all", limit=20)
    return meeting_store.get_learning_progression(contact_id, total_memories_count=len(memories))

# --- Commitments API ---

@router.post("/commitments/{commitment_id}/complete", response_model=Commitment)
def complete_commitment(commitment_id: str, req: CommitmentCompleteRequest):
    """Marks a commitment as completed or open."""
    comm = meeting_store.complete_commitment(commitment_id, completed=req.completed)
    if not comm:
        raise HTTPException(status_code=404, detail="Commitment not found")
    return comm

# --- Meetings API ---

@router.post("/meetings", response_model=Meeting)
def create_meeting(req: MeetingCreate):
    """Schedule a new meeting for a contact."""
    meeting_id = f"meeting-{uuid.uuid4().hex[:8]}"
    new_meeting = Meeting(
        id=meeting_id,
        created_at=datetime.utcnow().isoformat(),
        status="upcoming",
        **req.model_dump()
    )
    return meeting_store.create_meeting(new_meeting)

@router.get("/meetings/{meeting_id}", response_model=Meeting)
def get_meeting(meeting_id: str):
    """Retrieve meeting details and prepared brief."""
    meeting = meeting_store.get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.post("/meetings/{meeting_id}/prepare", response_model=MeetingBrief)
async def prepare_meeting(meeting_id: str):
    """
    Coordinates Hindsight memory recall and LLM reasoning to generate an
    evidence-backed executive briefing for an upcoming meeting.
    """
    try:
        brief = await meeting_orchestrator.prepare_meeting(meeting_id)
        return brief
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error preparing meeting {meeting_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to prepare meeting brief: {str(e)}")

@router.post("/meetings/{meeting_id}/process", response_model=MeetingProcessResponse)
async def process_meeting_outcome(meeting_id: str, req: MeetingProcessRequest):
    """
    Processes post-meeting notes, extracts durable facts and commitments,
    retains them into Hindsight, and marks meeting as completed.
    """
    try:
        response = await meeting_orchestrator.process_post_meeting(
            meeting_id=meeting_id,
            notes=req.notes,
            outcome_summary=req.outcome_summary
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error processing meeting outcome {meeting_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process meeting outcome: {str(e)}")

@router.get("/meetings/{meeting_id}/memories", response_model=List[MeetingMemoryItem])
async def get_meeting_memories(meeting_id: str):
    """Returns the historical Hindsight memories recalled and used for this meeting."""
    meeting = meeting_store.get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.prepared_brief and meeting.prepared_brief.memories_used:
        return meeting.prepared_brief.memories_used
    
    # If not yet prepared, recall preview
    contact = meeting_store.get_contact(meeting.contact_id)
    query = f"{contact.name if contact else ''} {meeting.title} {meeting.objective}"
    return await hindsight_service.arecall_meeting(meeting.contact_id, query, limit=8)

# --- Deterministic Demo Reset ---

@router.post("/demo/reset")
async def reset_demo():
    """
    Resets the entire system to deterministic demo state:
    - Maya Rao (Northstar Logistics) as hero contact
    - Meeting 1 completed with historical facts
    - Seeds Meeting 1 memories into Hindsight Cloud
    - Meeting 2 set as upcoming ready for 1-click preparation
    - Meeting 3 scheduled for commercial close
    """
    try:
        demo_state = meeting_store.reset_demo()
        # Seed deterministic memories into Hindsight Cloud for both contacts
        seed_res_maya = await hindsight_service.seed_meeting_demo("contact-maya-rao")
        seed_res_david = await hindsight_service.seed_meeting_demo("contact-david-kim")
        return {
            "success": True,
            "message": "Demo state reset successfully. Contacts Maya Rao & David Kim and Hindsight memories ready.",
            "contact": demo_state["contacts"][0],
            "contacts": demo_state["contacts"],
            "contacts_count": len(demo_state["contacts"]),
            "meetings_count": len(demo_state["meetings"]),
            "commitments_count": len(demo_state["commitments"]),
            "hindsight_seed_results": {
                "maya": seed_res_maya,
                "david": seed_res_david
            }
        }
    except Exception as e:
        logger.error(f"Demo reset error: {e}")
        raise HTTPException(status_code=500, detail=f"Demo reset failed: {str(e)}")
