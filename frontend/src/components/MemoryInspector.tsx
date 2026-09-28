import React, { useState } from 'react';
import { Database, Search, PlusCircle, AlertOctagon } from 'lucide-react';
import type { MemoryItem } from '../types';
import { recallMemories, retainMemory } from '../api';

interface MemoryInspectorProps {
  activeMemories: MemoryItem[];
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({ activeMemories }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemoryItem[] | null>(null);
  const [searching, setSearching] = useState(false);

  // New Memory retention modal/form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newContext, setNewContext] = useState('SRE Incident Post-Mortem');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await recallMemories(searchQuery, 6);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      await retainMemory(newContent, newContext);
      setSaveSuccess(true);
      setNewContent('');
      setTimeout(() => {
        setSaveSuccess(false);
        setShowAddModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const displayedMemories = searchResults !== null ? searchResults : activeMemories;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Title & Add Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={18} color="#818cf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Hindsight Persistent Memory Store
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Multi-strategy temporal and semantic facts extracted from incident history
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <PlusCircle size={14} />
          <span>Retain Post-Mortem</span>
        </button>
      </div>

      {/* Memory Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recalled memories by symptom, service, or runbook..."
            style={{
              width: '100%',
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '7px 10px 7px 32px',
              color: '#f8fafc',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          style={{
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {searching ? 'Querying...' : 'Recall'}
        </button>
        {searchResults !== null && (
          <button
            type="button"
            onClick={() => setSearchResults(null)}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '7px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Add Memory Modal / Accordion */}
      {showAddModal && (
        <form onSubmit={handleSaveMemory} style={{
          background: '#0b111e',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc' }}>
              Add New Incident Memory to Hindsight:
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
            placeholder="Context (e.g. Post-Mortem RB-08, Failed Action)"
            style={{
              background: '#06090e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#f8fafc',
              fontSize: '0.8rem'
            }}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            placeholder="Incident fact, root cause, or negative outcome to store into persistent memory..."
            style={{
              background: '#06090e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '8px 10px',
              color: '#f8fafc',
              fontSize: '0.8rem',
              resize: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: saveSuccess ? '#059669' : '#4f46e5',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {saving ? 'Retaining...' : saveSuccess ? 'Retained to Hindsight!' : 'Store in Hindsight'}
            </button>
          </div>
        </form>
      )}

      {/* Memory List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
        {displayedMemories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.85rem' }}>
            No memories loaded yet. Click <strong>"Seed Demo Data"</strong> in the top bar to populate realistic historical post-mortems!
          </div>
        ) : (
          displayedMemories.map((m, idx) => {
            const isNegativeMemory = m.text.toLowerCase().includes('crashed') || 
                                     m.text.toLowerCase().includes('failed') || 
                                     m.text.toLowerCase().includes('worsened');
            return (
              <div
                key={idx}
                style={{
                  background: isNegativeMemory ? 'rgba(244, 63, 94, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isNegativeMemory ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isNegativeMemory ? (
                      <span style={{
                        background: 'rgba(244, 63, 94, 0.2)',
                        color: '#f43f5e',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <AlertOctagon size={11} />
                        NEGATIVE MEMORY
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        VERIFIED KNOWLEDGE
                      </span>
                    )}
                    {m.context && (
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {m.context}
                      </span>
                    )}
                  </div>
                  {m.score !== null && m.score !== undefined && (
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                      Score: {roundScore(m.score)}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {m.text}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

function roundScore(score: number): string {
  return score ? score.toFixed(2) : '1.0';
}
