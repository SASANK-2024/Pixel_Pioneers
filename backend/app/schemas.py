from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    llm_model: str
    hindsight_bank: str
    environment: str

class MemoryItem(BaseModel):
    id: Optional[str] = None
    text: str
    type: Optional[str] = "world"
    context: Optional[str] = None
    score: Optional[float] = None
    mentioned_at: Optional[str] = None

class RetainRequest(BaseModel):
    content: str = Field(..., description="The factual incident, post-mortem, runbook, or failed remediation step.")
    context: Optional[str] = Field("SRE Incident Post-Mortem", description="Contextual label e.g., 'Post-Mortem', 'Runbook RB-08', 'Failed Attempt'")
    service_name: Optional[str] = Field(None, description="Target service scope e.g., 'checkout-service'")
    tags: Optional[List[str]] = Field(default_factory=list, description="Categorization tags e.g. ['database', 'prod-incident']")

class RetainResponseModel(BaseModel):
    success: bool
    bank_id: str
    items_count: int
    message: str

class RecallRequest(BaseModel):
    query: str = Field(..., description="Semantic search query describing the symptoms or question.")
    limit: Optional[int] = Field(5, description="Maximum number of memories to return")

class RecallResponseModel(BaseModel):
    count: int
    memories: List[MemoryItem]

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    message: str = Field(..., description="The SRE engineer query, error log snippet, or alert description.")
    service_name: Optional[str] = Field("checkout-service", description="Microservice or system name.")
    environment: Optional[str] = Field("production", description="Environment: production, staging, dev.")
    mode: Optional[str] = Field("with_memory", description="'with_memory' uses Hindsight long-term memory; 'without_memory' demonstrates stateless LLM behavior.")
    user_id: Optional[str] = Field("sre-lead-01", description="Identifier of the on-call engineer or team.")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Recent conversation history for multi-turn context.")

class ChatResponseModel(BaseModel):
    response: str
    reasoning: Optional[str] = None
    mode: str
    service_name: str
    memories_retrieved: List[MemoryItem]
    new_memory_retained: bool
    retained_summary: Optional[str] = None
