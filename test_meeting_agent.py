import httpx
import json
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')
BASE_URL = "http://127.0.0.1:8000"

def test_meeting_memory_ai():
    client = httpx.Client(base_url=BASE_URL, timeout=60.0)
    
    print("=" * 70)
    print("STEP 1: Testing GET /health")
    res = client.get("/health")
    print(f"Status: {res.status_code}")
    assert res.status_code == 200
    print(">> GET /health: PASSED\n")

    print("=" * 70)
    print("STEP 2: Testing POST /api/demo/reset (Deterministic Hero Demo State)")
    res = client.post("/api/demo/reset")
    print(f"Status: {res.status_code}")
    data = res.json()
    print(f"Hero Contact: {data['contact']['name']} ({data['contact']['company']})")
    print(f"Meetings Count: {data['meetings_count']}")
    print(f"Commitments Count: {data['commitments_count']}")
    assert res.status_code == 200
    assert data["success"] is True
    print(">> POST /api/demo/reset: PASSED\n")

    print("=" * 70)
    print("STEP 3: Testing GET /api/contacts and GET /api/contacts/contact-maya-rao")
    res = client.get("/api/contacts")
    contacts = res.json()
    print(f"Contacts list count: {len(contacts)}")
    assert len(contacts) > 0
    contact_id = contacts[0]["id"]
    
    res_c = client.get(f"/api/contacts/{contact_id}")
    maya = res_c.json()
    print(f"Contact Name: {maya['name']}, Role: {maya['role']}")
    print(f"Preferences: {maya['preferences']}")
    print(f"Open Commitments: {maya['open_commitments_count']}")
    assert maya["name"] == "Maya Rao"
    print(">> GET /api/contacts: PASSED\n")

    print("=" * 70)
    print("STEP 4: Testing GET /api/contacts/{contact_id}/meetings")
    res_m = client.get(f"/api/contacts/{contact_id}/meetings")
    meetings = res_m.json()
    print(f"Meetings retrieved: {len(meetings)}")
    for m in meetings:
        print(f" - [Meeting #{m['meeting_number']}] {m['title']} (Status: {m['status']})")
    assert len(meetings) >= 3
    print(">> GET /api/contacts/.../meetings: PASSED\n")

    print("=" * 70)
    print("STEP 5: Testing POST /api/meetings/meeting-2/prepare (Hindsight Recall & Reasoning)")
    print("Executing Hindsight recall for Meeting 2 (Security & Technical Deep-Dive)...")
    t0 = time.time()
    res_prep = client.post("/api/meetings/meeting-2/prepare")
    latency = round(time.time() - t0, 2)
    print(f"Status: {res_prep.status_code} in {latency}s")
    brief = res_prep.json()
    print("\n--- PREPARED EXECUTIVE BRIEF ---")
    print(f"Overview: {brief['meeting_overview']}")
    print(f"Relationship Summary: {brief['relationship_summary']}")
    print(f"Key Topics: {brief['key_topics']}")
    print(f"Known Concerns: {brief['known_concerns']}")
    print(f"Contact Preferences: {brief['contact_preferences']}")
    print(f"Recommended Questions: {brief['recommended_questions']}")
    
    cslm = brief.get("change_since_last_meeting")
    if cslm:
        print("\n--- SIGNATURE FEATURE: CHANGE SINCE LAST MEETING ---")
        print(f"New Information: {cslm.get('new_information')}")
        print(f"Unresolved Items: {cslm.get('unresolved_items')}")
        print(f"Suggested Questions Today: {cslm.get('suggested_questions_today')}")

    memories_used = brief.get("memories_used", [])
    print(f"\n--- HINDSIGHT MEMORIES RECALLED ({len(memories_used)}) ---")
    for mem in memories_used:
        print(f" * [{mem['category'].upper()}] {mem['text']} (Source: {mem.get('source_meeting')})")
    
    assert res_prep.status_code == 200
    assert len(memories_used) > 0, "Expected Hindsight memories to be recalled!"
    print(">> POST /api/meetings/meeting-2/prepare: PASSED\n")

    print("=" * 70)
    print("STEP 6: Testing GET /api/contacts/{contact_id}/commitments and POST complete")
    res_comm = client.get(f"/api/contacts/{contact_id}/commitments")
    comms = res_comm.json()
    print(f"Total Commitments: {len(comms)}")
    for c in comms:
        print(f" - [{c['status'].upper()}] {c['title']} (Owner: {c['owner']})")
    assert len(comms) >= 2

    # Toggle one commitment
    open_comm = next(c for c in comms if c["status"] == "open")
    res_toggle = client.post(f"/api/commitments/{open_comm['id']}/complete", json={"completed": True})
    assert res_toggle.status_code == 200
    assert res_toggle.json()["status"] == "completed"
    print(f"Successfully completed commitment: {open_comm['title']}")
    print(">> Commitments API: PASSED\n")

    print("=" * 70)
    print("STEP 7: Testing POST /api/meetings/meeting-2/process (Post-Meeting Outcome Capture)")
    m2_notes = (
        "Meeting 2 Outcome: Dr. Evelyn Reed (CISO) approved the SOC2 Type II audit report after reviewing our "
        "automated AWS KMS key rotation schedule. Maya confirmed Northstar EDI team has scheduled the 214/204 "
        "sample delivery for Sept 25. Maya requested adding a 99.95% API uptime SLA clause into the pilot contract. "
        "We committed to drafting the pilot contract with the 99.95% SLA clause by Sept 27."
    )
    res_proc = client.post("/api/meetings/meeting-2/process", json={
        "notes": m2_notes,
        "outcome_summary": "Security cleared; SLA clause requested; EDI samples date confirmed for Sept 25."
    })
    print(f"Status: {res_proc.status_code}")
    proc_data = res_proc.json()
    print(f"Retained memories count: {proc_data['retained_memories_count']}")
    print(f"New commitments created: {len(proc_data['new_commitments'])}")
    assert res_proc.status_code == 200
    assert proc_data["success"] is True
    print(">> POST /api/meetings/meeting-2/process: PASSED\n")

    print("=" * 70)
    print("STEP 8: Testing POST /api/meetings/meeting-3/prepare (Multi-Interaction Accumulated Memory)")
    print("Preparing Meeting 3 (Commercial Terms & Sign-off) with accumulated Hindsight memory from Meetings 1 & 2...")
    res_prep3 = client.post("/api/meetings/meeting-3/prepare")
    assert res_prep3.status_code == 200
    brief3 = res_prep3.json()
    print(f"Meeting 3 Overview: {brief3['meeting_overview']}")
    print(f"Meeting 3 Mem Used Count: {len(brief3['memories_used'])}")
    print(">> POST /api/meetings/meeting-3/prepare: PASSED\n")

    print("=" * 70)
    print("STEP 9: Testing GET /api/contacts/{contact_id}/learning (Progression View)")
    res_learn = client.get(f"/api/contacts/{contact_id}/learning")
    assert res_learn.status_code == 200
    learning = res_learn.json()
    print(f"Contact: {learning['contact_name']}")
    print(f"Total Stages Tracked: {len(learning['stages'])}")
    for stage in learning["stages"]:
        print(f" - [Meeting #{stage['meeting_number']}] {stage['stage_name']}: {stage['summary']}")
        print(f"   Behavior difference: {stage['behavior_difference']}")
    print(">> GET /api/contacts/.../learning: PASSED\n")

    print("=" * 70)
    print("ALL 9 MEETING MEMORY AI BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_meeting_memory_ai()
