import React, { useState } from 'react';
import { 
  Sparkles, Calendar, Clock, HelpCircle, 
  ListTodo, Brain, CheckSquare, Plus, X, Users, UserPlus
} from 'lucide-react';
import type { Contact, Meeting, MeetingBrief } from '../types';
import { prepareMeeting, processMeetingOutcome, createMeeting, createContact } from '../api';

interface MeetingPreparationViewProps {
  contacts: Contact[];
  contact: Contact | null;
  meetings: Meeting[];
  selectedMeetingId: string;
  onSelectContact: (id: string) => void;
  onSelectMeeting: (id: string) => void;
  onMeetingUpdated: () => void;
  onContactCreated: (newContactId: string) => void;
}

export const MeetingPreparationView: React.FC<MeetingPreparationViewProps> = ({
  contacts,
  contact,
  meetings,
  selectedMeetingId,
  onSelectContact,
  onSelectMeeting,
  onMeetingUpdated,
  onContactCreated
}) => {
  const currentMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];
  const [brief, setBrief] = useState<MeetingBrief | null>(currentMeeting?.prepared_brief || null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync brief when selected meeting changes
  React.useEffect(() => {
    if (currentMeeting?.prepared_brief) {
      setBrief(currentMeeting.prepared_brief);
    } else {
      setBrief(null);
    }
    setOutcomeMessage(null);
    setError(null);
  }, [selectedMeetingId, currentMeeting]);

  const handlePrepare = async () => {
    if (!currentMeeting) return;
    setIsPreparing(true);
    setError(null);
    try {
      const data = await prepareMeeting(currentMeeting.id);
      setBrief(data);
      onMeetingUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to prepare meeting brief');
    } finally {
      setIsPreparing(false);
    }
  };

  const handleProcessOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMeeting || !outcomeNotes.trim()) return;
    setIsProcessing(true);
    setOutcomeMessage(null);
    setError(null);
    try {
      const res = await processMeetingOutcome(currentMeeting.id, outcomeNotes);
      setOutcomeMessage(`Successfully extracted and retained ${res.retained_memories_count} durable memories in Hindsight!`);
      setOutcomeNotes('');
      setShowOutcomeForm(false);
      onMeetingUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to process outcome');
    } finally {
      setIsProcessing(false);
    }
  };

  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingObjective, setNewMeetingObjective] = useState('');
  const [newMeetingAgenda, setNewMeetingAgenda] = useState('');
  const [newMeetingAttendees, setNewMeetingAttendees] = useState('');
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

  const handleOpenNewMeetingModal = () => {
    const nextNum = meetings.length + 1;
    setNewMeetingTitle(`Meeting #${nextNum}: Pilot Deployment & SLA Review`);
    setNewMeetingDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] + ' 10:00 AM EST');
    setNewMeetingObjective('Finalize enterprise pilot deployment scope and confirm sub-100ms latency validation parameters.');
    setNewMeetingAgenda('1. Pilot sandbox activation\n2. KMS encryption key validation\n3. Weekly cadence checkpoint');
    setNewMeetingAttendees(`${contact?.name || 'Client'}, DevOps Lead, Account Executive`);
    setShowNewMeetingModal(true);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !newMeetingTitle.trim()) return;
    setIsCreatingMeeting(true);
    setError(null);
    try {
      const nextNum = meetings.length + 1;
      const agendaList = newMeetingAgenda.split('\n').map(s => s.trim()).filter(Boolean);
      const attendeesList = newMeetingAttendees.split(',').map(s => s.trim()).filter(Boolean);
      const created = await createMeeting({
        contact_id: contact.id,
        title: newMeetingTitle.trim(),
        meeting_number: nextNum,
        date_time: newMeetingDate.trim() || 'TBD',
        objective: newMeetingObjective.trim() || 'Ongoing business review',
        agenda: agendaList,
        attendees: attendeesList
      });
      await onMeetingUpdated();
      onSelectMeeting(created.id);
      setShowNewMeetingModal(false);
    } catch (err: any) {
      setError(`Failed to create meeting: ${err.message}`);
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactRelType, setNewContactRelType] = useState('Enterprise Prospect');
  const [newContactSummary, setNewContactSummary] = useState('');
  const [newContactPrefs, setNewContactPrefs] = useState('');
  const [newContactConcerns, setNewContactConcerns] = useState('');
  const [isCreatingContact, setIsCreatingContact] = useState(false);

  const handleOpenNewContactModal = () => {
    setNewContactName('');
    setNewContactRole('VP of Technology');
    setNewContactCompany('');
    setNewContactEmail('');
    setNewContactRelType('Enterprise Prospect');
    setNewContactSummary('Key stakeholder evaluating platform automation and data reliability.');
    setNewContactPrefs('Values concise technical summaries, prefers data-backed metrics');
    setNewContactConcerns('Data privacy and rapid time to production');
    setShowNewContactModal(true);
  };

  const handleCreateContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactCompany.trim()) return;
    setIsCreatingContact(true);
    setError(null);
    try {
      const prefsList = newContactPrefs.split(',').map(s => s.trim()).filter(Boolean);
      const concernsList = newContactConcerns.split(',').map(s => s.trim()).filter(Boolean);
      const created = await createContact({
        name: newContactName.trim(),
        role: newContactRole.trim() || 'Executive',
        company: newContactCompany.trim(),
        email: newContactEmail.trim() || `${newContactName.toLowerCase().replace(/\s+/g, '.')}@${newContactCompany.toLowerCase().replace(/\s+/g, '')}.com`,
        relationship_type: newContactRelType,
        summary: newContactSummary.trim(),
        preferences: prefsList,
        known_concerns: concernsList
      });
      setShowNewContactModal(false);
      onContactCreated(created.id);
    } catch (err: any) {
      setError(`Failed to create contact: ${err.message}`);
    } finally {
      setIsCreatingContact(false);
    }
  };

  if (!contact || !currentMeeting) {
    return <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading meeting details...</div>;
  }

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'preference': return { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' };
      case 'concern_objection': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'commitment': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'decision': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      default: return { bg: 'rgba(99, 102, 241, 0.15)', text: '#a5b4fc', border: 'rgba(99, 102, 241, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Contact Switcher Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={14} color="#818cf8" />
            Executive Contact:
          </span>
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectContact(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: contact.id === c.id ? 800 : 500,
                color: contact.id === c.id ? '#ffffff' : '#94a3b8',
                background: contact.id === c.id ? 'rgba(99, 102, 241, 0.28)' : 'rgba(255, 255, 255, 0.03)',
                border: contact.id === c.id ? '1px solid rgba(99, 102, 241, 0.7)' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <img
                src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`}
                alt={c.name}
                style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span>{c.name} ({c.company})</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenNewContactModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            color: '#34d399',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <UserPlus size={14} />
          <span>+ Add New Person</span>
        </button>
      </div>

      {/* Contact Profile & Meeting Selector Header */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          {/* Contact Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={contact.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
              alt={contact.name}
              style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(99, 102, 241, 0.4)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {contact.name}
                </h2>
                <span style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#22d3ee',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                }}>
                  {contact.relationship_type}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '3px 0 0 0' }}>
                <strong>{contact.role}</strong> at <strong>{contact.company}</strong> ({contact.email})
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0', maxWidth: '650px' }}>
                {contact.summary}
              </p>
            </div>
          </div>

          {/* Meeting Switcher & 1-Click Prepare Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
              {meetings.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectMeeting(m.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: selectedMeetingId === m.id ? 700 : 500,
                    color: selectedMeetingId === m.id ? '#ffffff' : '#94a3b8',
                    background: selectedMeetingId === m.id ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedMeetingId === m.id ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer'
                  }}
                >
                  Meeting #{m.meeting_number}: {m.title.split(' ')[0]} {m.status === 'completed' ? '✓' : ''}
                </button>
              ))}

              <button
                onClick={handleOpenNewMeetingModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#22d3ee',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px dashed rgba(6, 182, 212, 0.45)',
                  cursor: 'pointer'
                }}
                title="Schedule a new meeting for this contact"
              >
                <Plus size={13} />
                <span>+ Schedule Meeting</span>
              </button>
            </div>

            <button
              onClick={handlePrepare}
              disabled={isPreparing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: isPreparing ? 'wait' : 'pointer',
                boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={16} />
              <span>{isPreparing ? 'Recalling Hindsight & Reasoning...' : 'Prepare Executive Brief with Hindsight'}</span>
            </button>
          </div>

        </div>

        {/* Meeting Metadata Sub-bar */}
        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#cbd5e1'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} color="#818cf8" />
              <strong>{currentMeeting.date_time}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} color="#22d3ee" />
              Status: <span style={{ color: currentMeeting.status === 'completed' ? '#34d399' : '#fbbf24', fontWeight: 600 }}>{currentMeeting.status.toUpperCase()}</span>
            </span>
            <span>Objective: <em>{currentMeeting.objective}</em></span>
          </div>

          <button
            onClick={() => setShowOutcomeForm(!showOutcomeForm)}
            style={{
              background: 'transparent',
              border: '1px dashed rgba(99, 102, 241, 0.5)',
              color: '#a5b4fc',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              cursor: 'pointer'
            }}
          >
            {showOutcomeForm ? 'Close Outcome Form' : '+ Record Post-Meeting Outcome'}
          </button>
        </div>

        {/* Outcome Form Modal/Drawer */}
        {showOutcomeForm && (
          <form onSubmit={handleProcessOutcome} style={{ marginTop: '16px', background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#f8fafc' }}>
              Extract & Retain Knowledge from Meeting #{currentMeeting.meeting_number}
            </h4>
            <textarea
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              placeholder="Paste raw notes or outcomes (e.g. Maya confirmed CISO approved SOC2 report; requested 99.95% API SLA; we promised pilot contract by Friday)..."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowOutcomeForm(false)}
                style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: isProcessing ? 'wait' : 'pointer'
                }}
              >
                {isProcessing ? 'Extracting & Retaining...' : 'Extract & Save to Hindsight'}
              </button>
            </div>
          </form>
        )}

        {outcomeMessage && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem' }}>
            ✓ {outcomeMessage}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.8rem' }}>
            ⚠️ {error}
          </div>
        )}

      </div>

      {/* Main Briefing Display */}
      {brief ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Column: Executive Briefing & Key Preparation Blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Signature Feature: Change Since Last Meeting */}
            {brief.change_since_last_meeting && (
              <div className="glass-panel" style={{
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Sparkles size={18} color="#22d3ee" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    Signature Feature: Change Since Last Meeting
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  
                  {/* What is New */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '6px' }}>
                      ⚡ What's New Since Last Call
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {brief.change_since_last_meeting.new_information.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Unresolved Items */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '6px' }}>
                      ⏳ Unresolved Deliverables
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {brief.change_since_last_meeting.unresolved_items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Suggested Questions Today */}
                <div style={{ marginTop: '12px', background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '6px' }}>
                    🎯 Priority Questions to Ask Today
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {brief.change_since_last_meeting.suggested_questions_today.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* Executive Overview & Relationship Trajectory */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0' }}>
                  Executive Briefing
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#f8fafc', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {brief.meeting_overview}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Relationship Trajectory
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {brief.relationship_summary}
                </div>
              </div>

              {/* Contact Preferences & Known Concerns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                
                <div style={{ background: 'rgba(236, 72, 153, 0.04)', border: '1px solid rgba(236, 72, 153, 0.2)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', marginBottom: '8px' }}>
                    ❤️ Contact Preferences (Learned)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {brief.contact_preferences.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', marginBottom: '8px' }}>
                    ⚠️ Known Concerns & Objections
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {brief.known_concerns.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Recommended Questions to Ask */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px 0' }}>
                  Recommended Tactical Discovery Questions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {brief.recommended_questions.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <HelpCircle size={15} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4 }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Preparation Checklist */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px 0' }}>
                  Suggested Preparation Checklist
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {brief.suggested_preparation.map((prep, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <CheckSquare size={13} color="#10b981" />
                      <span>{prep}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Signature Transparency "Why this briefing? / Hindsight Memories Used" */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={18} color="#818cf8" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    Why This Briefing?
                  </h3>
                </div>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {brief.memories_used.length} Hindsight Memories
                </span>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 14px 0' }}>
                Every briefing point is grounded in verified historical interactions retained in Hindsight Cloud.
              </p>

              {/* Memory Cards Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {brief.memories_used.map((mem) => {
                  const style = categoryColor(mem.category);
                  return (
                    <div
                      key={mem.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '10px',
                        padding: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{
                          background: style.bg,
                          color: style.text,
                          border: `1px solid ${style.border}`,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {mem.category.replace('_', ' ')}
                        </span>
                        {mem.relevance_score && (
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            Score: {mem.relevance_score.toFixed(3)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                        {mem.text}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                        Source: {mem.source_meeting || 'Past Call'} {mem.source_date ? `(${mem.source_date})` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Open Commitments for this contact */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ListTodo size={17} color="#34d399" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Accountability & Commitments ({brief.open_commitments.length} Open)
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {brief.open_commitments.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No open commitments pending.</div>
                ) : (
                  brief.open_commitments.map((comm) => (
                    <div key={comm.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: '2px' }}>
                        <span>Owner: {comm.owner}</span>
                        {comm.due_date && <span style={{ color: '#fbbf24' }}>Due: {comm.due_date}</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{comm.title}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Empty / Not yet prepared state */
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
          <Brain size={48} color="#818cf8" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px 0' }}>
            Meeting Brief Not Yet Generated
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '500px', margin: '0 auto 20px auto' }}>
            Click below to recall {contact.name}'s historical interactions, commitments, and preferences from Hindsight Cloud to produce an evidence-backed briefing.
          </p>
          <button
            onClick={handlePrepare}
            disabled={isPreparing}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: isPreparing ? 'wait' : 'pointer',
              boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.5)'
            }}
          >
            {isPreparing ? 'Recalling & Preparing...' : 'Prepare Meeting with Hindsight Memory'}
          </button>
        </div>
      )}

      {/* Schedule New Meeting Modal */}
      {showNewMeetingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            borderRadius: '16px',
            padding: '28px',
            background: '#0d1322',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Schedule New Meeting
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  Add Meeting #{meetings.length + 1} for {contact.name} ({contact.company})
                </p>
              </div>
              <button
                onClick={() => setShowNewMeetingModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  MEETING TITLE
                </label>
                <input
                  type="text"
                  required
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  placeholder="e.g. Meeting #4: Pilot Deployment & SLA Review"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  DATE & TIME
                </label>
                <input
                  type="text"
                  required
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                  placeholder="e.g. 2026-10-06 10:00 AM EST"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  MEETING OBJECTIVE
                </label>
                <textarea
                  required
                  rows={2}
                  value={newMeetingObjective}
                  onChange={(e) => setNewMeetingObjective(e.target.value)}
                  placeholder="What is the primary business goal of this upcoming session?"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  AGENDA TOPICS (one per line)
                </label>
                <textarea
                  rows={2}
                  value={newMeetingAgenda}
                  onChange={(e) => setNewMeetingAgenda(e.target.value)}
                  placeholder="1. Topic A&#10;2. Topic B"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  ATTENDEES (comma-separated)
                </label>
                <input
                  type="text"
                  value={newMeetingAttendees}
                  onChange={(e) => setNewMeetingAttendees(e.target.value)}
                  placeholder="Maya Rao (VP Ops), Alex Chen (Account Exec)"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingMeeting}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: isCreatingMeeting ? 'wait' : 'pointer'
                  }}
                >
                  {isCreatingMeeting ? 'Saving Meeting...' : 'Schedule & Select Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Contact Modal */}
      {showNewContactModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            borderRadius: '16px',
            padding: '28px',
            background: '#0d1322',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Add New Executive Contact
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  Track relationship history & persistent memory for a new person
                </p>
              </div>
              <button
                onClick={() => setShowNewContactModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    ROLE / TITLE
                  </label>
                  <input
                    type="text"
                    value={newContactRole}
                    onChange={(e) => setNewContactRole(e.target.value)}
                    placeholder="e.g. Chief Technology Officer"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    COMPANY / ORG *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactCompany}
                    onChange={(e) => setNewContactCompany(e.target.value)}
                    placeholder="e.g. Apex Cloud Systems"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="e.g. sarah@apexcloud.io"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  RELATIONSHIP TYPE
                </label>
                <select
                  value={newContactRelType}
                  onChange={(e) => setNewContactRelType(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#161e2e',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Enterprise Prospect">Enterprise Prospect</option>
                  <option value="Enterprise Client">Enterprise Client</option>
                  <option value="Strategic Partner">Strategic Partner</option>
                  <option value="Key Stakeholder">Key Stakeholder</option>
                  <option value="Investor / Board">Investor / Board</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  PROFILE SUMMARY & CONTEXT
                </label>
                <textarea
                  rows={2}
                  value={newContactSummary}
                  onChange={(e) => setNewContactSummary(e.target.value)}
                  placeholder="Summary of their responsibilities, scale, and strategic focus..."
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  MEETING PREFERENCES (comma-separated)
                </label>
                <input
                  type="text"
                  value={newContactPrefs}
                  onChange={(e) => setNewContactPrefs(e.target.value)}
                  placeholder="e.g. Prefers concise bullets, requires architecture diagrams"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  KNOWN CONCERNS / SENSITIVITIES (comma-separated)
                </label>
                <input
                  type="text"
                  value={newContactConcerns}
                  onChange={(e) => setNewContactConcerns(e.target.value)}
                  placeholder="e.g. Data residency compliance, latency guarantees"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewContactModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingContact}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: isCreatingContact ? 'wait' : 'pointer'
                  }}
                >
                  {isCreatingContact ? 'Creating Person...' : 'Save & Track Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
