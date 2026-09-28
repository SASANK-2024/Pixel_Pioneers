import React from 'react';
import { Calendar, ListCheck, Brain, ArrowRight, UserCheck } from 'lucide-react';
import type { Contact, Meeting, Commitment } from '../types';

interface DashboardViewProps {
  contact: Contact | null;
  meetings: Meeting[];
  commitments: Commitment[];
  onSelectMeeting: (id: string) => void;
  onGoToPrep: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contact,
  meetings,
  commitments,
  onSelectMeeting,
  onGoToPrep
}) => {
  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming');
  const nextMeeting = upcomingMeetings[0] || meetings[0];
  const openCommitments = commitments.filter(c => c.status === 'open');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>NEXT UPCOMING MEETING</span>
            <Calendar size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            {nextMeeting ? `Meeting #${nextMeeting.meeting_number}` : 'None'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#22d3ee', marginTop: '4px' }}>
            {nextMeeting?.date_time || 'Schedule open'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>ENTERPRISE CONTACTS</span>
            <UserCheck size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            {contact ? 1 : 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {contact?.name} ({contact?.company})
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>OPEN COMMITMENTS</span>
            <ListCheck size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            {openCommitments.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '4px' }}>
            Pending client & team deliverables
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>HINDSIGHT BANK</span>
            <Brain size={18} color="#f472b6" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Persistent
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
            ● Active Long-term Memory
          </div>
        </div>

      </div>

      {/* Hero Meeting Banner */}
      {nextMeeting && (
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#4f46e5', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                MEETING #{nextMeeting.meeting_number}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 600 }}>
                {nextMeeting.date_time}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
              {nextMeeting.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, maxWidth: '650px' }}>
              Objective: {nextMeeting.objective}
            </p>
          </div>

          <button
            onClick={() => {
              onSelectMeeting(nextMeeting.id);
              onGoToPrep();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              padding: '12px 22px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 18px -4px rgba(79, 70, 229, 0.5)'
            }}
          >
            <span>Launch Meeting Brief</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Relationship Timeline */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Relationship Meeting Timeline ({contact?.name} • {contact?.company})
          </h3>
          <button
            onClick={onGoToPrep}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#22d3ee',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              cursor: 'pointer'
            }}
          >
            <Calendar size={14} />
            <span>+ Schedule Next Meeting</span>
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {meetings.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                onSelectMeeting(m.id);
                onGoToPrep();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: m.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.status === 'completed' ? '#34d399' : '#818cf8',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}>
                  #{m.meeting_number}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{m.title}</span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: m.status === 'completed' ? '#34d399' : '#fbbf24',
                      background: m.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    {m.date_time} • {m.objective}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>{m.prepared_brief ? 'View Brief' : 'Prepare'}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
