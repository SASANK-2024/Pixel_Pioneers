import React, { useState, useEffect } from 'react';
import { MeetingHeader } from './components/MeetingHeader';
import { MeetingPreparationView } from './components/MeetingPreparationView';
import { DashboardView } from './components/DashboardView';
import { CommitmentsView } from './components/CommitmentsView';
import { MemoriesVaultView } from './components/MemoriesVaultView';
import { LearningView } from './components/LearningView';
import type { Contact, Meeting, Commitment, HealthResponse } from './types';
import { fetchHealth, fetchContacts, fetchContactMeetings, fetchContactCommitments, resetDemoState } from './api';

const DEFAULT_CONTACT: Contact = {
  id: "contact-maya-rao",
  name: "Maya Rao",
  role: "VP of Operations",
  company: "Northstar Logistics",
  email: "maya.rao@northstarlogistics.com",
  relationship_type: "Enterprise Prospect",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  summary: "Key decision maker evaluating enterprise integration. Manages 450,000 daily freight manifests across 12 North American hubs.",
  preferences: [
    "Prefers concise executive bullet points (no marketing fluff)",
    "Values exact timelines and measurable SLA commitments",
    "Expects direct answers to security and compliance questions"
  ],
  known_concerns: [
    "SOC2 Type II compliance and EU GDPR data sovereignty",
    "Integration disruption to existing legacy EDI systems",
    "Sub-100ms API latency guarantee under peak holiday loads"
  ],
  created_at: new Date().toISOString(),
  total_meetings: 3,
  open_commitments_count: 1
};

const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: "meeting-1",
    contact_id: "contact-maya-rao",
    title: "Discovery & Requirements Alignment",
    meeting_number: 1,
    date_time: "2026-09-15 10:00 AM EST",
    objective: "Understand freight tracking bottlenecks and compliance constraints across 12 hubs.",
    agenda: [
      "Review Northstar current manifest volume (450k/day)",
      "Discuss legacy EDI bottlenecks",
      "Identify security & compliance boundaries"
    ],
    attendees: ["Maya Rao (VP Ops)", "Devon Vance (Lead Architect)", "Alex Chen (Account Exec)"],
    status: "completed",
    notes_raw: "Maya Rao outlined Northstar's operational scale: 450,000 freight manifests daily. Current legacy EDI batch pipeline is experiencing 45-minute lag during hub handoffs.",
    created_at: "2026-09-15T11:00:00Z"
  },
  {
    id: "meeting-2",
    contact_id: "contact-maya-rao",
    title: "Security Review & Technical Integration",
    meeting_number: 2,
    date_time: "2026-09-22 02:00 PM EST",
    objective: "Address CISO security feedback on EU data sovereignty and evaluate EDI schema ingestion.",
    agenda: [
      "Review SOC2 Type II findings with InfoSec",
      "Clarify EU data residency and KMS key management",
      "Assess pending EDI schema delivery status",
      "Define 30-day sandbox pilot scope"
    ],
    attendees: ["Maya Rao (VP Ops)", "Dr. Evelyn Reed (Chief Information Security Officer)", "Alex Chen (Account Exec)"],
    status: "upcoming",
    created_at: "2026-09-16T09:00:00Z"
  },
  {
    id: "meeting-3",
    contact_id: "contact-maya-rao",
    title: "Commercial Terms & Executive Sign-off",
    meeting_number: 3,
    date_time: "2026-09-29 03:00 PM EST",
    objective: "Finalize enterprise pilot contract, SLA terms (sub-100ms API), and deployment schedule.",
    agenda: [
      "Final SLA terms and throughput guarantees",
      "Tiered volume pricing review (450k/day tier)",
      "Sign-off on 60-day enterprise pilot rollout"
    ],
    attendees: ["Maya Rao (VP Ops)", "Liam Patel (CFO)", "Alex Chen (Account Exec)"],
    status: "upcoming",
    created_at: "2026-09-17T14:00:00Z"
  }
];

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'prep' | 'dashboard' | 'commitments' | 'memories' | 'learning'>('prep');
  
  const [contacts, setContacts] = useState<Contact[]>([DEFAULT_CONTACT]);
  const [activeContact, setActiveContact] = useState<Contact | null>(DEFAULT_CONTACT);
  const [meetings, setMeetings] = useState<Meeting[]>(DEFAULT_MEETINGS);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('meeting-2');
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  const loadData = async (preserveContactId?: string) => {
    try {
      const [h, cts] = await Promise.all([
        fetchHealth(),
        fetchContacts()
      ]);
      setHealth(h);
      if (cts && cts.length > 0) {
        setContacts(cts);
        const targetId = preserveContactId || activeContact?.id || cts[0].id;
        const contact = cts.find(c => c.id === targetId) || cts[0];
        setActiveContact(contact);
        const [mts, cms] = await Promise.all([
          fetchContactMeetings(contact.id),
          fetchContactCommitments(contact.id)
        ]);
        if (mts && mts.length > 0) {
          setMeetings(mts);
          if (!mts.some(m => m.id === selectedMeetingId)) {
            const upcoming = mts.find(m => m.status === 'upcoming') || mts[0];
            setSelectedMeetingId(upcoming.id);
          }
        } else {
          setMeetings([]);
        }
        setCommitments(cms || []);
      }
    } catch (err) {
      console.warn('Initial backend fetch warning (using verified default state):', err);
    }
  };

  const handleSelectContact = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    setActiveContact(contact);
    try {
      const [mts, cms] = await Promise.all([
        fetchContactMeetings(contact.id),
        fetchContactCommitments(contact.id)
      ]);
      setMeetings(mts || []);
      setCommitments(cms || []);
      const upcoming = (mts || []).find(m => m.status === 'upcoming') || (mts || [])[0];
      if (upcoming) setSelectedMeetingId(upcoming.id);
    } catch (err) {
      console.error('Failed to switch contact:', err);
    }
  };

  const handleContactCreated = async (newContactId: string) => {
    await loadData(newContactId);
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoState();
      await loadData();
    } catch (err) {
      console.error('Reset demo error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <MeetingHeader
        health={health}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1, paddingBottom: '32px' }}>
        
        {/* Tab 1: Hero Meeting Preparation */}
        {activeTab === 'prep' && (
          <MeetingPreparationView
            contacts={contacts}
            contact={activeContact}
            meetings={meetings}
            selectedMeetingId={selectedMeetingId}
            onSelectContact={handleSelectContact}
            onSelectMeeting={(id) => setSelectedMeetingId(id)}
            onMeetingUpdated={() => loadData(activeContact?.id)}
            onContactCreated={handleContactCreated}
          />
        )}

        {/* Tab 2: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardView
            contact={activeContact}
            meetings={meetings}
            commitments={commitments}
            onSelectMeeting={(id) => setSelectedMeetingId(id)}
            onGoToPrep={() => setActiveTab('prep')}
          />
        )}

        {/* Tab 3: Commitments Tracker */}
        {activeTab === 'commitments' && (
          <CommitmentsView
            commitments={commitments}
            onCommitmentUpdated={loadData}
          />
        )}

        {/* Tab 4: Hindsight Memory Vault */}
        {activeTab === 'memories' && (
          <MemoriesVaultView meetingId={selectedMeetingId} />
        )}

        {/* Tab 5: Learning Progression Timeline */}
        {activeTab === 'learning' && activeContact && (
          <LearningView contactId={activeContact.id} />
        )}

      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        Meeting Memory AI • HackWithHyderabad 3.0 • Built with <strong>Vectorize Hindsight Memory</strong> &amp; <strong>Groq LLM</strong>
      </footer>

    </div>
  );
};

export default App;
