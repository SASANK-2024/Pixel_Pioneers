import uuid
from datetime import datetime
from typing import Dict, List, Optional
from backend.app.schemas_meeting import Contact, Meeting, Commitment, LearningStage, LearningProgressionResponse

class MeetingStore:
    def __init__(self):
        self.contacts: Dict[str, Contact] = {}
        self.meetings: Dict[str, Meeting] = {}
        self.commitments: Dict[str, Commitment] = {}
        self.reset_demo()

    def reset_demo(self):
        """Resets the store to a deterministic demo state with Maya Rao as hero contact."""
        self.contacts.clear()
        self.meetings.clear()
        self.commitments.clear()

        # Hero Contact: Maya Rao
        contact_id = "contact-maya-rao"
        maya = Contact(
            id=contact_id,
            name="Maya Rao",
            role="VP of Operations",
            company="Northstar Logistics",
            email="maya.rao@northstarlogistics.com",
            relationship_type="Enterprise Prospect",
            avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            summary="Key decision maker evaluating enterprise integration. Manages 450,000 daily freight manifests across 12 North American hubs.",
            preferences=[
                "Prefers concise executive bullet points (no marketing fluff)",
                "Values exact timelines and measurable SLA commitments",
                "Expects direct answers to security and compliance questions"
            ],
            known_concerns=[
                "SOC2 Type II compliance and EU GDPR data sovereignty",
                "Integration disruption to existing legacy EDI systems",
                "Sub-100ms API latency guarantee under peak holiday loads"
            ],
            created_at=datetime.utcnow().isoformat(),
            total_meetings=3,
            open_commitments_count=2
        )
        self.contacts[contact_id] = maya

        # Meeting 1: Initial Discovery & Platform Overview (COMPLETED)
        m1_id = "meeting-1"
        m1 = Meeting(
            id=m1_id,
            contact_id=contact_id,
            title="Discovery & Requirements Alignment",
            meeting_number=1,
            date_time="2026-09-15 10:00 AM EST",
            objective="Understand freight tracking bottlenecks and compliance constraints across 12 hubs.",
            agenda=[
                "Review Northstar current manifest volume (450k/day)",
                "Discuss legacy EDI bottlenecks",
                "Identify security & compliance boundaries"
            ],
            attendees=["Maya Rao (VP Ops)", "Devon Vance (Lead Architect)", "Alex Chen (Account Exec)"],
            status="completed",
            notes_raw=(
                "Maya Rao outlined Northstar's operational scale: 450,000 freight manifests daily. "
                "Current legacy EDI batch pipeline is experiencing 45-minute lag during hub handoffs. "
                "Maya explicitly stated: 'I prefer concise executive bullet points—skip the marketing fluff.' "
                "Major friction point raised: SOC2 Type II compliance audit is scheduled next month, and their CISO "
                "has strict EU GDPR data residency requirements for German routes. "
                "We committed to sending our SOC2 Type II audit report and EDI adapter technical specifications by Sept 18. "
                "Maya committed to providing their legacy EDI 214/204 schema samples by Sept 20."
            ),
            outcome_summary="Strong mutual interest. Next step: Security & Architecture Review meeting once audit reports are delivered.",
            created_at="2026-09-15T11:00:00Z"
        )
        self.meetings[m1_id] = m1

        # Commitments from Meeting 1
        c1 = Commitment(
            id="commit-1",
            contact_id=contact_id,
            meeting_id=m1_id,
            owner="us",
            title="Deliver SOC2 Type II compliance report and EDI adapter spec",
            due_date="2026-09-18",
            status="completed",
            completed_at="2026-09-18T16:30:00Z",
            source_meeting_title=m1.title
        )
        c2 = Commitment(
            id="commit-2",
            contact_id=contact_id,
            meeting_id=m1_id,
            owner="Maya Rao",
            title="Share Northstar legacy EDI 214/204 schema samples",
            due_date="2026-09-20",
            status="open",
            completed_at=None,
            source_meeting_title=m1.title
        )
        self.commitments[c1.id] = c1
        self.commitments[c2.id] = c2

        # Meeting 2: Technical Architecture & Security Deep Dive (UPCOMING / READY TO PREPARE)
        m2_id = "meeting-2"
        m2 = Meeting(
            id=m2_id,
            contact_id=contact_id,
            title="Security Review & Technical Integration",
            meeting_number=2,
            date_time="2026-09-22 02:00 PM EST",
            objective="Address CISO security feedback on EU data sovereignty and evaluate EDI schema ingestion.",
            agenda=[
                "Review SOC2 Type II findings with InfoSec",
                "Clarify EU data residency and KMS key management",
                "Assess pending EDI schema delivery status",
                "Define 30-day sandbox pilot scope"
            ],
            attendees=["Maya Rao (VP Ops)", "Dr. Evelyn Reed (Chief Information Security Officer)", "Alex Chen (Account Exec)"],
            status="upcoming",
            notes_raw=None,
            outcome_summary=None,
            prepared_brief=None,
            created_at="2026-09-16T09:00:00Z"
        )
        self.meetings[m2_id] = m2

        # Meeting 3: Commercial Proposal & Pilot Sign-off (SCHEDULED)
        m3_id = "meeting-3"
        m3 = Meeting(
            id=m3_id,
            contact_id=contact_id,
            title="Commercial Terms & Executive Sign-off",
            meeting_number=3,
            date_time="2026-09-29 03:00 PM EST",
            objective="Finalize enterprise pilot contract, SLA terms (sub-100ms API), and deployment schedule.",
            agenda=[
                "Final SLA terms and throughput guarantees",
                "Tiered volume pricing review (450k/day tier)",
                "Sign-off on 60-day enterprise pilot rollout"
            ],
            attendees=["Maya Rao (VP Ops)", "Liam Patel (CFO)", "Alex Chen (Account Exec)"],
            status="upcoming",
            notes_raw=None,
            outcome_summary=None,
            prepared_brief=None,
            created_at="2026-09-17T14:00:00Z"
        )
        self.meetings[m3_id] = m3

        # Contact 2: David Kim (FinScale Technologies)
        c2_id = "contact-david-kim"
        david = Contact(
            id=c2_id,
            name="David Kim",
            role="VP of Engineering",
            company="FinScale Technologies",
            email="david.kim@finscaletech.com",
            relationship_type="FinTech Enterprise Client",
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            summary="Engineering leader overseeing high-frequency transaction settlement systems across 4 banking gateways.",
            preferences=[
                "Demands architectural diagrams and API specs before commercial discussion",
                "Requires documented rollback and disaster recovery mechanisms",
                "Communicates best via technical deep-dive sessions"
            ],
            known_concerns=[
                "Zero-downtime database migrations during high-volume trading hours",
                "PCI-DSS Level 1 compliance and SOC2 Type II certifications",
                "Strict sub-50ms p99 latency SLA on core transaction routing"
            ],
            created_at=datetime.utcnow().isoformat(),
            total_meetings=2,
            open_commitments_count=1
        )
        self.contacts[c2_id] = david

        m_dk1_id = "meeting-david-1"
        m_dk1 = Meeting(
            id=m_dk1_id,
            contact_id=c2_id,
            title="Infrastructure Discovery & Latency Benchmarks",
            meeting_number=1,
            date_time="2026-09-18 11:00 AM EST",
            objective="Evaluate transaction routing latency bottlenecks across current AWS-GCP multi-cloud setup.",
            agenda=[
                "Review daily settlement volume ($120M daily)",
                "Identify gateway timeout bottlenecks",
                "Discuss high-availability architecture requirements"
            ],
            attendees=["David Kim (VP Eng)", "Sarah Lin (Staff SRE)", "Alex Chen (Account Exec)"],
            status="completed",
            notes_raw=(
                "David Kim emphasized zero-tolerance for latency degradation: p99 must be under 50ms during peak trading. "
                "David stated: 'We reject vendor solutions that require manual failover; everything must be automated with Kubernetes operators.' "
                "David's team agreed to share redacted Prometheus latency traces by Sept 24. "
                "We committed to delivering a multi-region deployment topology and benchmark report by Sept 23."
            ),
            outcome_summary="Great alignment on technical architecture. Next step: Deep dive on automated failover and PCI compliance.",
            created_at="2026-09-18T12:00:00Z"
        )
        self.meetings[m_dk1_id] = m_dk1

        c_dk1 = Commitment(
            id="commit-dk-1",
            contact_id=c2_id,
            meeting_id=m_dk1_id,
            owner="us",
            title="Deliver multi-region deployment topology and benchmark report",
            due_date="2026-09-23",
            status="completed",
            completed_at="2026-09-23T15:00:00Z",
            source_meeting_title=m_dk1.title
        )
        c_dk2 = Commitment(
            id="commit-dk-2",
            contact_id=c2_id,
            meeting_id=m_dk1_id,
            owner="David Kim",
            title="Share redacted Prometheus latency traces and gateway error logs",
            due_date="2026-09-24",
            status="open",
            completed_at=None,
            source_meeting_title=m_dk1.title
        )
        self.commitments[c_dk1.id] = c_dk1
        self.commitments[c_dk2.id] = c_dk2

        m_dk2_id = "meeting-david-2"
        m_dk2 = Meeting(
            id=m_dk2_id,
            contact_id=c2_id,
            title="Failover Resiliency & PCI Compliance Review",
            meeting_number=2,
            date_time="2026-09-25 03:00 PM EST",
            objective="Review automated Kubernetes failover topology, verify sub-50ms latency guarantees, and review PCI-DSS audit requirements.",
            agenda=[
                "Review multi-region Kubernetes operator failover tests",
                "Evaluate Prometheus latency trace samples",
                "Review PCI-DSS audit boundary isolation",
                "Plan 14-day shadow settlement staging pilot"
            ],
            attendees=["David Kim (VP Eng)", "Sarah Lin (Staff SRE)", "Alex Chen (Account Exec)"],
            status="upcoming",
            notes_raw=None,
            outcome_summary=None,
            prepared_brief=None,
            created_at="2026-09-19T10:00:00Z"
        )
        self.meetings[m_dk2_id] = m_dk2

        return {
            "contacts": [maya, david],
            "meetings": [m1, m2, m3, m_dk1, m_dk2],
            "commitments": [c1, c2, c_dk1, c_dk2]
        }

    # Contact methods
    def get_contacts(self) -> List[Contact]:
        return list(self.contacts.values())

    def get_contact(self, contact_id: str) -> Optional[Contact]:
        contact = self.contacts.get(contact_id)
        if contact:
            # Update counts dynamically
            contact.total_meetings = len([m for m in self.meetings.values() if m.contact_id == contact_id])
            contact.open_commitments_count = len([c for c in self.commitments.values() if c.contact_id == contact_id and c.status == "open"])
        return contact

    def create_contact(self, contact: Contact) -> Contact:
        self.contacts[contact.id] = contact
        return contact

    # Meeting methods
    def get_meetings(self, contact_id: str) -> List[Meeting]:
        meetings = [m for m in self.meetings.values() if m.contact_id == contact_id]
        meetings.sort(key=lambda m: m.meeting_number)
        return meetings

    def get_meeting(self, meeting_id: str) -> Optional[Meeting]:
        return self.meetings.get(meeting_id)

    def create_meeting(self, meeting: Meeting) -> Meeting:
        self.meetings[meeting.id] = meeting
        if meeting.contact_id in self.contacts:
            self.contacts[meeting.contact_id].total_meetings = len(
                [m for m in self.meetings.values() if m.contact_id == meeting.contact_id]
            )
        return meeting

    def update_meeting(self, meeting_id: str, updates: dict) -> Optional[Meeting]:
        meeting = self.meetings.get(meeting_id)
        if not meeting:
            return None
        for k, v in updates.items():
            if hasattr(meeting, k):
                setattr(meeting, k, v)
        return meeting

    # Commitment methods
    def get_commitments(self, contact_id: str, status: Optional[str] = None) -> List[Commitment]:
        comms = [c for c in self.commitments.values() if c.contact_id == contact_id]
        if status:
            comms = [c for c in comms if c.status == status]
        return comms

    def create_commitment(self, comm: Commitment) -> Commitment:
        self.commitments[comm.id] = comm
        return comm

    def complete_commitment(self, commitment_id: str, completed: bool = True) -> Optional[Commitment]:
        comm = self.commitments.get(commitment_id)
        if not comm:
            return None
        comm.status = "completed" if completed else "open"
        comm.completed_at = datetime.utcnow().isoformat() if completed else None
        return comm

    # Learning progression
    def get_learning_progression(self, contact_id: str, total_memories_count: int) -> LearningProgressionResponse:
        contact = self.get_contact(contact_id)
        contact_name = contact.name if contact else "Contact"
        
        stages = [
            LearningStage(
                meeting_number=1,
                title="Discovery & Requirements",
                stage_name="Baseline Preparation",
                summary="Zero prior historical context. Preparation relies on standard discovery templates.",
                memories_recalled_count=0,
                behavior_difference="Generic discovery questions; unaware of contact's preference for concise bullet points or SOC2 sensitivities.",
                outcome="Requirements and commitments captured; initial Hindsight relationship memories retained."
            ),
            LearningStage(
                meeting_number=2,
                title="Security & Technical Deep-Dive",
                stage_name="Context-Aware Preparation",
                summary="Recalls M1 commitments, SOC2 compliance priority, and Maya's preference for concise executive briefing.",
                memories_recalled_count=4,
                behavior_difference="Executive brief is strictly formatted in concise bullet points. Proactively flags open commitment regarding EDI schema.",
                outcome="CISO questions addressed directly; unresolved items highlighted; 45-minute lag eliminated from proposal."
            ),
            LearningStage(
                meeting_number=3,
                title="Commercial Terms & Sign-off",
                stage_name="Institutional Memory",
                summary="Deep accumulated context across operational scale (450k manifests), security sign-off, and pilot terms.",
                memories_recalled_count=8,
                behavior_difference="Completely tailored negotiation brief: aligns pricing directly with the 450k manifest tier and quotes past commitments verbatim.",
                outcome="Accelerated contract closing with zero repetitive questions or lost context."
            )
        ]

        return LearningProgressionResponse(
            contact_id=contact_id,
            contact_name=contact_name,
            total_memories_retained=total_memories_count,
            total_meetings=len(self.get_meetings(contact_id)),
            stages=stages
        )

meeting_store = MeetingStore()
