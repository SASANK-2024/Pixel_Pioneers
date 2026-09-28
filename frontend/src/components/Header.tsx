import React from 'react';
import { ShieldCheck, Cpu, Database, Activity, RefreshCw } from 'lucide-react';
import type { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  loading,
  onRefresh,
  onSeedDemo,
  isSeeding
}) => {
  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Title and Persona */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                OpsHindsight
              </h1>
              <span style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                SRE Incident Intelligence
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Persistent Memory Agent Powered by Hindsight • Eliminates Outage Repeat Mistakes
            </p>
          </div>
        </div>

        {/* Live Service Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Hindsight Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem'
          }}>
            <Database size={15} color="#818cf8" />
            <span style={{ color: '#cbd5e1' }}>Hindsight Bank:</span>
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{health?.hindsight_bank || 'opshindsight-incidents'}</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'inline-block',
              boxShadow: '0 0 8px #10b981'
            }} />
          </div>

          {/* LLM Model Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem'
          }}>
            <Cpu size={15} color="#38bdf8" />
            <span style={{ color: '#cbd5e1' }}>Model:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{health?.llm_model || 'openai/gpt-oss-120b'}</span>
          </div>

          {/* Quick Demo Seed Button */}
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isSeeding ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
              opacity: isSeeding ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            title="Seeds realistic historical incidents (INC-101, INC-104, INC-108) into Hindsight"
          >
            <Activity size={14} />
            <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
          </button>

          {/* Refresh Health */}
          <button
            onClick={onRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              padding: '7px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Refresh System Health"
          >
            <RefreshCw size={15} className={loading ? 'status-pulse' : ''} />
          </button>
        </div>

      </div>
    </header>
  );
};
