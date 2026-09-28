from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ContactBase(BaseModel):
    name: str
    role: str
    company: str
    email: str
    relationship_type: str = "Enterprise Prospect"
    avatar: Optional[str] = None
    summary: Optional[str] = None
    preferences: List[str] = Field(default_factory=list)
    known_concerns: List[str] = Field(default_factory=list)

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: str
    created_at: str
    total_meetings: int = 0
    open_commitments_count: int = 0

class Commitment(BaseModel):
    id: str
    contact_id: str
    meeting_id: str
    owner: str = "us"  # "us" | "them" | contact name
    title: str
    due_date: Optional[str] = None
    status: str = "open"  # "open" | "completed"
    completed_at: Optional[str] = None
    source_meeting_title: str

class CommitmentCompleteRequest(BaseModel):
    completed: bool = True

class MeetingMemoryItem(BaseModel):
    id: str
    text: str
    category: str = "relationship_fact"  # relationship_fact, decision, commitment, preference, concern_objection, outcome
    source_meeting: Optional[str] = None
    source_date: Optional[str] = None
    relevance_score: Optional[float] = None

class ChangeSinceLastMeeting(BaseModel):
    new_information: List[str] = Field(default_factory=list)
    unresolved_items: List[str] = Field(default_factory=list)
    changed_concerns: List[str] = Field(default_factory=list)
    suggested_questions_today: List[str] = Field(default_factory=list)

class MeetingBrief(BaseModel):
    meeting_overview: str
    relationship_summary: str
    key_topics: List[str] = Field(default_factory=list)
    previous_commitments: List[str] = Field(default_factory=list)
    open_commitments: List[Commitment] = Field(default_factory=list)
    known_concerns: List[str] = Field(default_factory=list)
    contact_preferences: List[str] = Field(default_factory=list)
    recommended_questions: List[str] = Field(default_factory=list)
    risks_or_unknowns: List[str] = Field(default_factory=list)
    suggested_preparation: List[str] = Field(default_factory=list)
    change_since_last_meeting: Optional[ChangeSinceLastMeeting] = None
    memories_used: List[MeetingMemoryItem] = Field(default_factory=list)
    new_information_to_retain: Optional[List[str]] = Field(default_factory=list)

class MeetingCreate(BaseModel):
    contact_id: str
    title: str
    meeting_number: int
    date_time: str
    objective: str
    agenda: List[str] = Field(default_factory=list)
    attendees: List[str] = Field(default_factory=list)

class Meeting(BaseModel):
    id: str
    contact_id: str
    title: str
    meeting_number: int
    date_time: str
    objective: str
    agenda: List[str] = Field(default_factory=list)
    attendees: List[str] = Field(default_factory=list)
    status: str = "upcoming"  # "upcoming" | "completed"
    notes_raw: Optional[str] = None
    outcome_summary: Optional[str] = None
    prepared_brief: Optional[MeetingBrief] = None
    created_at: str

class MeetingProcessRequest(BaseModel):
    notes: str
    outcome_summary: Optional[str] = None

class MeetingProcessResponse(BaseModel):
    success: bool
    meeting_id: str
    retained_memories_count: int
    retained_items: List[Dict[str, Any]]
    new_commitments: List[Commitment]
    message: str

class LearningStage(BaseModel):
    meeting_number: int
    title: str
    stage_name: str  # "Baseline Preparation" | "Context-Aware" | "Institutional Memory"
    summary: str
    memories_recalled_count: int
    behavior_difference: str
    outcome: str

class LearningProgressionResponse(BaseModel):
    contact_id: str
    contact_name: str
    total_memories_retained: int
    total_meetings: int
    stages: List[LearningStage]
