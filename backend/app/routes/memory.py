from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.schemas import (
    RetainRequest, RetainResponseModel, 
    RecallRequest, RecallResponseModel,
    MemoryItem
)
from backend.app.services.hindsight_service import hindsight_service

router = APIRouter(prefix="/memory", tags=["Hindsight Memory"])

@router.post("/retain", response_model=RetainResponseModel)
def retain_memory(req: RetainRequest):
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
    
    try:
        res = hindsight_service.retain(
            content=req.content,
            context=req.context,
            tags=req.tags
        )
        return RetainResponseModel(
            success=res.get("success", True),
            bank_id=res.get("bank_id", ""),
            items_count=res.get("items_count", 1),
            message="Incident memory retained successfully in Hindsight."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retain memory in Hindsight: {str(e)}")

@router.post("/recall", response_model=RecallResponseModel)
def recall_memory(req: RecallRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    try:
        memories = hindsight_service.recall(query=req.query, limit=req.limit or 5)
        return RecallResponseModel(
            count=len(memories),
            memories=memories
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to recall memories from Hindsight: {str(e)}")

@router.post("/seed-demo")
def seed_demo_incidents():
    """
    Seeds realistic historical incident post-mortems and runbooks for demonstration purposes
    as mandated by Rules 22 & 23.
    """
    demo_records = [
        {
            "content": "INC-101 (checkout-service): PostgreSQL connection pool exhausted due to unclosed sessions in the transaction loop. SRE attempted to scale deployment replicas from 3 to 10 which crashed the primary DB instance. The successful resolution was executing runbook RB-08: recycle PgBouncer client pool and apply max_connections cap.",
            "context": "Post-Mortem: checkout-service DB Pool",
            "tags": ["checkout-service", "postgresql", "runbook-RB08", "failed-scale-up"]
        },
        {
            "content": "INC-104 (auth-service): Redis cluster latency spiked to 2.4s due to unbounded JWT refresh key scans (KEYS *). Flushing the cache caused a cache-stampede that knocked out auth-service completely. Resolution: Runbook RB-14: hot-patch to SCAN with count=100 and warm cache before pod restart.",
            "context": "Post-Mortem: auth-service Redis Spike",
            "tags": ["auth-service", "redis", "runbook-RB14", "failed-cache-flush"]
        },
        {
            "content": "INC-108 (payment-gateway): Webhook delivery backlog accumulated 140,000 unhandled events. Restarting the consumer pods caused double-deduction race conditions on active orders. Runbook RB-21 was created: pause Kafka consumer group offset commit, enable idempotent idempotency-key filter, and drain queue at 200 msg/sec throttle.",
            "context": "Post-Mortem: payment-gateway Webhook Flood",
            "tags": ["payment-gateway", "kafka", "runbook-RB21", "failed-pod-restart"]
        }
    ]

    results = []
    for record in demo_records:
        try:
            res = hindsight_service.retain(
                content=record["content"],
                context=record["context"],
                tags=record["tags"]
            )
            results.append({"status": "retained", "context": record["context"]})
        except Exception as e:
            results.append({"status": "failed", "context": record["context"], "error": str(e)})

    return {"message": "Demo incidents seeding completed", "results": results}
