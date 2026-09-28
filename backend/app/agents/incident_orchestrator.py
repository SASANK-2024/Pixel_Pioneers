import logging
from typing import List, Tuple, Optional
from backend.app.services.hindsight_service import hindsight_service
from backend.app.services.llm_service import llm_service
from backend.app.schemas import ChatRequest, ChatResponseModel, MemoryItem

logger = logging.getLogger(__name__)

class IncidentOrchestrator:
    def process_incident(self, req: ChatRequest) -> ChatResponseModel:
        """
        Coordinates the complete memory-aware SRE incident triage loop:
        1. Query Hindsight for historical incident context, failed fixes, and runbooks.
        2. Construct memory-aware context prompt.
        3. Reason and generate mitigation response via LLM.
        4. Detect and retain useful new operational facts or outcomes.
        """
        memories_retrieved: List[MemoryItem] = []
        
        if req.mode == "with_memory":
            retrieval_query = f"{req.service_name} {req.message}"
            memories_retrieved = hindsight_service.recall(query=retrieval_query, limit=5)
            logger.info(f"Retrieved {len(memories_retrieved)} memories for query: {retrieval_query}")
            
            system_prompt = self._build_memory_aware_prompt(req, memories_retrieved)
        else:
            # Baseline stateless mode for live judge comparison (Rule 20 & 21)
            system_prompt = self._build_stateless_prompt(req)

        # Call LLM
        response_text, reasoning = llm_service.generate_response(
            system_prompt=system_prompt,
            user_message=req.message
        )

        # Automatic memory retention check (Rule 7 & 14)
        new_memory_retained, retained_summary = self._evaluate_and_retain(req, response_text)

        return ChatResponseModel(
            response=response_text,
            reasoning=reasoning,
            mode=req.mode or "with_memory",
            service_name=req.service_name or "checkout-service",
            memories_retrieved=memories_retrieved,
            new_memory_retained=new_memory_retained,
            retained_summary=retained_summary
        )

    def _build_memory_aware_prompt(self, req: ChatRequest, memories: List[MemoryItem]) -> str:
        prompt_parts = [
            "You are OpsHindsight, an expert Site Reliability Engineer (SRE) and Incident Commander assistant.",
            f"Current Service Context: {req.service_name} | Environment: {req.environment}.",
            "Your objective: Rapidly diagnose production incidents, recommend high-confidence remediation steps, and prevent catastrophic repeated errors.",
            "",
            "CRITICAL OPERATIONAL RULES:",
            "1. NEGATIVE MEMORY: If past memory shows an attempted action failed or worsened the incident (e.g. scaling pods, restarting nodes, clearing cache), EXPLICITLY WARN the engineer NOT to repeat it.",
            "2. VERIFIED SOLUTIONS: If a verified runbook or fix previously resolved this issue, highlight and recommend it first with exact commands.",
            "3. Be concise, direct, and actionable. On-call engineers during an outage need quick, high-signal guidance, not conversational filler.",
            "",
            "=== RETRIEVED HINDSIGHT HISTORICAL MEMORY ==="
        ]

        if not memories:
            prompt_parts.append("No previous incident history found for this query. Proceed with standard diagnostic triage.")
        else:
            for idx, m in enumerate(memories, 1):
                context_tag = f" [{m.context}]" if m.context else ""
                score_tag = f" (Confidence: {round(m.score, 2)})" if m.score is not None else ""
                prompt_parts.append(f"{idx}. {m.text}{context_tag}{score_tag}")

        prompt_parts.append("==============================================")
        prompt_parts.append("Use the historical memory above to ground your diagnosis and recommendations.")
        return "\n".join(prompt_parts)

    def _build_stateless_prompt(self, req: ChatRequest) -> str:
        return (
            "You are a generic DevOps assistant without access to past incident history or memory.\n"
            f"Service: {req.service_name} | Environment: {req.environment}.\n"
            "Provide general diagnostic advice based on the user's message."
        )

    def _evaluate_and_retain(self, req: ChatRequest, response_text: str) -> Tuple[bool, Optional[str]]:
        """
        Determines if the interaction contains a durable operational fact, resolution, or failed fix
        that should be persisted into Hindsight for future incidents (Rule 14).
        """
        content_lower = req.message.lower()
        
        # Trigger keywords that indicate a real post-mortem, new fix, or failed step
        retention_triggers = [
            "resolved by", "solution was", "fixed by", "root cause was",
            "we tried", "failed attempt", "worsened the outage", "do not repeat",
            "post-mortem", "runbook", "action item"
        ]

        if any(trigger in content_lower for trigger in retention_triggers):
            try:
                fact_text = f"Service [{req.service_name}] Incident Note: {req.message}"
                hindsight_service.retain(
                    content=fact_text,
                    context=f"SRE Incident Update - {req.service_name}",
                    tags=[req.service_name, "auto-retained", req.environment]
                )
                logger.info(f"Automatically retained new operational memory: {fact_text}")
                return True, fact_text
            except Exception as e:
                logger.error(f"Failed to auto-retain operational memory: {e}")
                return False, None

        return False, None

orchestrator = IncidentOrchestrator()
