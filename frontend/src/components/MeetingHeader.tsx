import React from 'react';
import { Brain, Sparkles, RefreshCw, CheckCircle2, Calendar, Target, ListCheck, BookOpen, Database } from 'lucide-react';
import type { HealthResponse } from '../types';

interface MeetingHeaderProps {
  health: HealthResponse | null;
  activeTab: 'prep' | 'dashboard' | 'commitments' | 'memories' | 'learning';
  setActiveTab: (tab: 'prep' | 'dashboard' | 'commitments' | 'memories' | 'learning') => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  health,
  activeTab,
  setActiveTab,
  onResetDemo,
  isResetting
}) => {
  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Value Prop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
          }}>
            <Brain size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
                Meeting Memory AI
              </h1>
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                Hindsight Powered
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Pre-meeting executive briefings backed by persistent relationship memory
            </p>
          </div>
        </div>

        {/* Live Service Telemetry Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#34d399'
          }}>
            <CheckCircle2 size={13} />
            <span>Hindsight: <strong>Connected</strong></span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#cbd5e1'
          }}>
            <Sparkles size={13} color="#818cf8" />
            <span>LLM: <strong>{health?.llm_model || health?.llm?.model || 'openai/gpt-oss-120b'}</strong></span>
          </div>

          {/* Reset Demo State Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#f8fafc',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: isResetting ? 'wait' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={13} className={isResetting ? 'animate-spin' : ''} />
            <span>{isResetting ? 'Resetting Demo...' : 'Reset Demo (Maya Rao)'}</span>
          </button>
        </div>

      </div>

      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'prep', label: 'Meeting Preparation (Hero)', icon: Target },
          { id: 'dashboard', label: 'Upcoming Meetings', icon: Calendar },
          { id: 'commitments', label: 'Commitments Tracker', icon: ListCheck },
          { id: 'memories', label: 'Hindsight Memory Vault', icon: Database },
          { id: 'learning', label: 'Learning Progression', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} color={isActive ? '#818cf8' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
