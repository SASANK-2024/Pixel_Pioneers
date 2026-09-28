import logging
from typing import List, Optional, Dict, Any
from hindsight_client import Hindsight
from backend.app.config import settings
from backend.app.schemas import MemoryItem
from backend.app.schemas_meeting import MeetingMemoryItem

logger = logging.getLogger(__name__)

class HindsightService:
    def __init__(self):
        self.bank_id = settings.hindsight_bank_id
        try:
            self.client = Hindsight(
                base_url=settings.hindsight_base_url,
                api_key=settings.hindsight_api_key
            )
            logger.info(f"HindsightService initialized for bank: {self.bank_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Hindsight client: {e}")
            self.client = None

    # --- Generic & SRE Incident Methods (Preserved for backwards compatibility) ---
    async def aretain(self, content: str, context: Optional[str] = "SRE Incident Post-Mortem", tags: Optional[List[str]] = None) -> dict:
        if not self.client:
            raise RuntimeError("Hindsight client is not initialized.")
        try:
            res = await self.client.aretain(
                bank_id=self.bank_id,
                content=content,
                context=context,
                tags=tags or []
            )
            return {
                "success": bool(getattr(res, "success", True)),
                "bank_id": self.bank_id,
                "items_count": getattr(res, "items_count", 1)
            }
        except Exception as e:
            logger.error(f"Hindsight aretain error: {e}")
            raise e

    def retain(self, content: str, context: Optional[str] = "SRE Incident Post-Mortem", tags: Optional[List[str]] = None) -> dict:
        if not self.client:
            raise RuntimeError("Hindsight client is not initialized.")
        try:
            res = self.client.retain(
                bank_id=self.bank_id,
                content=content,
                context=context,
                tags=tags or []
            )
            return {
                "success": bool(getattr(res, "success", True)),
                "bank_id": self.bank_id,
                "items_count": getattr(res, "items_count", 1)
            }
        except Exception as e:
            logger.error(f"Hindsight retain error: {e}")
            raise e

    async def arecall(self, query: str, limit: int = 5) -> List[MemoryItem]:
        if not self.client:
            logger.warning("Hindsight client is unavailable; returning empty memory.")
            return []
        try:
            response = await self.client.arecall(
                bank_id=self.bank_id,
                query=query,
                max_tokens=4096
            )
            items: List[MemoryItem] = []
            for item in response:
                score = None
                if hasattr(item, "scores") and item.scores:
                    score = getattr(item.scores, "final", None)
                items.append(
                    MemoryItem(
                        id=str(getattr(item, "id", "")),
                        text=getattr(item, "text", ""),
                        type=getattr(item, "type", "world"),
                        context=getattr(item, "context", None),
                        score=score,
                        mentioned_at=str(getattr(item, "mentioned_at", "")) if getattr(item, "mentioned_at", None) else None
                    )
                )
            items.sort(key=lambda m: (m.score or 0.0), reverse=True)
            return items[:limit]
        except Exception as e:
            logger.error(f"Hindsight arecall error: {e}")
            return []

    # --- Meeting Memory AI Dedicated Methods ---

    async def aretain_meeting(
        self,
        contact_id: str,
        content: str,
        category: str = "relationship_fact",
        meeting_title: str = "Meeting",
        date: str = "",
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Retains a verified contact memory into Hindsight, scoped by contact_id and tagged by category.
        Categories: relationship_fact, decision, commitment, preference, concern_objection, outcome
        """
        if not self.client:
            raise RuntimeError("Hindsight client is not initialized.")
        
        all_tags = [contact_id, category, "meeting-prep"]
        if tags:
            all_tags.extend(tags)
            
        context_str = f"Meeting Context [{contact_id}]: {meeting_title} ({date})" if date else f"Meeting Context [{contact_id}]: {meeting_title}"

        try:
            res = await self.client.aretain(
                bank_id=self.bank_id,
                content=content,
                context=context_str,
                tags=all_tags
            )
            return {
                "success": bool(getattr(res, "success", True)),
                "bank_id": self.bank_id,
                "category": category,
                "contact_id": contact_id
            }
        except Exception as e:
            logger.error(f"Hindsight aretain_meeting error: {e}")
            raise e

    async def arecall_meeting(
        self,
        contact_id: str,
        query: str,
        limit: int = 8
    ) -> List[MeetingMemoryItem]:
        """
        Recalls contact-scoped historical memories from Hindsight.
        Calculates relevance score and extracts category/provenance.
        """
        if not self.client:
            logger.warning("Hindsight client is unavailable; returning empty memory.")
            return []

        search_query = f"{contact_id} {query}"
        try:
            response = await self.client.arecall(
                bank_id=self.bank_id,
                query=search_query,
                max_tokens=4096
            )
            items: List[MeetingMemoryItem] = []
            for item in response:
                score = None
                if hasattr(item, "scores") and item.scores:
                    score = getattr(item.scores, "final", None) or getattr(item.scores, "semantic", None)

                # Deduce category from text or tags
                text = getattr(item, "text", "")
                category = "relationship_fact"
                text_lower = text.lower()
                if "prefer" in text_lower or "style" in text_lower or "format" in text_lower:
                    category = "preference"
                elif "commit" in text_lower or "promise" in text_lower or "deliver" in text_lower or "send" in text_lower:
                    category = "commitment"
                elif "concern" in text_lower or "objection" in text_lower or "friction" in text_lower or "risk" in text_lower or "soc2" in text_lower or "gdpr" in text_lower:
                    category = "concern_objection"
                elif "decision" in text_lower or "agreed" in text_lower or "decided" in text_lower:
                    category = "decision"
                elif "outcome" in text_lower or "closed" in text_lower or "signed" in text_lower:
                    category = "outcome"

                context_val = getattr(item, "context", "") or ""
                source_meeting = context_val.split(":")[1].split("(")[0].strip() if ":" in context_val else "Past Interaction"
                source_date = context_val.split("(")[1].replace(")", "").strip() if "(" in context_val and ")" in context_val else None

                items.append(
                    MeetingMemoryItem(
                        id=str(getattr(item, "id", "")),
                        text=text,
                        category=category,
                        source_meeting=source_meeting,
                        source_date=source_date,
                        relevance_score=score
                    )
                )

            items.sort(key=lambda m: (m.relevance_score or 0.0), reverse=True)
            return items[:limit]
        except Exception as e:
            logger.error(f"Hindsight arecall_meeting error: {e}")
            return []

    async def seed_meeting_demo(self, contact_id: str = "contact-maya-rao"):
        """Seeds deterministic meeting memories for Maya Rao or David Kim into Hindsight."""
        if contact_id == "contact-david-kim":
            demo_memories = [
                {
                    "content": "David Kim explicitly stated: 'We reject standard marketing decks. We require architectural diagrams, API schemas, and documented rollback procedures.' Prefers technical deep-dives.",
                    "category": "preference",
                    "meeting_title": "Infrastructure Discovery & Latency Benchmarks",
                    "date": "2026-09-18"
                },
                {
                    "content": "David Kim emphasized a non-negotiable SLA constraint: transaction routing p99 latency must stay under 50ms across peak trading hours with zero database migration downtime.",
                    "category": "concern_objection",
                    "meeting_title": "Infrastructure Discovery & Latency Benchmarks",
                    "date": "2026-09-18"
                },
                {
                    "content": "FinScale Technologies settles $120M in transactions daily across 4 core banking partner gateways in multi-cloud Kubernetes clusters.",
                    "category": "relationship_fact",
                    "meeting_title": "Infrastructure Discovery & Latency Benchmarks",
                    "date": "2026-09-18"
                },
                {
                    "content": "Commitment made by our team: Deliver multi-region deployment topology and benchmark report by Sept 23. Status: Delivered successfully.",
                    "category": "commitment",
                    "meeting_title": "Infrastructure Discovery & Latency Benchmarks",
                    "date": "2026-09-18"
                },
                {
                    "content": "Commitment made by David Kim: Share redacted Prometheus latency traces and gateway error logs by Sept 24. Status: Open/Pending from FinScale team.",
                    "category": "commitment",
                    "meeting_title": "Infrastructure Discovery & Latency Benchmarks",
                    "date": "2026-09-18"
                }
            ]
        else:
            demo_memories = [
                {
                    "content": "Maya Rao explicitly stated: 'I prefer direct, concise executive bullet points in all meetings—skip the marketing fluff.' She expects high-density, actionable briefings.",
                    "category": "preference",
                    "meeting_title": "Discovery & Requirements Alignment",
                    "date": "2026-09-15"
                },
                {
                    "content": "Maya Rao raised a critical compliance concern: Northstar Logistics is undergoing a SOC2 Type II audit next month and their CISO has strict EU GDPR data sovereignty requirements for European routes.",
                    "category": "concern_objection",
                    "meeting_title": "Discovery & Requirements Alignment",
                    "date": "2026-09-15"
                },
                {
                    "content": "Northstar Logistics processes 450,000 freight manifests daily across 12 North American distribution hubs. Their existing legacy EDI batch pipeline suffers from 45-minute processing lags during hub handoffs.",
                    "category": "relationship_fact",
                    "meeting_title": "Discovery & Requirements Alignment",
                    "date": "2026-09-15"
                },
                {
                    "content": "Commitment made by our team: Send our SOC2 Type II audit report and EDI adapter technical specifications by September 18. Status: Delivered successfully.",
                    "category": "commitment",
                    "meeting_title": "Discovery & Requirements Alignment",
                    "date": "2026-09-15"
                },
                {
                    "content": "Commitment made by Maya Rao: Share Northstar's legacy EDI 214 and 204 schema samples by September 20. Status: Open/Pending from Northstar team.",
                    "category": "commitment",
                    "meeting_title": "Discovery & Requirements Alignment",
                    "date": "2026-09-15"
                }
            ]

        results = []
        for m in demo_memories:
            try:
                res = await self.aretain_meeting(
                    contact_id=contact_id,
                    content=m["content"],
                    category=m["category"],
                    meeting_title=m["meeting_title"],
                    date=m["date"]
                )
                results.append({"status": "retained", "category": m["category"]})
            except Exception as e:
                results.append({"status": "failed", "error": str(e)})
        return results

hindsight_service = HindsightService()
