import os
from dotenv import load_dotenv

load_dotenv()

def test_groq():
    print("--- Testing Groq Connectivity ---")
    from groq import Groq
    groq_api_key = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=groq_api_key)
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Respond with 'Groq is operational' in 5 words or less."}],
        max_tokens=1024
    )
    msg = response.choices[0].message.content.strip()
    reasoning = getattr(response.choices[0].message, "reasoning", None)
    print("Groq Reasoning:", reasoning)
    print("Groq Response:", msg)
    assert len(msg) > 0, "Empty Groq response"
    print(">> Groq Test: SUCCESS")

def test_hindsight():
    print("\n--- Testing Hindsight Connectivity ---")
    from hindsight_client import Hindsight
    base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
    api_key = os.getenv("HINDSIGHT_API_KEY")
    bank_id = os.getenv("HINDSIGHT_BANK_ID", "opshindsight-incidents")
    
    print(f"Connecting to Hindsight at {base_url} (Bank: {bank_id})...")
    client = Hindsight(base_url=base_url, api_key=api_key)
    
    test_fact = "INC-101: PostgreSQL connection pool exhausted due to idle leaked connections from checkout-service. Scaling pod replicas worsened the outage. Solution was executing PgBouncer pool recycle runbook RB-08."
    print("Calling retain...")
    retain_res = client.retain(bank_id=bank_id, content=test_fact, context="SRE Incident Post-Mortem")
    print("Retain response:", retain_res)
    
    print("Calling recall...")
    recall_res = client.recall(bank_id=bank_id, query="What caused the checkout-service outage and did scaling replicas help?")
    print("Recall results count:", len(recall_res))
    for r in recall_res:
        print("Recalled Memory:", r)
    print(">> Hindsight Test: SUCCESS")

if __name__ == "__main__":
    try:
        test_groq()
        test_hindsight()
        print("\nALL PRE-FLIGHT CONNECTIVITY TESTS PASSED!")
    except Exception as e:
        print("\nTest failed with error:", e)
        import traceback
        traceback.print_exc()
