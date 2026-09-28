import React, { useState, useRef, useEffect } from 'react';
import type { ChatResponse, MemoryItem } from '../types';
import { sendIncidentChat } from '../api';

interface IncidentTriageProps {
  onMemoryUsed: (memories: MemoryItem[]) => void;
  activeService: string;
  setActiveService: (s: string) => void;
}

interface MessageEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string | null;
  mode?: string;
  memories?: MemoryItem[];
  newMemoryRetained?: boolean;
  timestamp: string;
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
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitResult, setSplitResult] = useState<{ withMem: ChatResponse | null; withoutMem: ChatResponse | null }>({
    withMem: null,
    withoutMem: null
  });
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSelectPreset = (preset: typeof PRESET_INCIDENTS[0]) => {
    setActiveService(preset.service);
    setInputQuery(preset.query);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearHistory = () => {
    setMessages([]);
    setSplitResult({ withMem: null, withoutMem: null });
  };

  const handleTriage = async () => {
    if (!inputQuery.trim()) return;
    const currentQuery = inputQuery.trim();
    setInputQuery('');
    setLoading(true);
    setError(null);

    const historyPayload = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const userMessageId = `user-${Date.now()}`;
    const newMessages: MessageEntry[] = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: currentQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);

    try {
      if (isSplitMode) {
        const [resWith, resWithout] = await Promise.all([
          sendIncidentChat(currentQuery, activeService, 'with_memory', historyPayload, environment),
          sendIncidentChat(currentQuery, activeService, 'without_memory', historyPayload, environment)
        ]);
        setSplitResult({ withMem: resWith, withoutMem: resWithout });
        onMemoryUsed(resWith.memories_retrieved);

        setMessages([
          ...newMessages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: resWith.response,
            reasoning: resWith.reasoning,
            mode: 'with_memory',
            memories: resWith.memories_retrieved,
            newMemoryRetained: resWith.new_memory_retained,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        const res = await sendIncidentChat(currentQuery, activeService, mode, historyPayload, environment);
        onMemoryUsed(res.memories_retrieved);

        setMessages([
          ...newMessages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: res.response,
            reasoning: res.reasoning,
            mode: res.mode,
            memories: res.memories_retrieved,
            newMemoryRetained: res.new_memory_retained,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Incident triage execution failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoning(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Incident Control Panel */}
      <div className="card-base" style={{ padding: '24px', background: '#ffffff' }}>
        
        {/* Scenarios and Service Picker */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#464555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Production Incident Scenario:
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#777587' }}>Target Service:</span>
              <select
                value={activeService}
                onChange={(e) => setActiveService(e.target.value)}
                style={{
                  background: '#f8faff',
                  color: '#3525cd',
                  border: '1px solid #c7d2fe',
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
                  background: activeService === p.service ? '#eff0fe' : '#ffffff',
                  border: `1px solid ${activeService === p.service ? '#4f46e5' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeService === p.service ? '0 2px 8px rgba(79, 70, 229, 0.12)' : 'none'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: activeService === p.service ? '#3525cd' : '#0b1c30', marginBottom: '2px' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#464555', lineHeight: 1.3 }}>
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0b1c30' }}>
              On-Call Incident Query / Follow-up Question:
            </label>
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#777587',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>restart_alt</span>
                <span>Reset Chat History</span>
              </button>
            )}
          </div>
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTriage();
              }
            }}
            rows={2}
            placeholder="Type your incident alert, or ask about previous questions/answers (e.g. 'what was the answer to my previous question?')..."
            style={{
              width: '100%',
              background: '#f8faff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#0b1c30',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Split Comparison Toggle */}
            <button
              onClick={() => setIsSplitMode(!isSplitMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isSplitMode ? '#f5f3ff' : '#f8faff',
                border: `1px solid ${isSplitMode ? '#7c3aed' : '#e2e8f0'}`,
                color: isSplitMode ? '#7c3aed' : '#464555',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>compare_arrows</span>
              <span>Side-by-Side Comparison (Judge Demo)</span>
            </button>

            {!isSplitMode && (
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '3px'
              }}>
                <button
                  onClick={() => setMode('with_memory')}
                  style={{
                    background: mode === 'with_memory' ? '#ffffff' : 'transparent',
                    color: mode === 'with_memory' ? '#3525cd' : '#464555',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: mode === 'with_memory' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>psychology</span>
                  <span>With Hindsight Memory</span>
                </button>
                <button
                  onClick={() => setMode('without_memory')}
                  style={{
                    background: mode === 'without_memory' ? '#ffffff' : 'transparent',
                    color: mode === 'without_memory' ? '#ba1a1a' : '#464555',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: mode === 'without_memory' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <span>Stateless Baseline (No Memory)</span>
                </button>
              </div>
            )}
          </div>

          {/* Run Button */}
          <button
            onClick={handleTriage}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bolt</span>
            <span>{loading ? 'Consulting Hindsight...' : 'Run Incident Triage'}</span>
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#ba1a1a',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Side-by-Side Live Comparison Panel (if triggered) */}
      {isSplitMode && splitResult.withMem && splitResult.withoutMem && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Stateless Column */}
          <div className="card-base" style={{ padding: '20px', borderLeft: '4px solid #ba1a1a', background: '#fef2f2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '3px 8px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 800 }}>
                STATELESS BASELINE (NO MEMORY)
              </div>
              <span style={{ fontSize: '0.75rem', color: '#ba1a1a' }}>⚠️ Naively repeats failed actions</span>
            </div>
            <FormattedContent content={splitResult.withoutMem.response} isBaseline />
          </div>

          {/* OpsHindsight Column */}
          <div className="card-elevated" style={{ padding: '20px', borderLeft: '4px solid #059669', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 800 }}>
                  RECALLAI + HINDSIGHT MEMORY
                </div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>🛡️ Grounded in {splitResult.withMem.memories_retrieved.length} memories</span>
              </div>
            </div>
            <FormattedContent content={splitResult.withMem.response} />
          </div>

        </div>
      )}

      {/* Continuous Conversation Thread */}
      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.role === 'assistant' ? 'card-elevated' : 'card-base'}
              style={{
                padding: '20px',
                background: msg.role === 'user' ? '#f8faff' : '#ffffff',
                borderLeft: msg.role === 'user' ? '4px solid #4f46e5' : '4px solid #059669'
              }}
            >
              {/* Message Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {msg.role === 'user' ? (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#eff0fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4f46e5'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                    </div>
                  ) : (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>smart_toy</span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: msg.role === 'user' ? '#3525cd' : '#047857' }}>
                      {msg.role === 'user' ? 'Sharanya (On-Call SRE)' : 'RecallAI Assistant'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#777587', marginLeft: '8px' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* Right badges & copy button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {msg.role === 'assistant' && msg.mode && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: msg.mode === 'with_memory' ? '#ecfdf5' : '#fef2f2',
                      color: msg.mode === 'with_memory' ? '#047857' : '#ba1a1a'
                    }}>
                      {msg.mode === 'with_memory' ? 'HINDSIGHT MEMORY' : 'STATELESS'}
                    </span>
                  )}
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#777587',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                    title="Copy message text"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: copiedId === msg.id ? '#059669' : '#777587' }}>
                      {copiedId === msg.id ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <FormattedContent content={msg.content} isUser={msg.role === 'user'} />

              {/* Memory Grounding Footnote for Assistant */}
              {msg.role === 'assistant' && msg.memories && msg.memories.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: '#464555'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#047857' }}>
                    <span className="material-symbols-outlined material-symbols-fill" style={{ fontSize: '15px' }}>verified</span>
                    <span>Grounded in {msg.memories.length} Hindsight historical incident memories</span>
                  </div>

                  {msg.reasoning && (
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#4f46e5',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>psychology</span>
                      <span>{expandedReasoning[msg.id] ? 'Hide Reasoning' : 'View AI Reasoning Trace'}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        {expandedReasoning[msg.id] ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Expandable Reasoning Trace */}
              {expandedReasoning[msg.id] && msg.reasoning && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: '#f8faff',
                  border: '1px solid #c7d2fe',
                  fontSize: '0.78rem',
                  color: '#3525cd',
                  lineHeight: 1.5,
                  fontStyle: 'italic'
                }}>
                  <strong>AI Reasoning Trace:</strong> {msg.reasoning}
                </div>
              )}

            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

    </div>
  );
};

interface FormattedContentProps {
  content: string;
  isUser?: boolean;
  isBaseline?: boolean;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ content, isUser, isBaseline }) => {
  if (isUser) {
    return (
      <div style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {content}
      </div>
    );
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = (keyPrefix: number) => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1).filter(row => !row.every(cell => /^[-: ]+$/.test(cell)));
      elements.push(
        <div key={`table-${keyPrefix}`} style={{ overflowX: 'auto', margin: '14px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '0.86rem', color: '#0f172a' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {header.map((col, idx) => (
                  <th key={idx} style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                    {renderInline(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rIdx) => (
                <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#ffffff' : '#f8faff' }}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ border: '1px solid #e2e8f0', padding: '8px 12px', color: '#0f172a' }}>
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inTable) flushTable(i);
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} style={{ background: '#0f172a', color: '#38bdf8', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', margin: '10px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.84rem' }}>
            <code>{codeBlockBuffer.join('\n')}</code>
          </pre>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${i}`} style={{ fontSize: '1.25rem', fontWeight: 800, color: isBaseline ? '#991b1b' : '#0f172a', margin: '16px 0 8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '4px' }}>
          {line.replace('# ', '')}
        </h2>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} style={{ fontSize: '1.1rem', fontWeight: 700, color: isBaseline ? '#991b1b' : '#0f172a', margin: '14px 0 6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '3px' }}>
          {line.replace('## ', '')}
        </h3>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} style={{ fontSize: '0.98rem', fontWeight: 700, color: isBaseline ? '#991b1b' : '#0f172a', margin: '12px 0 4px' }}>
          {line.replace('### ', '')}
        </h4>
      );
      continue;
    }

    // Bullet points
    if (/^[-*]\s+/.test(line.trim())) {
      elements.push(
        <div key={`li-${i}`} style={{ display: 'flex', gap: '8px', marginBottom: '5px', alignItems: 'flex-start', color: '#0f172a' }}>
          <span style={{ color: isBaseline ? '#ba1a1a' : '#4f46e5', fontWeight: 800, marginTop: '-1px' }}>•</span>
          <div style={{ flex: 1, color: '#0f172a' }}>{renderInline(line.trim().replace(/^[-*]\s+/, ''))}</div>
        </div>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(line.trim())) {
      const numMatch = line.trim().match(/^(\d+)\.\s+/);
      const num = numMatch ? numMatch[1] : '1';
      elements.push(
        <div key={`ol-${i}`} style={{ display: 'flex', gap: '8px', marginBottom: '5px', alignItems: 'flex-start', color: '#0f172a' }}>
          <span style={{ color: isBaseline ? '#ba1a1a' : '#4f46e5', fontWeight: 700, fontSize: '0.85rem', minWidth: '18px' }}>{num}.</span>
          <div style={{ flex: 1, color: '#0f172a' }}>{renderInline(line.trim().replace(/^\d+\.\s+/, ''))}</div>
        </div>
      );
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={`sp-${i}`} style={{ height: '8px' }} />);
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} style={{ margin: '0 0 8px', color: '#0f172a', lineHeight: 1.65 }}>
        {renderInline(line)}
      </p>
    );
  }

  if (inTable) flushTable(lines.length);

  return (
    <div className="markdown-body" style={{ color: '#0f172a', fontSize: '0.92rem', lineHeight: 1.7 }}>
      {elements}
    </div>
  );
};

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={{ background: '#eff0fe', color: '#3525cd', padding: '2px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.88em', fontWeight: 600 }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#0f172a', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
