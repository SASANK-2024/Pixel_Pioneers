import React, { useState } from 'react';
import { ListCheck, CheckCircle2, Circle, Clock, User } from 'lucide-react';
import type { Commitment } from '../types';
import { completeCommitment } from '../api';

interface CommitmentsViewProps {
  commitments: Commitment[];
  onCommitmentUpdated: () => void;
}

export const CommitmentsView: React.FC<CommitmentsViewProps> = ({
  commitments,
  onCommitmentUpdated
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = commitments.filter(c => {
    if (filter === 'open') return c.status === 'open';
    if (filter === 'completed') return c.status === 'completed';
    return true;
  });

  const handleToggle = async (commitmentId: string, currentStatus: string) => {
    setTogglingId(commitmentId);
    try {
      await completeCommitment(commitmentId, currentStatus !== 'completed');
      onCommitmentUpdated();
    } catch (err) {
      console.error('Failed to toggle commitment:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(52, 211, 153, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ListCheck size={20} color="#34d399" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Cross-Meeting Commitments Tracker
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Durable record of promises, deliverables, and accountability extracted across calls
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {(['all', 'open', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: filter === f ? '#ffffff' : '#94a3b8',
                background: filter === f ? '#4f46e5' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {f} ({f === 'all' ? commitments.length : commitments.filter(c => c.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* Commitments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            No commitments found for this filter.
          </div>
        ) : (
          filtered.map((comm) => {
            const isCompleted = comm.status === 'completed';
            return (
              <div
                key={comm.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: isCompleted ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)',
                  border: isCompleted ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(99, 102, 241, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <button
                    onClick={() => handleToggle(comm.id, comm.status)}
                    disabled={togglingId === comm.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: isCompleted ? '#34d399' : '#64748b'
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>

                  <div>
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: isCompleted ? '#94a3b8' : '#f8fafc',
                      textDecoration: isCompleted ? 'line-through' : 'none'
                    }}>
                      {comm.title}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
                        <User size={12} />
                        Owner: <strong>{comm.owner}</strong>
                      </span>
                      {comm.due_date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                          <Clock size={12} />
                          Due: {comm.due_date}
                        </span>
                      )}
                      <span>Source: {comm.source_meeting_title}</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: isCompleted ? '#34d399' : '#fbbf24' }}>
                  {comm.status}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
