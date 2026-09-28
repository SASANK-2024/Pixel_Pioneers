import type { HealthResponse } from '../types';

interface RecallHeaderProps {
  health: HealthResponse | null;
  loading: boolean;
  activeTab: 'agent' | 'memories' | 'learning' | 'telemetry';
  setActiveTab: (tab: 'agent' | 'memories' | 'learning' | 'telemetry') => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
  onRefresh: () => void;
}

export const RecallHeader: React.FC<RecallHeaderProps> = ({
  health,
  loading,
  activeTab,
  setActiveTab,
  onSeedDemo,
  isSeeding,
  onRefresh
}) => {
  return (
    <header className="card-base" style={{ padding: '16px 24px', marginBottom: '24px', background: '#ffffff' }}>
      
      {/* Top Row: Brand, Engine Telemetry, and Profile */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>neurology</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0b1c30', letterSpacing: '-0.02em' }}>
                RecallAI
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '1.2rem', fontWeight: 300 }}>/</span>
              <span style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 600, background: '#eff0fe', padding: '2px 8px', borderRadius: '6px' }}>
                Hindsight Learning Agent
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.78rem', color: '#64748b' }}>
              <span>Hindsight Engine: <strong style={{ color: '#4f46e5' }}>Active Recall v2.4 (Synapsing)</strong></span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
                99.8% Coherence
              </span>
            </div>
          </div>
        </div>

        {/* Right Badges & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Learning Enabled Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', display: 'inline-block', boxShadow: '0 0 6px #059669' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', letterSpacing: '0.02em' }}>
              Learning enabled
            </span>
          </div>

          {/* Model Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            background: '#eff4ff',
            border: '1px solid #dbeafe',
            fontSize: '0.78rem',
            color: '#1e40af'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3b82f6' }}>memory</span>
            <span style={{ fontWeight: 600 }}>{health?.llm_model || 'openai/gpt-oss-120b'}</span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Refresh System Health & Memories"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '18px',
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }}
            >
              refresh
            </span>
          </button>

          {/* Seed Demo Button */}
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isSeeding ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              opacity: isSeeding ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
            <span>{isSeeding ? 'Seeding Hindsight...' : 'Seed Demo Data'}</span>
          </button>

          {/* User Profile Sharanya */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0b1c30' }}>Sharanya</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#4f46e5',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
            </div>
          </div>

        </div>

      </div>

      {/* Navigation Tabs (Transforming mobile bottom-nav into sleek responsive desktop web tabs) */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid #f1f5f9',
        overflowX: 'auto'
      }}>
        
        <button
          onClick={() => setActiveTab('agent')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeTab === 'agent' ? '1px solid #c7d2fe' : '1px solid transparent',
            background: activeTab === 'agent' ? '#eff0fe' : 'transparent',
            color: activeTab === 'agent' ? '#4f46e5' : '#475569',
            fontWeight: activeTab === 'agent' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '19px', color: activeTab === 'agent' ? '#4f46e5' : '#64748b' }}>smart_toy</span>
          <span>AI Agent (Live Memory Chat)</span>
        </button>

        <button
          onClick={() => setActiveTab('learning')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeTab === 'learning' ? '1px solid #c7d2fe' : '1px solid transparent',
            background: activeTab === 'learning' ? '#eff0fe' : 'transparent',
            color: activeTab === 'learning' ? '#4f46e5' : '#475569',
            fontWeight: activeTab === 'learning' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '19px', color: activeTab === 'learning' ? '#4f46e5' : '#64748b' }}>model_training</span>
          <span>Learning & Evolution</span>
        </button>

        <button
          onClick={() => setActiveTab('memories')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeTab === 'memories' ? '1px solid #c7d2fe' : '1px solid transparent',
            background: activeTab === 'memories' ? '#eff0fe' : 'transparent',
            color: activeTab === 'memories' ? '#4f46e5' : '#475569',
            fontWeight: activeTab === 'memories' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '19px', color: activeTab === 'memories' ? '#4f46e5' : '#64748b' }}>psychology</span>
          <span>Hindsight Memories Store</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeTab === 'telemetry' ? '1px solid #c7d2fe' : '1px solid transparent',
            background: activeTab === 'telemetry' ? '#eff0fe' : 'transparent',
            color: activeTab === 'telemetry' ? '#4f46e5' : '#475569',
            fontWeight: activeTab === 'telemetry' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '19px', color: activeTab === 'telemetry' ? '#4f46e5' : '#64748b' }}>insights</span>
          <span>Telemetry & Architecture</span>
        </button>

      </nav>

    </header>
  );
};
