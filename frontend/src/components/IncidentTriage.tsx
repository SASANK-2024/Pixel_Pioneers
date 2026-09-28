import React, { useState } from 'react';
import { 
  CheckCircle2, Zap, Brain,
  Sparkles, Layers
} from 'lucide-react';
import type { ChatResponse } from '../types';
import { sendIncidentChat } from '../api';

interface IncidentTriageProps {
  onMemoryUsed: (memories: any[]) => void;
  activeService: string;
  setActiveService: (s: string) => void;
}

const PRESET_INCIDENTS = [
  {
    title: 'Checkout-Service: 98% DB Pool Saturation',
    service: 'checkout-service',
    query: 'URGENT: checkout-service latency is 8000ms. DB connection pool is 98% full. Should I scale replicas from 3 to 10 immediately?',
    description: 'Outage threat: Tests Negative Memory. Stateless LLM naively scales pods; Hindsight remembers scale-up crashed primary DB & recommends RB-08.'
  },
  {
    title: 'Auth-Service: Redis Latency Spike (2.4s)',
    service: 'auth-service',
    query: 'ALERT: auth-service Redis cluster response time spiked to 2400ms. Should we flush all cache keys with FLUSHDB?',
    description: 'Outage threat: Stateless LLM suggests cache flush; Hindsight remembers flushing caused cache-stampede outage & recommends Runbook RB-14.'
  },
  {
    title: 'Payment-Gateway: 140k Webhook Backlog',
    service: 'payment-gateway',
    query: 'CRITICAL: payment-gateway webhook queue has 140,000 pending items. Can I restart consumer pods to clear lag?',
    description: 'Outage threat: Stateless LLM restarts pods causing double-charge race conditions; Hindsight recommends RB-21 offset throttle.'
  }
];

export const IncidentTriage: React.FC<IncidentTriageProps> = ({
  onMemoryUsed,
  activeService,
  setActiveService
}) => {
  const [inputQuery, setInputQuery] = useState(PRESET_INCIDENTS[0].query);
  const [environment] = useState('production');
  const [mode, setMode] = useState<'with_memory' | 'without_memory'>('with_memory');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [splitResult, setSplitResult] = useState<{ withMem: ChatResponse | null; withoutMem: ChatResponse | null }>({
    withMem: null,
    withoutMem: null
  });
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (preset: typeof PRESET_INCIDENTS[0]) => {
    setActiveService(preset.service);
    setInputQuery(preset.query);
  };

  const handleTriage = async () => {
    if (!inputQuery.trim()) return;
    setLoading(true);
    setError(null);

    try {
      if (isSplitMode) {
        // Run both simultaneously for live before/after comparison (Rule 20 & 21)
        const [resWith, resWithout] = await Promise.all([
          sendIncidentChat(inputQuery, activeService, 'with_memory', environment),
          sendIncidentChat(inputQuery, activeService, 'without_memory', environment)
        ]);
        setSplitResult({ withMem: resWith, withoutMem: resWithout });
        setResult(resWith);
        onMemoryUsed(resWith.memories_retrieved);
      } else {
        const res = await sendIncidentChat(inputQuery, activeService, mode, environment);
        setResult(res);
        onMemoryUsed(res.memories_retrieved);
      }
    } catch (err: any) {
      setError(err.message || 'Incident triage execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Incident Input Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Top Controls: Service & Preset Scenarios */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Production Incident Scenario:
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Target Service:</span>
              <select
                value={activeService}
                onChange={(e) => setActiveService(e.target.value)}
                style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <option value="checkout-service">checkout-service</option>
                <option value="auth-service">auth-service</option>
                <option value="payment-gateway">payment-gateway</option>
                <option value="inventory-api">inventory-api</option>
              </select>
            </div>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {PRESET_INCIDENTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(p)}
                style={{
                  background: activeService === p.service ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${activeService === p.service ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: activeService === p.service ? '#38bdf8' : '#e2e8f0', marginBottom: '2px' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3 }}>
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Query Input Area */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
            On-Call Incident Query / Error Log:
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              rows={3}
              placeholder="Paste incident alert, symptoms, or proposed mitigation..."
              style={{
                width: '100%',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#f8fafc',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}
            />
          </div>
        </div>

        {/* Mode Selector & Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Split Comparison Toggle */}
            <button
              onClick={() => setIsSplitMode(!isSplitMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isSplitMode ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSplitMode ? '#a855f7' : 'rgba(255, 255, 255, 0.1)'}`,
                color: isSplitMode ? '#d8b4fe' : '#94a3b8',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Layers size={15} />
              <span>Side-by-Side Comparison (Judge Demo)</span>
            </button>

            {!isSplitMode && (
              <div style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '3px'
              }}>
                <button
                  onClick={() => setMode('with_memory')}
                  style={{
                    background: mode === 'with_memory' ? '#0891b2' : 'transparent',
                    color: mode === 'with_memory' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Brain size={14} />
                  <span>With Hindsight Memory</span>
                </button>
                <button
                  onClick={() => setMode('without_memory')}
                  style={{
                    background: mode === 'without_memory' ? '#475569' : 'transparent',
                    color: mode === 'without_memory' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>Stateless Baseline (No Memory)</span>
                </button>
              </div>
            )}
          </div>

          {/* Trigger Triage Button */}
          <button
            onClick={handleTriage}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <Zap size={16} />
            <span>{loading ? 'Diagnosing Incident...' : 'Run Incident Triage'}</span>
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '16px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid #f43f5e',
            color: '#fecdd3',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Response Display: Side-by-Side Split View OR Single View */}
      {isSplitMode && splitResult.withMem && splitResult.withoutMem ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Left: Stateless Baseline */}
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>
                STATELESS LLM (NO MEMORY)
              </div>
              <span style={{ fontSize: '0.75rem', color: '#f43f5e' }}>⚠️ Naively repeats failed actions</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {splitResult.withoutMem.response}
            </div>
          </div>

          {/* Right: OpsHindsight with Memory */}
          <div className="glass-panel-glow" style={{ padding: '20px', borderLeft: '4px solid #06b6d4' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
                  OPSHINDSIGHT (WITH HINDSIGHT MEMORY)
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>🛡️ Recalled {splitResult.withMem.memories_retrieved.length} memories</span>
              </div>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {splitResult.withMem.response}
            </div>
          </div>

        </div>
      ) : result ? (
        /* Single View Response Card */
        <div className="glass-panel-glow" style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: result.mode === 'with_memory' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                color: result.mode === 'with_memory' ? '#38bdf8' : '#94a3b8',
                border: `1px solid ${result.mode === 'with_memory' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(100, 116, 139, 0.4)'}`,
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {result.mode === 'with_memory' ? 'Memory-Powered Remediation Plan' : 'Stateless Baseline Response'}
              </div>

              {result.memories_retrieved.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                  <CheckCircle2 size={15} />
                  <span>Grounded in {result.memories_retrieved.length} Hindsight historical incident memories</span>
                </div>
              )}
            </div>

            {result.reasoning && (
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#a5b4fc',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Sparkles size={13} />
                <span>{showReasoning ? 'Hide AI Reasoning' : 'Show AI Reasoning Trace'}</span>
              </button>
            )}
          </div>

          {/* AI Reasoning Trace Drawer */}
          {showReasoning && result.reasoning && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: '#c7d2fe',
              lineHeight: 1.5
            }}>
              <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain size={14} />
                <span>DeepSeek/GPT-OSS Reasoning Process:</span>
              </div>
              <p style={{ fontStyle: 'italic' }}>{result.reasoning}</p>
            </div>
          )}

          {/* Response Text */}
          <div style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {result.response}
          </div>

          {/* Auto-retention Banner if new fact was saved */}
          {result.new_memory_retained && (
            <div style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#6ee7b7',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>
                <strong>Hindsight Learning Active:</strong> New operational resolution was automatically identified and stored into Hindsight memory!
              </span>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};
