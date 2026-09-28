import React from 'react';
import { TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export const LearningProgression: React.FC = () => {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(6, 182, 212, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <TrendingUp size={18} color="#06b6d4" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Hindsight SRE Learning Progression
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            How accumulated post-mortem memories prevent repeat downtime over time
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Stage 1 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{
              background: '#475569',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '4px'
            }}>
              INCIDENT #1
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Stateless Baseline</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
            <strong>Behavior:</strong> Generic textbook advice. Suggests scaling deployment replicas to 10 during DB pool saturation.
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={13} />
            <span>Outcome: Crash on Primary PostgreSQL DB.</span>
          </div>
        </div>

        {/* Stage 2 */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{
              background: '#4f46e5',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '4px'
            }}>
              INCIDENT #5
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a5b4fc' }}>Service Context Aware</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
            <strong>Behavior:</strong> Retained root causes and topology. Understands that checkout-service pool leaks stem from unclosed transactions.
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} />
            <span>Outcome: MTTR reduced from 45 min to 12 min.</span>
          </div>
        </div>

        {/* Stage 3 */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.06)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{
              background: '#0891b2',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '4px'
            }}>
              INCIDENT #20
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>Institutional Memory</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
            <strong>Behavior:</strong> Proactive Negative Memory intervention. Immediately warns: <em>"Do NOT scale pods: crashed DB in INC-101. Execute RB-08 PgBouncer pool recycle."</em>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={13} />
            <span>Outcome: Instant recovery under 90 seconds. 0 downtime.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
