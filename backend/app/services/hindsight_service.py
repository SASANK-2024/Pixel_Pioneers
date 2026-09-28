import logging
from typing import List, Optional
from hindsight_client import Hindsight
from backend.app.config import settings
from backend.app.schemas import MemoryItem

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

    async def aretain(self, content: str, context: Optional[str] = "SRE Incident Post-Mortem", tags: Optional[List[str]] = None) -> dict:
        """Asynchronously stores a verified incident fact, post-mortem, runbook, or Q&A interaction into Hindsight."""
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
        """Synchronously stores an incident fact into Hindsight."""
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
        """Asynchronously retrieves semantically relevant historical memories (symptoms, failed fixes, verified runbooks)."""
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

    def recall(self, query: str, limit: int = 5) -> List[MemoryItem]:
        """Synchronously retrieves historical memories."""
        if not self.client:
            logger.warning("Hindsight client is unavailable; returning empty memory.")
            return []
        try:
            response = self.client.recall(
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
            logger.error(f"Hindsight recall error: {e}")
            return []

hindsight_service = HindsightService()
