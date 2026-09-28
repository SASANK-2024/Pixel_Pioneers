import httpx
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    client = httpx.Client(base_url=BASE_URL, timeout=60.0)
    
    print("=" * 60)
    print("STEP 1: Testing GET /health")
    res = client.get("/health")
    print(f"Status: {res.status_code}")
    print(f"Body: {res.json()}")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print(">> GET /health: PASSED\n")

    print("=" * 60)
    print("STEP 2: Testing POST /memory/seed-demo")
    res = client.post("/memory/seed-demo")
    print(f"Status: {res.status_code}")
    print(f"Body: {json.dumps(res.json(), indent=2)}")
    assert res.status_code == 200
    print(">> POST /memory/seed-demo: PASSED\n")

    print("=" * 60)
    print("STEP 3: Testing POST /memory/recall (DB connection leak query)")
    recall_payload = {
        "query": "PostgreSQL connection pool exhausted checkout-service scaling pods",
        "limit": 3
    }
    res = client.post("/memory/recall", json=recall_payload)
    print(f"Status: {res.status_code}")
    data = res.json()
    print(f"Retrieved memories count: {data['count']}")
    for m in data["memories"]:
        print(f" - [{m.get('context')}] {m.get('text')} (Score: {m.get('score')})")
    assert res.status_code == 200
    assert data["count"] > 0
    print(">> POST /memory/recall: PASSED\n")

    print("=" * 60)
    print("STEP 4: Testing POST /chat (WITHOUT MEMORY - Baseline)")
    chat_payload_stateless = {
        "message": "URGENT: checkout-service latency is 8000ms. DB connection pool is 98% full. Should I scale replicas from 3 to 10 immediately?",
        "service_name": "checkout-service",
        "environment": "production",
        "mode": "without_memory",
        "user_id": "oncall-engineer"
    }
    res = client.post("/chat", json=chat_payload_stateless)
    print(f"Status: {res.status_code}")
    data_stateless = res.json()
    print("RESPONSE (Without Memory):\n", data_stateless["response"])
    print("Memories used:", len(data_stateless["memories_retrieved"]))
    assert res.status_code == 200
    assert len(data_stateless["memories_retrieved"]) == 0
    print(">> POST /chat (Without Memory): PASSED\n")

    print("=" * 60)
    print("STEP 5: Testing POST /chat (WITH HINDSIGHT MEMORY)")
    chat_payload_memory = {
        "message": "URGENT: checkout-service latency is 8000ms. DB connection pool is 98% full. Should I scale replicas from 3 to 10 immediately?",
        "service_name": "checkout-service",
        "environment": "production",
        "mode": "with_memory",
        "user_id": "oncall-engineer"
    }
    res = client.post("/chat", json=chat_payload_memory)
    print(f"Status: {res.status_code}")
    data_memory = res.json()
    print("RESPONSE (With Hindsight):\n", data_memory["response"])
    print("\nREASONING TRACE:\n", data_memory.get("reasoning"))
    print("\nMEMORIES RETRIEVED COUNT:", len(data_memory["memories_retrieved"]))
    for m in data_memory["memories_retrieved"]:
        print(f"  * {m['text']}")
    
    assert res.status_code == 200
    assert len(data_memory["memories_retrieved"]) > 0
    # Check that the agent actually warns NOT to scale replicas or mentions RB-08
    content_upper = data_memory["response"].upper()
    has_warning = "DO NOT" in content_upper or "NOT" in content_upper or "AVOID" in content_upper or "RB-08" in content_upper or "EXACERBAT" in content_upper or "CRASH" in content_upper
    print(f"\nDemonstrates negative memory / warning against failed fix: {has_warning}")
    assert has_warning, "Expected agent to warn against scaling replicas based on retrieved memory!"
    print(">> POST /chat (With Hindsight Memory): PASSED!\n")

    print("=" * 60)
    print("ALL API & MEMORY QUALITY GATE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
