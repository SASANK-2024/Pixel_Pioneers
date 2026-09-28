import logging
from typing import List, Tuple, Optional
from backend.app.services.hindsight_service import hindsight_service
from backend.app.services.llm_service import llm_service
from backend.app.schemas import ChatRequest, ChatResponseModel, MemoryItem

logger = logging.getLogger(__name__)

class IncidentOrchestrator:
    async def process_incident(self, req: ChatRequest) -> ChatResponseModel:
        """
        Coordinates the complete memory-aware SRE incident triage loop:
        1. Query Hindsight for historical incident context, failed fixes, and runbooks.
        2. Construct memory-aware context prompt.
        3. Reason and generate mitigation response via LLM (including multi-turn conversation history).
        4. Retain Q&A and useful new operational facts or outcomes into Hindsight.
        """
        memories_retrieved: List[MemoryItem] = []
        is_asking_about_previous = any(
            phrase in req.message.lower() 
            for phrase in [
                "previous question", "previous answer", "earlier question", 
                "earlier answer", "what did you say", "what was the answer", 
                "last question", "last answer", "what did i ask", "what i have asked",
                "answer which i got"
            ]
        )
        
        if req.mode == "with_memory":
            if is_asking_about_previous and req.history:
                retrieval_query = f"{req.service_name} {req.history[-1].content} {req.message}"
            elif is_asking_about_previous:
                retrieval_query = f"{req.service_name} previous SRE advice runbook resolution question answer"
            else:
                retrieval_query = f"{req.service_name} {req.message}"

            memories_retrieved = await hindsight_service.arecall(query=retrieval_query, limit=5)
            logger.info(f"Retrieved {len(memories_retrieved)} memories for query: {retrieval_query}")
            
            system_prompt = self._build_memory_aware_prompt(req, memories_retrieved, is_asking_about_previous)
        else:
            # Baseline stateless mode
            system_prompt = self._build_stateless_prompt(req, is_asking_about_previous)

        # Call LLM with multi-turn conversation history
        response_text, reasoning = llm_service.generate_response(
            system_prompt=system_prompt,
            user_message=req.message,
            conversation_history=req.history
        )

        # Retain new memory and Q&A interaction into Hindsight (Rule 7 & 14)
        new_memory_retained, retained_summary = await self._evaluate_and_retain(req, response_text)

        return ChatResponseModel(
            response=response_text,
            reasoning=reasoning,
            mode=req.mode or "with_memory",
            service_name=req.service_name or "checkout-service",
            memories_retrieved=memories_retrieved,
            new_memory_retained=new_memory_retained,
            retained_summary=retained_summary
        )

    def _build_memory_aware_prompt(self, req: ChatRequest, memories: List[MemoryItem], is_asking_about_previous: bool) -> str:
        prompt_parts = [
            "You are OpsHindsight, an expert Site Reliability Engineer (SRE) and Incident Commander assistant.",
            f"Current Service Context: {req.service_name} | Environment: {req.environment}.",
            "Your objective: Rapidly diagnose production incidents, recommend high-confidence remediation steps, and prevent catastrophic repeated errors.",
            "",
            "CRITICAL OPERATIONAL RULES:",
            "1. CONVERSATION & MEMORY CONTINUITY: You have access to recent conversation history and Hindsight persistent memories. When the user asks about previous questions or answers (e.g. 'what is the answer to my previous question?'), clearly recount the previous question and the exact answer/guidance given.",
            "2. NEGATIVE MEMORY: If past memory shows an attempted action failed or worsened the incident (e.g. scaling pods, restarting nodes, clearing cache), EXPLICITLY WARN the engineer NOT to repeat it.",
            "3. VERIFIED SOLUTIONS: If a verified runbook or fix previously resolved this issue, highlight and recommend it first with exact commands.",
            "4. Be concise, direct, and actionable. On-call engineers during an outage need quick, high-signal guidance.",
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
        prompt_parts.append("Use the historical memory above and the conversation history to answer accurately.")
        return "\n".join(prompt_parts)

    def _build_stateless_prompt(self, req: ChatRequest, is_asking_about_previous: bool) -> str:
        prompt = (
            "You are a DevOps assistant without access to long-term Hindsight incident memory.\n"
            f"Service: {req.service_name} | Environment: {req.environment}.\n"
        )
        if is_asking_about_previous and req.history:
            prompt += "The user is asking about the previous question/answer in this conversation session. Directly recount the previous question and the answer that was given.\n"
        else:
            prompt += "Provide general diagnostic advice based on the user's message.\n"
        return prompt

    async def _evaluate_and_retain(self, req: ChatRequest, response_text: str) -> Tuple[bool, Optional[str]]:
        """
        Persists operational facts, post-mortems, and Q&A interactions into Hindsight (Rule 7 & 14).
        """
        try:
            content_lower = req.message.lower()
            
            # Don't retain meta questions about the previous question itself
            if any(p in content_lower for p in ["previous question", "previous answer", "answer which i got"]):
                return False, None

            # Retain structured Q&A interaction into Hindsight
            qa_summary = (
                f"Incident Interaction on [{req.service_name}]: User queried '{req.message}'. "
                f"OpsHindsight Recommended: '{response_text[:300]}...'"
            )
            await hindsight_service.aretain(
                content=qa_summary,
                context=f"SRE Interaction History - {req.service_name}",
                tags=[req.service_name, "qa-interaction", req.environment]
            )
            logger.info(f"Retained Q&A interaction to Hindsight: {qa_summary[:100]}...")
            return True, qa_summary
        except Exception as e:
            logger.error(f"Failed to retain interaction to Hindsight: {e}")
            return False, None

orchestrator = IncidentOrchestrator()
