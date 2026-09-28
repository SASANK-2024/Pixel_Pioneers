import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';
import type { LearningProgressionResponse } from '../types';
import { fetchLearningProgression } from '../api';

interface LearningViewProps {
  contactId: string;
}

export const LearningView: React.FC<LearningViewProps> = ({ contactId }) => {
  const [data, setData] = useState<LearningProgressionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchLearningProgression(contactId);
        setData(res);
      } catch (err) {
        console.error('Failed to load learning progression:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contactId]);

  if (loading) {
    return <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading learning progression...</div>;
  }

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={22} color="#06b6d4" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Hindsight Learning Progression Timeline
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              How accumulated relationship context in Hindsight Cloud transforms meeting preparation over time
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '0.82rem', color: '#cbd5e1' }}>
          <span>Contact: <strong>{data.contact_name}</strong></span>
          <span>Tracked Meetings: <strong>{data.total_meetings}</strong></span>
          <span>Active Hindsight Memories: <strong>{data.total_memories_retained}</strong></span>
        </div>
      </div>

      {/* 3-Stage Progression Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {data.stages.map((stage) => {
          const isBaseline = stage.meeting_number === 1;
          const isInstitutional = stage.meeting_number === 3;
          return (
            <div
              key={stage.meeting_number}
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '16px',
                border: isInstitutional 
                  ? '1px solid rgba(6, 182, 212, 0.4)' 
                  : isBaseline 
                  ? '1px solid rgba(255, 255, 255, 0.08)' 
                  : '1px solid rgba(99, 102, 241, 0.35)',
                background: isInstitutional 
                  ? 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)' 
                  : 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{
                  background: isBaseline ? '#475569' : isInstitutional ? '#0891b2' : '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  MEETING #{stage.meeting_number}
                </span>

                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  {stage.memories_recalled_count} Memories Recalled
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
                {stage.stage_name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 14px 0' }}>
                {stage.title}
              </p>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Agent Behavior Difference
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {stage.behavior_difference}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.76rem', color: '#34d399', lineHeight: 1.4 }}>
                <CheckCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Outcome:</strong> {stage.outcome}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Before vs. After Demonstration Table */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 14px 0' }}>
          Before vs. After (Judge Demonstration Story)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', color: '#94a3b8' }}>Dimension</th>
                <th style={{ padding: '12px 16px', color: '#f87171' }}>Stateless AI (Without Memory)</th>
                <th style={{ padding: '12px 16px', color: '#34d399' }}>Meeting Memory AI (With Hindsight)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>Contact Format Preference</td>
                <td style={{ padding: '12px 16px' }}>Outputs long generic marketing paragraphs. Annoyances caused.</td>
                <td style={{ padding: '12px 16px', color: '#34d399', fontWeight: 600 }}>Strictly formats in concise executive bullet points as Maya requested in Call 1.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>Commitment Tracking</td>
                <td style={{ padding: '12px 16px' }}>Forgets promises made; representative asks repetitive questions.</td>
                <td style={{ padding: '12px 16px', color: '#34d399', fontWeight: 600 }}>Tracks pending deliverables (EDI 214/204 schemas) & highlights accountability.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>Change Since Last Meeting</td>
                <td style={{ padding: '12px 16px' }}>None. Re-starts conversation from scratch every session.</td>
                <td style={{ padding: '12px 16px', color: '#34d399', fontWeight: 600 }}>Surfaces what is new, unresolved items, and priority questions for today.</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>Preparation Time</td>
                <td style={{ padding: '12px 16px' }}>25-30 minutes manual note searching.</td>
                <td style={{ padding: '12px 16px', color: '#34d399', fontWeight: 600 }}>Under 3 seconds evidence-backed briefing.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
