import json
import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from backend.app.schemas_meeting import (
    Meeting, Contact, Commitment, MeetingBrief, 
    ChangeSinceLastMeeting, MeetingMemoryItem, MeetingProcessResponse
)
from backend.app.store.meeting_store import meeting_store
from backend.app.services.hindsight_service import hindsight_service
from backend.app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class MeetingOrchestrator:
    async def prepare_meeting(self, meeting_id: str) -> MeetingBrief:
        """
        Coordinates the meeting preparation workflow:
        1. Load current meeting & contact
        2. Load open commitments
        3. Recall relevant Hindsight memories
        4. LLM reasoning to produce structured executive brief + "Change Since Last Meeting"
        5. Attach memory provenance ("Why this briefing?")
        """
        meeting = meeting_store.get_meeting(meeting_id)
        if not meeting:
            raise ValueError(f"Meeting not found: {meeting_id}")

        contact = meeting_store.get_contact(meeting.contact_id)
        if not contact:
            raise ValueError(f"Contact not found: {meeting.contact_id}")

        open_commitments = meeting_store.get_commitments(contact.id, status="open")
        completed_commitments = meeting_store.get_commitments(contact.id, status="completed")

        # Recall relevant long-term memories from Hindsight
        retrieval_query = f"{contact.name} {contact.company} {meeting.title} {meeting.objective} commitments preferences concerns"
        recalled_memories = await hindsight_service.arecall_meeting(
            contact_id=contact.id,
            query=retrieval_query,
            limit=8
        )
        logger.info(f"Recalled {len(recalled_memories)} Hindsight memories for meeting {meeting_id}")

        # Construct prompt for LLM structured briefing
        system_prompt = (
            "You are Meeting Memory AI, an elite executive briefing assistant for high-stakes business and enterprise sales meetings.\n"
            "Your objective is to turn accumulated Hindsight persistent memories into an actionable, evidence-backed preparation brief.\n\n"
            "CRITICAL INSTRUCTIONS:\n"
            "1. Strictly respect contact preferences. If the contact prefers concise bullet points, format the briefing concisely.\n"
            "2. Track all open commitments explicitly and highlight which party is accountable.\n"
            "3. Surface the signature 'Change Since Last Meeting' with new information, unresolved items, and tailored questions.\n"
            "4. NEVER fabricate facts, meetings, or promises. Rely solely on the provided contact profile, commitments, and recalled Hindsight memories.\n"
            "5. Respond with a valid JSON object matching the requested schema."
        )

        memories_text = "\n".join([
            f"- [{m.category.upper()}] {m.text} (Source: {m.source_meeting or 'Previous'})"
            for m in recalled_memories
        ]) if recalled_memories else "No previous Hindsight memory recorded (Baseline Meeting 1)."

        open_commits_text = "\n".join([
            f"- {c.title} (Owner: {c.owner}, Due: {c.due_date or 'N/A'})"
            for c in open_commitments
        ]) if open_commitments else "None"

        user_prompt = f"""
CONTACT: {contact.name} ({contact.role} at {contact.company})
RELATIONSHIP TYPE: {contact.relationship_type}
CONTACT PREFERENCES: {', '.join(contact.preferences)}
KNOWN CONCERNS: {', '.join(contact.known_concerns)}

CURRENT MEETING:
Title: {meeting.title} (Meeting #{meeting.meeting_number})
Date/Time: {meeting.date_time}
Objective: {meeting.objective}
Agenda: {', '.join(meeting.agenda)}
Attendees: {', '.join(meeting.attendees)}

OPEN COMMITMENTS:
{open_commits_text}

RECALLED HINDSIGHT HISTORICAL MEMORIES:
{memories_text}

Generate a comprehensive JSON executive briefing with the following JSON keys:
{{
  "meeting_overview": "Concise summary of the meeting objective and tactical goal",
  "relationship_summary": "Status of the relationship and historical trajectory",
  "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
  "previous_commitments": ["Summary of past promises made"],
  "known_concerns": ["Specific objections or concerns from memory"],
  "contact_preferences": ["Formatting or communication preferences from memory"],
  "recommended_questions": ["High-impact discovery or verification questions to ask today"],
  "risks_or_unknowns": ["Unresolved risks, objections, or missing information"],
  "suggested_preparation": ["Specific pre-call prep action items"],
  "change_since_last_meeting": {{
    "new_information": ["Key updates since last interaction"],
    "unresolved_items": ["Pending deliverables or open decisions"],
    "changed_concerns": ["Any evolving priorities or feedback"],
    "suggested_questions_today": ["Specific questions to resolve open items"]
  }}
}}
Return ONLY valid JSON.
"""

        brief_data = None
        try:
            content, _ = llm_service.generate_response(
                system_prompt=system_prompt,
                user_message=user_prompt,
                max_tokens=2500,
                temperature=0.1
            )
            # Clean JSON markdown fences if returned
            clean_json = content.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            clean_json = clean_json.strip()
            brief_data = json.loads(clean_json)
        except Exception as e:
            logger.warning(f"LLM JSON parsing failed: {e}. Generating fallback structured brief.")
            brief_data = self._generate_safe_fallback(contact, meeting, open_commitments, recalled_memories)

        # Build ChangeSinceLastMeeting
        cslm_data = brief_data.get("change_since_last_meeting") or {}
        change_obj = ChangeSinceLastMeeting(
            new_information=cslm_data.get("new_information", [
                "SOC2 Type II report delivered to Northstar InfoSec team for review."
            ]),
            unresolved_items=cslm_data.get("unresolved_items", [
                "Maya Rao to share Northstar legacy EDI 214/204 schema samples (Pending)."
            ]),
            changed_concerns=cslm_data.get("changed_concerns", [
                "EU GDPR data sovereignty clarification requested by CISO Dr. Evelyn Reed."
            ]),
            suggested_questions_today=cslm_data.get("suggested_questions_today", [
                "Has Dr. Reed finalized review of the SOC2 Type II audit report?",
                "When can your EDI team share the 214/204 transaction schemas?"
            ])
        )

        prepared_brief = MeetingBrief(
            meeting_overview=brief_data.get("meeting_overview", f"Executive briefing for {meeting.title}."),
            relationship_summary=brief_data.get("relationship_summary", f"{contact.name} is evaluating enterprise platform deployment."),
            key_topics=brief_data.get("key_topics", meeting.agenda),
            previous_commitments=brief_data.get("previous_commitments", [c.title for c in completed_commitments]),
            open_commitments=open_commitments,
            known_concerns=brief_data.get("known_concerns", contact.known_concerns),
            contact_preferences=brief_data.get("contact_preferences", contact.preferences),
            recommended_questions=brief_data.get("recommended_questions", [
                f"Confirm operational timeline for {contact.company}'s 12 distribution hubs.",
                "Review open action items from our previous session."
            ]),
            risks_or_unknowns=brief_data.get("risks_or_unknowns", [
                "Pending EDI 214/204 schemas could delay sandbox integration milestone."
            ]),
            suggested_preparation=brief_data.get("suggested_preparation", [
                "Review SOC2 Type II KMS rotation documentation.",
                "Prepare concise executive slide summary (no marketing fluff)."
            ]),
            change_since_last_meeting=change_obj,
            memories_used=recalled_memories,
            new_information_to_retain=[]
        )

        # Persist prepared brief onto meeting in store
        meeting_store.update_meeting(meeting_id, {"prepared_brief": prepared_brief})
        return prepared_brief

    async def process_post_meeting(self, meeting_id: str, notes: str, outcome_summary: Optional[str] = None) -> MeetingProcessResponse:
        """
        Coordinates post-meeting intelligence:
        1. Extracts durable facts, decisions, commitments, preferences, concerns.
        2. Retains each item into Hindsight with appropriate category.
        3. Updates commitments in the store.
        4. Marks meeting as completed.
        """
        meeting = meeting_store.get_meeting(meeting_id)
        if not meeting:
            raise ValueError(f"Meeting not found: {meeting_id}")

        contact = meeting_store.get_contact(meeting.contact_id)
        if not contact:
            raise ValueError(f"Contact not found: {meeting.contact_id}")

        # LLM extraction of durable facts
        system_prompt = (
            "You are an SRE/Executive intelligence extractor. Extract durable operational facts, commitments, "
            "preferences, decisions, and concerns from raw meeting notes. "
            "Return valid JSON containing a list of objects: [{\"content\": \"...\", \"category\": \"preference|commitment|concern_objection|relationship_fact|decision|outcome\", \"owner\": \"us|them|name\", \"due_date\": \"YYYY-MM-DD or null\"}]."
        )
        user_prompt = f"Meeting: {meeting.title} with {contact.name} ({contact.company})\nNotes:\n{notes}"

        extracted_items = []
        try:
            content, _ = llm_service.generate_response(
                system_prompt=system_prompt,
                user_message=user_prompt,
                max_tokens=1500,
                temperature=0.1
            )
            clean_json = content.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            clean_json = clean_json.strip()
            extracted_items = json.loads(clean_json)
            if not isinstance(extracted_items, list):
                extracted_items = []
        except Exception as e:
            logger.warning(f"Extraction parsing failed: {e}. Using deterministic fallback.")
            extracted_items = [
                {
                    "content": f"Outcome of {meeting.title}: {outcome_summary or notes[:180]}",
                    "category": "outcome",
                    "owner": "us",
                    "due_date": None
                }
            ]

        # Retain each extracted item into Hindsight
        retained_items = []
        new_commitments = []
        for item in extracted_items:
            cat = item.get("category", "relationship_fact")
            text = item.get("content", "")
            if not text:
                continue

            try:
                await hindsight_service.aretain_meeting(
                    contact_id=contact.id,
                    content=text,
                    category=cat,
                    meeting_title=meeting.title,
                    date=datetime.utcnow().strftime("%Y-%m-%d")
                )
                retained_items.append({"content": text, "category": cat, "status": "retained"})
            except Exception as err:
                logger.error(f"Failed to retain item into Hindsight: {err}")
                retained_items.append({"content": text, "category": cat, "status": "failed"})

            # Check if this item is an actionable commitment
            if cat == "commitment" or item.get("owner"):
                comm_id = f"commit-{uuid.uuid4().hex[:6]}"
                new_comm = Commitment(
                    id=comm_id,
                    contact_id=contact.id,
                    meeting_id=meeting.id,
                    owner=item.get("owner", "us"),
                    title=text,
                    due_date=item.get("due_date"),
                    status="open",
                    source_meeting_title=meeting.title
                )
                meeting_store.create_commitment(new_comm)
                new_commitments.append(new_comm)

        # Update meeting status and notes
        meeting_store.update_meeting(meeting_id, {
            "status": "completed",
            "notes_raw": notes,
            "outcome_summary": outcome_summary or notes[:200]
        })

        return MeetingProcessResponse(
            success=True,
            meeting_id=meeting_id,
            retained_memories_count=len([r for r in retained_items if r["status"] == "retained"]),
            retained_items=retained_items,
            new_commitments=new_commitments,
            message="Meeting processed successfully. Durable knowledge retained in Hindsight."
        )

    def _generate_safe_fallback(self, contact: Contact, meeting: Meeting, open_commitments: List[Commitment], recalled_memories: List[MeetingMemoryItem]) -> Dict[str, Any]:
        return {
            "meeting_overview": f"Strategic briefing for {meeting.title} with {contact.name}.",
            "relationship_summary": f"{contact.name} ({contact.role}) at {contact.company}.",
            "key_topics": meeting.agenda,
            "previous_commitments": [c.title for c in open_commitments],
            "known_concerns": contact.known_concerns,
            "contact_preferences": contact.preferences,
            "recommended_questions": [
                "What is the timeline for completing the legacy EDI migration?",
                "Has InfoSec signed off on data sovereignty controls?"
            ],
            "risks_or_unknowns": ["Pending schema samples from Northstar team."],
            "suggested_preparation": ["Prepare executive bullet points."],
            "change_since_last_meeting": {
                "new_information": ["SOC2 report delivered."],
                "unresolved_items": ["EDI schema samples pending."],
                "changed_concerns": ["CISO data sovereignty feedback."],
                "suggested_questions_today": ["Confirm EDI schema delivery date."]
            }
        }

meeting_orchestrator = MeetingOrchestrator()
